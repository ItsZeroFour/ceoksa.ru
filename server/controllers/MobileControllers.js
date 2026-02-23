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
    if (!phone || !/^7\d{10}$/.test(phone)) {
      console.warn("Неверный формат номера");
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

    await AuthTransaction.create({
      auth_req_id,
      correlation_id: correlationId,
      phone,
      status: "pending",
      client_notification_token: clientNotificationToken,
      expires_at: new Date(Date.now() + expires_in * 1000),
    });

    res.json({
      success: true,
      auth_req_id,
      expires_in,
      hhe_uri: hhe_uri || null,
      message: "Ожидайте PUSH-уведомления или SMS с кодом подтверждения",
    });
  } catch (error) {
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
    if (!auth_req_id || !smsotp_endpoint || !send) {
      console.warn("Отсутствуют обязательные параметры");
      return res.status(400).json({
        error: "invalid_request",
        message: "Отсутствуют обязательные параметры",
      });
    }

    const transaction = await AuthTransaction.findOne({ auth_req_id });

    if (!transaction) {
      console.warn("Транзакция не найдена:", auth_req_id);
      return res.status(404).json({
        error: "not_found",
        message: "Транзакция не найдена или истекла",
      });
    }

    if (
      transaction.client_notification_token &&
      !validateBearerToken(req, transaction.client_notification_token)
    ) {
      console.warn("Неверный client_notification_token для", auth_req_id);
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

    res.status(200).end();
  } catch (error) {
    console.error("Ошибка обработки SMS OTP:", error);
    res.status(500).json({
      error: "server_error",
      message: error.message,
    });
  }
};

export const verifySmsCode = async (req, res) => {
  try {
    const { auth_req_id, code } = req.body;
    if (!auth_req_id || !code) {
      return res.status(400).json({
        error: "invalid_request",
        message: "Требуется auth_req_id и code",
      });
    }

    const transaction = await AuthTransaction.findOne({ auth_req_id });

    if (!transaction) {
      return res.status(404).json({
        error: "not_found",
        message: "Транзакция не найдена или истекла",
      });
    }

    if (transaction.status !== "sms_sent") {
      return res.status(400).json({
        error: "invalid_state",
        message: "SMS код ещё не отправлен или уже использован",
      });
    }

    if (!transaction.smsotp_endpoint) {
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

    const response = await axios.post(transaction.smsotp_endpoint, payload, {
      headers: { "Content-Type": "application/json" },
      validateStatus: () => true,
    });

    if (response.status === 200) {
      res.json({
        success: true,
        message: "Код подтверждения принят, ожидайте завершения аутентификации",
      });
    } else {
      console.error("Неверный код:", response.data);
      res.status(400).json({
        error: "invalid_code",
        message: response.data?.error_description || "Неверный код",
        retry_count: response.data?.retry_count,
      });
    }
  } catch (error) {
    console.error("Ошибка верификации кода:", error);
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

    if (!auth_req_id) {
      console.warn("Отсутствует auth_req_id");
      return res.status(400).json({
        error: "invalid_request",
        message: "Отсутствует auth_req_id",
      });
    }

    const transaction = await AuthTransaction.findOne({ auth_req_id });

    if (!transaction) {
      console.warn("Транзакция не найдена:", auth_req_id);
      return res.status(404).json({
        error: "not_found",
        message: "Транзакция не найдена",
      });
    }

    if (
      transaction.client_notification_token &&
      !validateBearerToken(req, transaction.client_notification_token)
    ) {
      console.warn("Неверный client_notification_token для", auth_req_id);
      return res.status(401).json({
        error: "unauthorized",
        message: "Неверный Authorization token",
      });
    }

    if (error) {
      console.warn("Аутентификация не удалась:", {
        auth_req_id,
        error,
        error_description,
      });

      const canRetry =
        error === "access_denied" &&
        typeof error_description === "string" &&
        (error_description.includes("client cancelled") ||
          error_description.includes("user_denied") ||
          error_description.includes("cancelled"));

      await AuthTransaction.findOneAndUpdate(
        { auth_req_id },
        {
          status: "failed",
          error,
          error_description,
          can_retry: canRetry,
        }
      );

      return res.status(204).end();
    }

    if (!id_token || !access_token) {
      console.error("Отсутствуют токены в notification");
      return res.status(400).json({
        error: "invalid_request",
        message: "Отсутствуют токены",
      });
    }

    let decoded;
    try {
      decoded = await verifyIdToken(id_token);
    } catch (verifyError) {
      console.error("Ошибка верификации id_token:", verifyError.message);

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
        $set: {
          mts_sub: decoded.sub,
          lastAuthAt: new Date(),
        },
        $setOnInsert: {
          phone: transaction.phone,
          total_loans: 0,
          is_loan_arrears: false,
          total_debt: 0,
        },
      },
      { upsert: true, new: true }
    );

    await AuthTransaction.findOneAndUpdate(
      { auth_req_id },
      {
        status: "success",
        access_token,
        id_token,
        sub: decoded.sub,
      }
    );

    res.status(204).end();
  } catch (error) {
    console.error("Ошибка обработки notification:", error);
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
      console.warn("Транзакция не найдена:", auth_req_id);
      return res.status(404).json({
        error: "not_found",
        message: "Транзакция не найдена",
      });
    }

    if (
      transaction.expires_at &&
      new Date() > transaction.expires_at &&
      transaction.status === "pending"
    ) {
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
    }

    if (transaction.status === "failed") {
      response.error = transaction.error;
      response.error_description = transaction.error_description;
      response.can_retry = transaction.can_retry || false;
    }

    res.json(response);
  } catch (error) {
    console.error("Ошибка проверки статуса:", error);
    res.status(500).json({
      error: "server_error",
      message: error.message,
    });
  }
};

export const finalizeAuth = async (req, res) => {
  try {
    const { auth_req_id } = req.params;
    const transaction = await AuthTransaction.findOne({
      auth_req_id,
      status: "success",
    });

    if (!transaction) {
      console.warn("Успешная транзакция не найдена:", auth_req_id);
      return res.status(404).json({
        error: "not_found",
        message: "Успешная транзакция не найдена",
      });
    }

    const user = await User.findOne({ mts_sub: transaction.sub });

    if (!user) {
      console.warn("Пользователь не найден");
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
    console.error("Ошибка финализации аутентификации:", error);
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
    res.setHeader("Content-Type", "application/json");
    res.send(jwks);
  } catch (err) {
    console.error("Ошибка чтения JWKS:", err);
    res.status(500).json({ error: "Failed to load JWKS" });
  }
};
