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

// 🔹 1. Логирование инициации аутентификации
export const initiateAuth = async (req, res) => {
  console.log("🔐 [PUSH] initiateAuth вызван");
  console.log("📱 [PUSH] Номер телефона:", req.body?.phone);

  try {
    const { phone } = req.body;
    if (!phone || !/^7\d{10}$/.test(phone)) {
      console.warn("⚠️ [PUSH] Неверный формат номера");
      return res.status(400).json({
        error: "invalid_request",
        message: "Номер телефона должен быть в формате 79001234567",
      });
    }

    const correlationId = crypto.randomUUID();
    const clientNotificationToken = process.env.CLIENT_NOTIFICATION_TOKEN;

    console.log("📝 [PUSH] correlationId:", correlationId);
    console.log(
      "🔗 [PUSH] notificationUri:",
      `${BASE_URL}/mobile/notifications`
    );

    const requestJWT = generateRequestJWT({
      phoneNumber: phone,
      notificationUri: `${BASE_URL}/mobile/notifications`,
      clientNotificationToken,
      correlationId,
    });

    console.log("📤 [PUSH] Отправка запроса в МТС...");
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
    console.log("✅ [PUSH] Ответ от МТС получен");
    console.log("🆔 [PUSH] auth_req_id:", auth_req_id);
    console.log("⏱️ [PUSH] expires_in:", expires_in);
    console.log("🌐 [PUSH] hhe_uri:", hhe_uri || "нет (PUSH/SMS)");

    await AuthTransaction.create({
      auth_req_id,
      correlation_id: correlationId,
      phone,
      status: "pending",
      client_notification_token: clientNotificationToken,
      expires_at: new Date(Date.now() + expires_in * 1000),
    });

    console.log("💾 [PUSH] Транзакция сохранена в БД со статусом: pending");

    res.json({
      success: true,
      auth_req_id,
      expires_in,
      hhe_uri: hhe_uri || null,
      message: "Ожидайте PUSH-уведомления или SMS с кодом подтверждения",
    });
  } catch (error) {
    console.error("❌ [PUSH] Ошибка инициации аутентификации:");
    console.error("   Status:", error.response?.status);
    console.error("   Data:", error.response?.data);
    console.error("   Message:", error.message);

    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || "server_error",
      message:
        error.response?.data?.error_description || "Внутренняя ошибка сервера",
    });
  }
};

// 🔹 2. Логирование получения SMS OTP notification (fallback)
export const handleSmsOtp = async (req, res) => {
  console.log("📨 [SMS] handleSmsOtp вызван");
  console.log("🆔 [SMS] auth_req_id:", req.body?.auth_req_id);

  try {
    const { auth_req_id, smsotp_endpoint, send } = req.body;
    if (!auth_req_id || !smsotp_endpoint || !send) {
      console.warn("⚠️ [SMS] Отсутствуют обязательные параметры");
      return res.status(400).json({
        error: "invalid_request",
        message: "Отсутствуют обязательные параметры",
      });
    }

    const transaction = await AuthTransaction.findOne({ auth_req_id });

    if (!transaction) {
      console.warn("⚠️ [SMS] Транзакция не найдена:", auth_req_id);
      return res.status(404).json({
        error: "not_found",
        message: "Транзакция не найдена или истекла",
      });
    }

    if (
      transaction.client_notification_token &&
      !validateBearerToken(req, transaction.client_notification_token)
    ) {
      console.warn(
        "⚠️ [SMS] Неверный client_notification_token для",
        auth_req_id
      );
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

    console.log("✅ [SMS] Транзакция обновлена: status = sms_sent");

    res.status(200).end();
  } catch (error) {
    console.error("❌ [SMS] Ошибка обработки SMS OTP:", error);
    res.status(500).json({
      error: "server_error",
      message: error.message,
    });
  }
};

// 🔹 3. Логирование верификации SMS кода
export const verifySmsCode = async (req, res) => {
  console.log("🔢 [SMS] verifySmsCode вызван");
  console.log("🆔 [SMS] auth_req_id:", req.body?.auth_req_id);

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

    console.log("📤 [SMS] Отправка кода в МТС для проверки...");
    const response = await axios.post(transaction.smsotp_endpoint, payload, {
      headers: { "Content-Type": "application/json" },
      validateStatus: () => true,
    });

    if (response.status === 200) {
      console.log("✅ [SMS] Код принят МТС, ожидаем notification...");
      res.json({
        success: true,
        message: "Код подтверждения принят, ожидайте завершения аутентификации",
      });
    } else {
      console.error("❌ [SMS] Неверный код:", response.data);
      res.status(400).json({
        error: "invalid_code",
        message: response.data?.error_description || "Неверный код",
        retry_count: response.data?.retry_count,
      });
    }
  } catch (error) {
    console.error("❌ [SMS] Ошибка верификации кода:", error);
    res.status(500).json({
      error: "server_error",
      message: error.response?.data?.error_description || error.message,
    });
  }
};

