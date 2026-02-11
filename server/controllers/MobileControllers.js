import fs from "fs";
import qs from "qs";
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

console.log("CLIENT_ID: ", CLIENT_ID);

// Получение публичного ключа МТС из JWKS
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
    console.error("❌ Error reading JWKS file:", err.message);
    return null;
  }
};

// 1️⃣ Инициация аутентификации (ввод номера телефона)
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

    // Генерируем JWT request
    const requestJWT = generateRequestJWT({
      phoneNumber: phone,
      notificationUri: `${BASE_URL}/mobile/notifications`,
      clientNotificationToken,
      correlationId,
    });

    console.log(requestJWT);

    // 🔍 ПРОВЕРКА 1: Декодируем и выводим структуру токена
    console.log("\n" + "=".repeat(60));
    console.log("🔍 ПРОВЕРКА JWT ТОКЕНА");
    console.log("=".repeat(60));
    console.log(
      "🔐 Сырой токен (первые 100 символов):",
      requestJWT.substring(0, 100) + "..."
    );
    console.log("=".repeat(60));

    // Декодируем токен для проверки
    const decodedToken = jwt.decode(requestJWT, { complete: true });
    console.log("📋 Декодированный токен:");
    console.log("  Header:", JSON.stringify(decodedToken.header, null, 2));
    console.log("  Payload:", JSON.stringify(decodedToken.payload, null, 2));
    console.log("=".repeat(60));

    // 🔍 ПРОВЕРКА 2: Проверяем наличие обязательных полей в заголовке
    console.log("✅ Проверка заголовка (Header):");
    console.log(
      "  alg:",
      decodedToken.header.alg,
      decodedToken.header.alg === "RS256" ? "✅" : "❌"
    );
    console.log(
      "  kid:",
      decodedToken.header.kid,
      decodedToken.header.kid ? "✅" : "❌"
    );
    console.log("=".repeat(60));

    // 🔍 ПРОВЕРКА 3: Проверяем обязательные поля в payload
    console.log("✅ Проверка payload:");
    const requiredFields = [
      "iss",
      "aud",
      "version",
      "scope",
      "response_type",
      "nonce",
      "notification_uri",
      "client_notification_token",
      "login_hint",
      "acr_values",
    ];
    requiredFields.forEach((field) => {
      const exists = decodedToken.payload.hasOwnProperty(field);
      console.log(
        `  ${field}:`,
        exists ? "✅" : "❌",
        exists ? decodedToken.payload[field] : "(отсутствует)"
      );
    });
    console.log("=".repeat(60));

    // 🔍 ПРОВЕРКА 4: Проверяем длину nonce (должно быть 32 символа)
    const nonceLength = decodedToken.payload.nonce?.length || 0;
    console.log(
      `🔢 Длина nonce: ${nonceLength} символов`,
      nonceLength === 32 ? "✅" : `❌ (должно быть 32)`
    );
    console.log("=".repeat(60));

    // 🔍 ПРОВЕРКА 5: Сверяем kid с JWKS
    const jwksPath = path.join(__dirname, "../jwks.json");
    const jwks = JSON.parse(fs.readFileSync(jwksPath, "utf8"));
    const jwksKid = jwks.keys.find((k) => k.use === "sig")?.kid;
    console.log("🔑 Сравнение kid:");
    console.log("  kid в токене:", decodedToken.header.kid);
    console.log("  kid в JWKS:", jwksKid);
    console.log(
      "  Совпадают:",
      decodedToken.header.kid === jwksKid ? "✅" : "❌"
    );
    console.log("=".repeat(60));

    // 🔍 ПРОВЕРКА 6: Проверяем, что iss совпадает с CLIENT_ID
    console.log("🆔 Проверка issuer (iss):");
    console.log("  iss в токене:", decodedToken.payload.iss);
    console.log("  CLIENT_ID из .env:", CLIENT_ID);
    console.log(
      "  Совпадают:",
      decodedToken.payload.iss === CLIENT_ID ? "✅" : "❌"
    );
    console.log("=".repeat(60));

    // 🔍 ПРОВЕРКА 7: Проверяем, что aud совпадает с MTS_AUDIENCE
    console.log("🎯 Проверка audience (aud):");
    console.log("  aud в токене:", decodedToken.payload.aud);
    console.log("  MTS_AUDIENCE из .env:", process.env.MTS_AUDIENCE);
    console.log(
      "  Совпадают:",
      decodedToken.payload.aud === process.env.MTS_AUDIENCE ? "✅" : "❌"
    );
    console.log("=".repeat(60) + "\n");

    console.log("🔐 Generated JWT request for phone:", phone);

    // Отправляем запрос в МТС
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

    const { auth_req_id, expires_in, hhe_uri } = response.data;

    console.log("✅ МТС ответ:", {
      auth_req_id,
      expires_in,
      correlation_id: correlationId,
    });

    // Сохраняем транзакцию в БД
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
      "❌ Ошибка инициации аутентификации:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || "server_error",
      message:
        error.response?.data?.error_description || "Внутренняя ошибка сервера",
    });
  }
};

