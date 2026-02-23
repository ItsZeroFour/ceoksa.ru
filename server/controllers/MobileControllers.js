import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import axios from "axios";
import crypto from "crypto";
import { generateRequestJWT, verifyIdToken } from "../utils/jwtHelper.js";
import User from "../models/User.js";
import AuthTransaction from "../models/AuthTransaction.js";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MTS_ENDPOINT = process.env.MTS_ENDPOINT;
const CLIENT_ID = process.env.CLIENT_ID;
const BASE_URL = process.env.BASE_URL || "https://ceoksa.ru/api";

const validateBearerToken = (req, expectedToken) => {
  const authHeader = req.headers["authorization"] || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return false;
  return token === expectedToken;
};

export const initiateAuth = async (req, res) => {
  try {
    const { phone } = req.body;
    console.log(`[initiateAuth] Запрос авторизации для номера: ${phone}`);

    if (!phone || !/^7\d{10}$/.test(phone)) {
      console.warn("[initiateAuth] Неверный формат номера:", phone);
      return res.status(400).json({
        error: "invalid_request",
        message: "Номер телефона должен быть в формате 79001234567",
      });
    }

    const correlationId = crypto.randomUUID();
    const clientNotificationToken = process.env.CLIENT_NOTIFICATION_TOKEN;

    const requestJWT = generateRequestJWT({
      phoneNumber: phone,
      notificationUri: `${BASE_URL}/mobile/notifications`,
      clientNotificationToken,
      correlationId,
    });

    console.log(
      `[initiateAuth] Отправляем запрос в МТС. correlationId: ${correlationId}`
    );

    const response = await axios.post(
      MTS_ENDPOINT,
      {
        client_id: CLIENT_ID.trim(),
        response_type: "mc_si_async_code",
        scope: "openid mc_authn",
        request: requestJWT,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const { auth_req_id, expires_in, hhe_uri } = response.data;

    console.log(`[initiateAuth] МТС ответил успешно:`, {
      auth_req_id,
      expires_in,
      hhe_uri: hhe_uri || "нет (push/sms режим)",
      flow: hhe_uri ? "seamless" : "push→sms",
    });

    await AuthTransaction.create({
      auth_req_id,
      correlation_id: correlationId,
      phone,
      status: "pending",
      client_notification_token: clientNotificationToken,
      expires_at: new Date(Date.now() + expires_in * 1000),
    });

    console.log(
      `[initiateAuth] Транзакция создана в БД. auth_req_id: ${auth_req_id}`
    );

    res.json({
      success: true,
      auth_req_id,
      expires_in,
      hhe_uri: hhe_uri || null,
      message: "Ожидайте PUSH-уведомления или SMS с кодом подтверждения",
    });
  } catch (error) {
    console.error("[initiateAuth] Ошибка:", {
      status: error.response?.status,
      error: error.response?.data?.error,
      description: error.response?.data?.error_description,
      message: error.message,
    });
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || "server_error",
      message:
        error.response?.data?.error_description || "Внутренняя ошибка сервера",
    });
  }
};

export const handleSmsOtp = async (req, res) => {
  try {
    const { auth_req_id, smsotp_endpoint, send } = req.body;
    console.log(`[handleSmsOtp] Получена SMS-OTP нотификация:`, {
      auth_req_id,
      smsotp_endpoint,
      send,
    });

    if (!auth_req_id || !smsotp_endpoint || !send) {
      console.warn("[handleSmsOtp] Отсутствуют обязательные параметры");
      return res.status(400).json({
        error: "invalid_request",
        message: "Отсутствуют обязательные параметры",
      });
    }

    const transaction = await AuthTransaction.findOne({ auth_req_id });

    if (!transaction) {
      console.warn("[handleSmsOtp] Транзакция не найдена:", auth_req_id);
      return res.status(404).json({
        error: "not_found",
        message: "Транзакция не найдена или истекла",
      });
    }

    if (
      transaction.client_notification_token &&
      !validateBearerToken(req, transaction.client_notification_token)
    ) {
      console.warn("[handleSmsOtp] Неверный Bearer токен для:", auth_req_id);
      return res.status(401).json({
        error: "unauthorized",
        message: "Неверный Authorization token",
      });
    }

    await AuthTransaction.findOneAndUpdate(
      { auth_req_id },
      {
        status: "sms_sent",
        smsotp_endpoint,
        send_payload: send,
      }
    );

    console.log(
      `[handleSmsOtp] Транзакция обновлена → status: sms_sent. Ждём ввода кода от пользователя.`
    );
    res.status(200).end();
  } catch (error) {
    console.error("[handleSmsOtp] Ошибка:", error.message);
    res.status(500).json({
      error: "server_error",
      message: error.message,
    });
  }
};