// 🔹 4. 🔥 ГЛАВНОЕ: Логирование получения notification от МТС (PUSH успех)
export const handleNotification = async (req, res) => {
  console.log("📩 [PUSH] handleNotification вызван");
  console.log("📩 [PUSH] Headers:", JSON.stringify(req.headers, null, 2));
  console.log("📩 [PUSH] Body:", JSON.stringify(req.body, null, 2));

  try {
    const { auth_req_id, id_token, access_token, error, error_description } =
      req.body;

    if (!auth_req_id) {
      console.warn("⚠️ [PUSH] Отсутствует auth_req_id");
      return res.status(400).json({
        error: "invalid_request",
        message: "Отсутствует auth_req_id",
      });
    }

    console.log("🔍 [PUSH] Поиск транзакции:", auth_req_id);
    const transaction = await AuthTransaction.findOne({ auth_req_id });

    if (!transaction) {
      console.warn("⚠️ [PUSH] Транзакция не найдена:", auth_req_id);
      return res.status(404).json({
        error: "not_found",
        message: "Транзакция не найдена",
      });
    }

    console.log("💳 [PUSH] Проверка client_notification_token...");
    if (
      transaction.client_notification_token &&
      !validateBearerToken(req, transaction.client_notification_token)
    ) {
      console.warn(
        "⚠️ [PUSH] Неверный client_notification_token для",
        auth_req_id
      );
      return res.status(401).json({
        error: "unauthorized",
        message: "Неверный Authorization token",
      });
    }

    // 🔹 Обработка ошибки от МТС
    if (error) {
      console.warn("❌ [PUSH] Аутентификация не удалась:");
      console.warn("   auth_req_id:", auth_req_id);
      console.warn("   error:", error);
      console.warn("   error_description:", error_description);

      await AuthTransaction.findOneAndUpdate(
        { auth_req_id },
        { status: "failed", error, error_description }
      );

      console.log("💾 [PUSH] Транзакция обновлена: status = failed");
      return res.status(204).end();
    }

    if (!id_token || !access_token) {
      console.error("❌ [PUSH] Отсутствуют токены в notification");
      return res.status(400).json({
        error: "invalid_request",
        message: "Отсутствуют токены",
      });
    }

    // 🔹 Верификация ID Token
    console.log("🔐 [PUSH] Верификация id_token...");
    let decoded;
    try {
      decoded = await verifyIdToken(id_token);
      console.log("✅ [PUSH] id_token верифицирован успешно");
      console.log("👤 [PUSH] sub:", decoded.sub);
    } catch (verifyError) {
      console.error("❌ [PUSH] Ошибка верификации id_token:");
      console.error("   auth_req_id:", auth_req_id);
      console.error("   error:", verifyError.message);

      await AuthTransaction.findOneAndUpdate(
        { auth_req_id },
        {
          status: "failed",
          error: "token_verification_failed",
          error_description: verifyError.message,
        }
      );

      return res.status(204).end();
    }

    // 🔹 Обновление/создание пользователя
    console.log("👤 [PUSH] Обновление пользователя:", transaction.phone);
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

    // 🔹 🔥 ОБНОВЛЕНИЕ ТРАНЗАКЦИИ НА SUCCESS
    console.log("💾 [PUSH] Обновление транзакции на status = success...");
    await AuthTransaction.findOneAndUpdate(
      { auth_req_id },
      {
        status: "success",
        access_token,
        id_token,
        sub: decoded.sub,
      }
    );

    console.log("✅ [PUSH] УСПЕШНАЯ АУТЕНТИФИКАЦИЯ:");
    console.log("   auth_req_id:", auth_req_id);
    console.log("   phone:", transaction.phone);
    console.log("   sub:", decoded.sub);
    console.log("   status: success");

    res.status(204).end();
  } catch (error) {
    console.error("❌ [PUSH] Ошибка обработки notification:", error);
    res.status(500).json({
      error: "server_error",
      message: error.message,
    });
  }
};