// 2️⃣ Callback для SMS OTP (МТС присылает smsotp_endpoint)
export const handleSmsOtp = async (req, res) => {
  try {
    const { auth_req_id, smsotp_endpoint, send, correlation_id } = req.body;

    if (!auth_req_id || !smsotp_endpoint || !send) {
      return res.status(400).json({
        error: "invalid_request",
        message: "Отсутствуют обязательные параметры",
      });
    }

    console.log("📱 SMS OTP notification получен:", {
      auth_req_id,
      smsotp_endpoint,
      correlation_id,
    });

    // Обновляем транзакцию в БД
    await AuthTransaction.findOneAndUpdate(
      { auth_req_id },
      {
        status: "sms_sent",
        smsotp_endpoint,
        send_payload: send,
      }
    );

    // Возвращаем 200 OK (МТС ждет этого)
    res.status(200).end();
  } catch (error) {
    console.error("❌ Ошибка обработки SMS OTP:", error);
    res.status(500).json({
      error: "server_error",
      message: error.message,
    });
  }
};

// 3️⃣ Отправка SMS кода пользователем
export const verifySmsCode = async (req, res) => {
  try {
    const { auth_req_id, code } = req.body;

    if (!auth_req_id || !code) {
      return res.status(400).json({
        error: "invalid_request",
        message: "Требуется auth_req_id и code",
      });
    }

    // Находим транзакцию
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

    console.log("🔑 Отправка кода в МТС:", {
      auth_req_id,
      endpoint: transaction.smsotp_endpoint,
    });

    // Формируем запрос на основе шаблона из send_payload
    const payload = { ...transaction.send_payload };

    // Заменяем placeholder на реальный код
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "enter_otp_code") {
        payload[key] = code;
      }
    });

    // Отправляем код в МТС
    const response = await axios.post(transaction.smsotp_endpoint, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: () => true, // Принимаем любой статус
    });

    if (response.status === 200) {
      console.log("✅ Код принят, ожидаем финальный callback");

      res.json({
        success: true,
        message: "Код подтверждения принят, ожидайте завершения аутентификации",
      });
    } else {
      console.error("❌ Неверный код:", response.data);

      res.status(400).json({
        error: "invalid_code",
        message: response.data?.error_description || "Неверный код",
        retry_count: response.data?.retry_count,
      });
    }
  } catch (error) {
    console.error(
      "❌ Ошибка верификации кода:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "server_error",
      message: error.response?.data?.error_description || error.message,
    });
  }
};

// 4️⃣ Финальный callback от МТС с токенами
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

    console.log("=== 📱 Финальный Notification получен ===");
    console.log("auth_req_id:", auth_req_id);

    if (!auth_req_id) {
      return res.status(400).json({
        error: "invalid_request",
        message: "Отсутствует auth_req_id",
      });
    }

    // Находим транзакцию
    const transaction = await AuthTransaction.findOne({ auth_req_id });

    if (!transaction) {
      console.warn("⚠️ Транзакция не найдена:", auth_req_id);
      return res.status(404).json({
        error: "not_found",
        message: "Транзакция не найдена",
      });
    }

    // Обработка ошибки аутентификации
    if (error) {
      console.warn("⚠️ Аутентификация не удалась:", {
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

    // Проверка наличия токенов
    if (!id_token || !access_token) {
      return res.status(400).json({
        error: "invalid_request",
        message: "Отсутствуют токены",
      });
    }

    // Верификация ID Token
    const publicKey = getPublicKeyFromJwks();
    if (!publicKey) {
      throw new Error("Не удалось загрузить публичный ключ");
    }

    const decoded = verifyIdToken(id_token, publicKey);

    console.log("✅ ID Token верифицирован:", {
      sub: decoded.sub,
      phone_number: decoded.phone_number,
    });

    // Создаем или обновляем пользователя (адаптировано под вашу модель)
    const user = await User.findOneAndUpdate(
      { phone: transaction.phone },
      {
        $set: {
          mts_sub: decoded.sub, // используем mts_sub вместо sub
          lastAuthAt: new Date(),
        },
        $setOnInsert: {
          phone: transaction.phone,
          // При первом создании можно добавить дефолтные значения
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

    // Обновляем транзакцию
    await AuthTransaction.findOneAndUpdate(
      { auth_req_id },
      {
        status: "success",
        access_token,
        id_token,
        sub: decoded.sub,
      }
    );

    console.log("✅ Пользователь аутентифицирован:", {
      userId: user._id,
      phone: user.phone,
      mts_sub: user.mts_sub,
    });

    // Возвращаем 204 No Content (как требует МТС)
    res.status(204).end();
  } catch (error) {
    console.error("❌ Ошибка обработки notification:", error);

    res.status(500).json({
      error: "server_error",
      message: error.message,
    });
  }
};

// 5️⃣ Проверка статуса аутентификации (для фронтенда)
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

    // Если успешно - возвращаем данные пользователя
    if (transaction.status === "success") {
      const user = await User.findOne({ mts_sub: transaction.sub }); // изменено на mts_sub

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

    // Если ошибка - возвращаем описание
    if (transaction.status === "failed") {
      response.error = transaction.error;
      response.error_description = transaction.error_description;
    }

    res.json(response);
  } catch (error) {
    console.error("❌ Ошибка проверки статуса:", error);
    res.status(500).json({
      error: "server_error",
      message: error.message,
    });
  }
};

// 6️⃣ Отдача JWKS (для МТС)
export const getJwks = (req, res) => {
  try {
    const jwksPath = path.join(__dirname, "../jwks.json");
    const jwks = fs.readFileSync(jwksPath, "utf8");

    res.setHeader("Content-Type", "application/json");
    res.send(jwks);
  } catch (err) {
    console.error("❌ Ошибка чтения JWKS:", err);
    res.status(500).json({ error: "Failed to load JWKS" });
  }
};
