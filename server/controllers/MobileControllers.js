import fs from "fs";
// import qs from "qs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
// import jwt from "jsonwebtoken";
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

console.log("CLIENT_ID: ", CLIENT_ID);

const getPublicKeyFromJwks = () => {
  try {
    const jwksPath = path.join(__dirname, "../jwks.json");
    const jwks = JSON.parse(fs.readFileSync(jwksPath, "utf8"));
    const key = jwks.keys.find((key) => key.use === "sig");

    if (!key) {
      throw new Error("No signing key found in JWKS");
    }

    return jwkToPem(key);
  } catch (err) {
    console.error("Error reading JWKS file:", err.message);
    return null;
  }
};

export const initiateAuth = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^7\d{10}$/.test(phone)) {
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
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { auth_req_id, expires_in } = response.data;

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
      message: "Ожидайте SMS с кодом подтверждения",
    });
  } catch (error) {
    console.error(
      "Ошибка инициации аутентификации:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || "server_error",
      message:
        error.response?.data?.error_description || "Внутренняя ошибка сервера",
    });
  }
};

export const handleSmsOtp = async (req, res) => {
  try {
    const { auth_req_id, smsotp_endpoint, send, correlation_id } = req.body;

    if (!auth_req_id || !smsotp_endpoint || !send) {
      return res.status(400).json({
        error: "invalid_request",
        message: "Отсутствуют обязательные параметры",
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
        message: "SMS код еще не отправлен или уже использован",
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
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: () => true, // Принимаем любой статус
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
    console.error(
      "Ошибка верификации кода:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "server_error",
      message: error.response?.data?.error_description || error.message,
    });
  }
};

export const handleNotification = async (req, res) => {
  try {
    const {
      auth_req_id,
      id_token,
      access_token,
      token_type,
      expires_in,
      correlation_id,
      error,
      error_description,
    } = req.body;

    if (!auth_req_id) {
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

    if (error) {
      console.warn("Аутентификация не удалась:", {
        auth_req_id,
        error,
        error_description,
      });

      await AuthTransaction.findOneAndUpdate(
        { auth_req_id },
        {
          status: "failed",
          error,
          error_description,
        }
      );

      return res.status(204).end();
    }

    if (!id_token || !access_token) {
      return res.status(400).json({
        error: "invalid_request",
        message: "Отсутствуют токены",
      });
    }

    const publicKey = getPublicKeyFromJwks();
    if (!publicKey) {
      throw new Error("Не удалось загрузить публичный ключ");
    }

    const decoded = verifyIdToken(id_token, publicKey);

    console.log("ID Token верифицирован:", {
      sub: decoded.sub,
      phone_number: decoded.phone_number,
    });

    const user = await User.findOneAndUpdate(
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
      {
        upsert: true,
        new: true,
      }
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
      return res.status(404).json({
        error: "not_found",
        message: "Транзакция не найдена",
      });
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