// 🔹 5. Логирование проверки статуса (polling от фронтенда)
export const checkAuthStatus = async (req, res) => {
  console.log("🔄 [POLLING] checkAuthStatus вызван");
  console.log("🆔 [POLLING] auth_req_id:", req.params?.auth_req_id);

  try {
    const { auth_req_id } = req.params;
    const transaction = await AuthTransaction.findOne({ auth_req_id });

    if (!transaction) {
      console.warn("⚠️ [POLLING] Транзакция не найдена:", auth_req_id);
      return res.status(404).json({
        error: "not_found",
        message: "Транзакция не найдена",
      });
    }

    console.log("📊 [POLLING] Текущий статус транзакции:", transaction.status);
    console.log("⏱️ [POLLING] expires_at:", transaction.expires_at);

    if (
      transaction.expires_at &&
      new Date() > transaction.expires_at &&
      transaction.status === "pending"
    ) {
      console.log("⏰ [POLLING] Транзакция истекла");
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
      console.log("✅ [POLLING] Статус = success, получаем пользователя...");
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
        console.log("👤 [POLLING] Пользователь найден:", user._id);
      }
    }

    if (transaction.status === "failed") {
      console.log("❌ [POLLING] Статус = failed");
      response.error = transaction.error;
      response.error_description = transaction.error_description;
    }

    console.log("📤 [POLLING] Ответ фронтенду:", JSON.stringify(response));
    res.json(response);
  } catch (error) {
    console.error("❌ [POLLING] Ошибка проверки статуса:", error);
    res.status(500).json({
      error: "server_error",
      message: error.message,
    });
  }
};

// 🔹 6. Логирование финализации (получение куки)
export const finalizeAuth = async (req, res) => {
  console.log("🏁 [FINALIZE] finalizeAuth вызван");
  console.log("🆔 [FINALIZE] auth_req_id:", req.params?.auth_req_id);

  try {
    const { auth_req_id } = req.params;
    const transaction = await AuthTransaction.findOne({
      auth_req_id,
      status: "success",
    });

    if (!transaction) {
      console.warn(
        "⚠️ [FINALIZE] Успешная транзакция не найдена:",
        auth_req_id
      );
      return res.status(404).json({
        error: "not_found",
        message: "Успешная транзакция не найдена",
      });
    }

    console.log(
      "👤 [FINALIZE] Поиск пользователя по mts_sub:",
      transaction.sub
    );
    const user = await User.findOne({ mts_sub: transaction.sub });

    if (!user) {
      console.warn("⚠️ [FINALIZE] Пользователь не найден");
      return res.status(404).json({
        error: "not_found",
        message: "Пользователь не найден",
      });
    }

    console.log("🔐 [FINALIZE] Генерация app_token...");
    const appToken = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.APP_SECRET,
      { expiresIn: "7d" }
    );

    console.log("🍪 [FINALIZE] Установка куки app_token");
    res.cookie("app_token", appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("✅ [FINALIZE] Аутентификация завершена успешно");
    console.log("👤 [FINALIZE] User ID:", user._id);
    console.log("📱 [FINALIZE] Phone:", user.phone);

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
    console.error("❌ [FINALIZE] Ошибка финализации аутентификации:", error);
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
    console.error("❌ [JWKS] Ошибка чтения JWKS:", err);
    res.status(500).json({ error: "Failed to load JWKS" });
  }
};