export const verifySmsCode = async (req, res) => {
  try {
    const { auth_req_id, code } = req.body;
    console.log(
      `[verifySmsCode] Проверка кода для auth_req_id: ${auth_req_id}, код: ${code}`
    );

    if (!auth_req_id || !code) {
      return res.status(400).json({
        error: "invalid_request",
        message: "Требуется auth_req_id и code",
      });
    }

    const transaction = await AuthTransaction.findOne({ auth_req_id });

    if (!transaction) {
      console.warn("[verifySmsCode] Транзакция не найдена:", auth_req_id);
      return res.status(404).json({
        error: "not_found",
        message: "Транзакция не найдена или истекла",
      });
    }

    console.log(`[verifySmsCode] Статус транзакции: ${transaction.status}`);

    if (transaction.status !== "sms_sent") {
      console.warn(
        `[verifySmsCode] Неверный статус транзакции: ${transaction.status}, ожидается sms_sent`
      );
      return res.status(400).json({
        error: "invalid_state",
        message: "SMS код ещё не отправлен или уже использован",
      });
    }

    if (!transaction.smsotp_endpoint) {
      console.warn("[verifySmsCode] Отсутствует smsotp_endpoint в транзакции");
      return res.status(400).json({
        error: "invalid_state",
        message: "Отсутствует endpoint для верификации",
      });
    }

    const payload = { ...transaction.send_payload };
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "enter_otp_code") {
        payload[key] = code;
      }
    });

    console.log(
      `[verifySmsCode] Отправляем код в МТС на: ${transaction.smsotp_endpoint}`,
      payload
    );

    const response = await axios.post(transaction.smsotp_endpoint, payload, {
      headers: { "Content-Type": "application/json" },
      validateStatus: () => true,
    });

    console.log(
      `[verifySmsCode] Ответ МТС: статус ${response.status}`,
      response.data
    );

    if (response.status === 200) {
      console.log(
        `[verifySmsCode] Код принят МТС. Ожидаем финальную нотификацию.`
      );
      res.json({
        success: true,
        message: "Код подтверждения принят, ожидайте завершения аутентификации",
      });
    } else {
      console.warn(
        `[verifySmsCode] Неверный код. Осталось попыток: ${
          response.data?.retry_count ?? "н/д"
        }`
      );
      res.status(400).json({
        error: "invalid_code",
        message: response.data?.error_description || "Неверный код",
        retry_count: response.data?.retry_count,
      });
    }
  } catch (error) {
    console.error("[verifySmsCode] Ошибка:", error.message);
    res.status(500).json({
      error: "server_error",
      message: error.response?.data?.error_description || error.message,
    });
  }
};

export const handleNotification = async (req, res) => {
  try {
    const { auth_req_id, id_token, access_token, error, error_description } =
      req.body;

    console.log(`[handleNotification] Получена нотификация от МТС:`, {
      auth_req_id,
      hasIdToken: !!id_token,
      hasAccessToken: !!access_token,
      error: error || null,
      error_description: error_description || null,
    });

    if (!auth_req_id) {
      console.warn("[handleNotification] Отсутствует auth_req_id");
      return res.status(400).json({
        error: "invalid_request",
        message: "Отсутствует auth_req_id",
      });
    }

    const transaction = await AuthTransaction.findOne({ auth_req_id });

    if (!transaction) {
      console.warn("[handleNotification] Транзакция не найдена:", auth_req_id);
      return res.status(404).json({
        error: "not_found",
        message: "Транзакция не найдена",
      });
    }

    if (
      transaction.client_notification_token &&
      !validateBearerToken(req, transaction.client_notification_token)
    ) {
      console.warn(
        "[handleNotification] Неверный Bearer токен для:",
        auth_req_id
      );
      return res.status(401).json({
        error: "unauthorized",
        message: "Неверный Authorization token",
      });
    }

    if (error) {
      const canRetry =
        error === "access_denied" &&
        typeof error_description === "string" &&
        (error_description.includes("client cancelled") ||
          error_description.includes("user_denied") ||
          error_description.includes("cancelled"));

      console.warn(`[handleNotification] Аутентификация не удалась:`, {
        auth_req_id,
        error,
        error_description,
        canRetry,
        phone: transaction.phone,
      });

      await AuthTransaction.findOneAndUpdate(
        { auth_req_id },
        { status: "failed", error, error_description, can_retry: canRetry }
      );

      return res.status(204).end();
    }

    if (!id_token || !access_token) {
      console.error("[handleNotification] Токены отсутствуют в нотификации");
      return res.status(400).json({
        error: "invalid_request",
        message: "Отсутствуют токены",
      });
    }

    let decoded;
    try {
      decoded = await verifyIdToken(id_token);
      console.log(
        `[handleNotification] id_token верифицирован. sub: ${decoded.sub}`
      );
    } catch (verifyError) {
      console.error(
        "[handleNotification] Ошибка верификации id_token:",
        verifyError.message
      );

      await AuthTransaction.findOneAndUpdate(
        { auth_req_id },
        {
          status: "failed",
          error: "token_verification_failed",
          error_description: verifyError.message,
          can_retry: false,
        }
      );

      return res.status(204).end();
    }

    await User.findOneAndUpdate(
      { phone: transaction.phone },
      {
        $set: { mts_sub: decoded.sub, lastAuthAt: new Date() },
        $setOnInsert: {
          phone: transaction.phone,
          total_loans: 0,
          is_loan_arrears: false,
          total_debt: 0,
        },
      },
      { upsert: true, new: true }
    );

    console.log(
      `[handleNotification] Пользователь обновлён в БД. phone: ${transaction.phone}, sub: ${decoded.sub}`
    );

    await AuthTransaction.findOneAndUpdate(
      { auth_req_id },
      { status: "success", access_token, id_token, sub: decoded.sub }
    );

    console.log(
      `[handleNotification] Транзакция завершена успешно. auth_req_id: ${auth_req_id}`
    );
    res.status(204).end();
  } catch (error) {
    console.error("[handleNotification] Критическая ошибка:", error.message);
    res.status(500).json({
      error: "server_error",
      message: error.message,
    });
  }
};

export const checkAuthStatus = async (req, res) => {
  try {
    const { auth_req_id } = req.params;
    const transaction = await AuthTransaction.findOne({ auth_req_id });

    if (!transaction) {
      console.warn("[checkAuthStatus] Транзакция не найдена:", auth_req_id);
      return res.status(404).json({
        error: "not_found",
        message: "Транзакция не найдена",
      });
    }

    // Логируем только НЕ-304 статусы чтобы не засорять консоль polling'ом
    if (transaction.status !== "pending") {
      console.log(
        `[checkAuthStatus] auth_req_id: ${auth_req_id} → статус: ${transaction.status}`
      );
    }

    if (
      transaction.expires_at &&
      new Date() > transaction.expires_at &&
      transaction.status === "pending"
    ) {
      console.warn(
        `[checkAuthStatus] Транзакция истекла. auth_req_id: ${auth_req_id}`
      );
      await AuthTransaction.findOneAndUpdate(
        { auth_req_id },
        { status: "expired" }
      );
      return res.json({ status: "expired", phone: transaction.phone });
    }

    const response = {
      status: transaction.status,
      phone: transaction.phone,
    };

    if (transaction.status === "success") {
      const user = await User.findOne({ mts_sub: transaction.sub });
      if (user) {
        response.user = {
          id: user._id,
          phone: user.phone,
          mts_sub: user.mts_sub,
          fullName: user.fullName,
          email: user.email,
          lastAuthAt: user.lastAuthAt,
        };
      }
      console.log(
        `[checkAuthStatus] Успешная авторизация. user: ${user?.phone}`
      );
    }

    if (transaction.status === "failed") {
      response.error = transaction.error;
      response.error_description = transaction.error_description;
      response.can_retry = transaction.can_retry || false;
      console.warn(
        `[checkAuthStatus] Статус failed. error: ${transaction.error}, can_retry: ${response.can_retry}`
      );
    }

    res.json(response);
  } catch (error) {
    console.error("[checkAuthStatus] Ошибка:", error.message);
    res.status(500).json({
      error: "server_error",
      message: error.message,
    });
  }
};

export const finalizeAuth = async (req, res) => {
  try {
    const { auth_req_id } = req.params;
    console.log(
      `[finalizeAuth] Запрос финализации. auth_req_id: ${auth_req_id}`
    );

    const transaction = await AuthTransaction.findOne({
      auth_req_id,
      status: "success",
    });

    if (!transaction) {
      console.warn(
        "[finalizeAuth] Успешная транзакция не найдена:",
        auth_req_id
      );
      return res.status(404).json({
        error: "not_found",
        message: "Успешная транзакция не найдена",
      });
    }

    const user = await User.findOne({ mts_sub: transaction.sub });

    if (!user) {
      console.warn(
        "[finalizeAuth] Пользователь не найден. sub:",
        transaction.sub
      );
      return res.status(404).json({
        error: "not_found",
        message: "Пользователь не найден",
      });
    }

    const appToken = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.APP_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("app_token", appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log(
      `[finalizeAuth] Токен выдан. userId: ${user._id}, phone: ${user.phone}`
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        phone: user.phone,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("[finalizeAuth] Ошибка:", error.message);
    res.status(500).json({
      error: "server_error",
      message: error.message,
    });
  }
};

export const getJwks = (req, res) => {
  try {
    const jwksPath = path.join(__dirname, "../jwks.json");
    const jwks = fs.readFileSync(jwksPath, "utf8");
    console.log("[getJwks] JWKS запрошен МТС");
    res.setHeader("Content-Type", "application/json");
    res.send(jwks);
  } catch (err) {
    console.error("[getJwks] Ошибка чтения JWKS:", err.message);
    res.status(500).json({ error: "Failed to load JWKS" });
  }
};
