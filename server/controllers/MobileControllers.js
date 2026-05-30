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

// Grace-период между PUSH-ошибкой и переводом в failed:
// МТС может отправить sms_otp_notification сразу после ошибки PUSH
// (если оператор поддерживает SMS-OTP fallback). За это время статус
// push_failed может смениться на sms_sent через handleSmsOtp.
const PUSH_TO_SMS_GRACE_MS = 15000;

const schedulePushFailedTimeout = (auth_req_id) => {
  setTimeout(async () => {
    try {
      const txn = await AuthTransaction.findOne({ auth_req_id });
      if (!txn) return;
      if (txn.status !== "push_failed") return;
      await AuthTransaction.findOneAndUpdate(
        { auth_req_id, status: "push_failed" },
        {
          status: "failed",
          error: txn.error || "push_no_fallback",
          error_description:
            txn.error_description ||
            "PUSH не доставлен и SMS-fallback недоступен",
          can_retry: true,
        }
      );
      console.warn(
        "[push-timeout] PUSH без SMS-fallback за grace-период — failed:",
        auth_req_id
      );
    } catch (e) {
      console.warn("[push-timeout] Ошибка:", e.message);
    }
  }, PUSH_TO_SMS_GRACE_MS);
};

export const initiateAuth = async (req, res) => {
  try {
    const { phone } = req.body;

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

    const created = await AuthTransaction.create({
      auth_req_id,
      correlation_id: correlationId,
      phone,
      status: "pending",
      client_notification_token: clientNotificationToken,
      expires_at: new Date(Date.now() + expires_in * 1000),
    });

    console.log("[initiateAuth] Транзакция создана:", {
      auth_req_id,
      phone,
      expires_in,
      createdAt: created.createdAt,
      expires_at: created.expires_at,
      hasHheUri: !!hhe_uri,
    });

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

    // SMS пришло — гасим возможные push-ошибки (status=push_failed → sms_sent).
    // Если транзакция уже success/failed (терминал) — не перетираем.
    if (transaction.status === "success" || transaction.status === "failed") {
      console.warn(
        `[handleSmsOtp] Игнорируем — транзакция уже терминальная: ${transaction.status}`,
        { auth_req_id }
      );
      return res.status(200).end();
    }

    await AuthTransaction.findOneAndUpdate(
      { auth_req_id },
      {
        status: "sms_sent",
        smsotp_endpoint,
        send_payload: send,
        // Сбрасываем поля push-ошибки — теперь идём по SMS-флоу.
        error: null,
        error_description: null,
        can_retry: false,
      }
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



    console.log("[verifySmsCode] Отправляем код в МТС", {
      auth_req_id,
      endpoint: transaction.smsotp_endpoint,
    });

    const response = await axios.post(transaction.smsotp_endpoint, payload, {
      headers: { "Content-Type": "application/json" },
      validateStatus: () => true,
    });

    console.log("[verifySmsCode] Ответ МТС:", {
      auth_req_id,
      status: response.status,
      dataPreview: JSON.stringify(response.data).slice(0, 300),
    });

    if (response.status === 200) {
      await AuthTransaction.findOneAndUpdate(
        { auth_req_id },
        { status: "verifying" }
      );

      // Inline-ожидание notification от МТС (до 10 секунд).
      // После того как МТС подтвердил код, он шлёт асинхронный
      // notification с id_token. Опрашиваем БД каждые 500 мс — если
      // status стал success, ставим cookie прямо здесь и возвращаем юзера
      // в одном запросе (без зависимости от клиентского polling).
      const waitDeadline = Date.now() + 10_000;
      let finalTxn = null;
      while (Date.now() < waitDeadline) {
        await new Promise((r) => setTimeout(r, 500));
        finalTxn = await AuthTransaction.findOne({ auth_req_id });
        if (!finalTxn) break;
        if (finalTxn.status === "success" || finalTxn.status === "failed") break;
      }

      if (finalTxn?.status === "success") {
        const user = await User.findOne({ phone: finalTxn.phone });
        if (user) {
          const appToken = jwt.sign(
            { userId: user._id, phone: user.phone },
            process.env.APP_SECRET,
            { expiresIn: "7d" }
          );
          // НЕ httpOnly: фронт сам удаляет cookie при логауте через
          // document.cookie. Серверная защита остаётся через User.lastLogoutAt.
          res.cookie("app_token", appToken, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });
          console.log("[verifySmsCode] notification получен в течение запроса, cookie выставлено:", {
            auth_req_id,
            userId: user._id,
          });
          return res.json({
            success: true,
            authenticated: true,
            user: {
              id: user._id,
              phone: user.phone,
              fullName: user.fullName,
              email: user.email,
            },
          });
        }
      }

      if (finalTxn?.status === "failed") {
        return res.status(400).json({
          error: finalTxn.error || "auth_failed",
          message: finalTxn.error_description || "Аутентификация не удалась",
          can_retry: finalTxn.can_retry || false,
        });
      }

      // notification ещё не пришёл — отдаём управление клиентскому polling
      return res.json({
        success: true,
        authenticated: false,
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
    console.log("[handleNotification] === ВХОД ===", {
      contentType: req.headers["content-type"],
      hasAuth: !!req.headers["authorization"],
      bodyKeys: Object.keys(req.body || {}),
      bodyPreview: JSON.stringify(req.body).slice(0, 500),
    });

    const { auth_req_id, id_token, access_token, error, error_description } =
      req.body;

    if (!auth_req_id) {
      console.warn(
        "[handleNotification] Отсутствует auth_req_id. body:",
        req.body
      );
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

    console.log("[handleNotification] Найдена транзакция:", {
      auth_req_id,
      status: transaction.status,
      phone: transaction.phone,
      hasError: !!error,
      hasIdToken: !!id_token,
      hasAccessToken: !!access_token,
    });

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
      // КРИТИЧНО: МТС может прислать ошибку push-flow ПОСЛЕ того, как уже
      // переключился на SMS-fallback (status=sms_sent) или уже идёт верификация
      // кода (status=verifying). В этих случаях ошибка push устарела —
      // не перезаписываем активный SMS-флоу в failed, иначе клиент,
      // который уже ввёл/вводит код, получит «Не удалось войти».
      // Также не трогаем терминальные success/failed/expired, чтобы поздняя
      // нотификация не воскресила или не оттранзитила терминальный статус.
      if (
        transaction.status === "sms_sent" ||
        transaction.status === "verifying" ||
        transaction.status === "success" ||
        transaction.status === "failed" ||
        transaction.status === "expired"
      ) {
        console.warn(
          `[handleNotification] Игнорируем push-ошибку: статус уже ${transaction.status}`,
          { auth_req_id, error, error_description }
        );
        return res.status(204).end();
      }

      const desc = typeof error_description === "string" ? error_description : "";

      // Терминальные ошибки, при которых ни PUSH, ни SMS работать не будут:
      // оператор неизвестен, не подключен к Мобильному ID, активная транзакция
      // уже идёт. В этих кейсах сразу failed без grace.
      const isTerminal =
        desc.includes("unknown mobile network operator") ||
        desc.includes("not registered for mobile network operator") ||
        desc.includes("unsupported mobile network operator") ||
        desc.includes("user is busy with another transaction");

      if (isTerminal) {
        console.warn("[handleNotification] Терминальная ошибка:", {
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
            can_retry: false,
          }
        );
        return res.status(204).end();
      }

      // Любая другая push-ошибка (delivery timeout, client cancelled, user_denied,
      // оператор без PUSH) → переводим в push_failed и ждём sms_otp_notification.
      // Параллельно запускаем grace-таймер: если SMS не придёт за окно — failed.
      console.warn(
        `[handleNotification] PUSH не удался → push_failed, ждём SMS-fallback:`,
        { auth_req_id, error, error_description, phone: transaction.phone }
      );

      await AuthTransaction.findOneAndUpdate(
        { auth_req_id },
        {
          status: "push_failed",
          error,
          error_description,
          can_retry: true,
        }
      );

      schedulePushFailedTimeout(auth_req_id);

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
      console.log("[handleNotification] id_token верифицирован. sub:", decoded.sub);
    } catch (verifyError) {
      console.error(
        "[handleNotification] Ошибка верификации id_token:",
        verifyError.message
      );

      const updFail = await AuthTransaction.findOneAndUpdate(
        { auth_req_id },
        {
          status: "failed",
          error: "token_verification_failed",
          error_description: verifyError.message,
          can_retry: false,
        },
        { new: true }
      );

      console.warn(
        "[handleNotification] Транзакция переведена в failed. updateResult:",
        !!updFail
      );

      return res.status(204).end();
    }

    try {
      // Защита от E11000: mts_sub имеет unique-sparse индекс. Если этот sub
      // уже привязан к другому юзеру (с другим телефоном) — upsert ниже упадёт
      // и транзакция уйдёт в failed. Сначала снимаем sub со всех «не своих»
      // аккаунтов, чтобы текущий телефон мог его получить.
      await User.updateMany(
        { mts_sub: decoded.sub, phone: { $ne: transaction.phone } },
        { $unset: { mts_sub: "" } }
      );

      const userResult = await User.findOneAndUpdate(
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
      console.log("[handleNotification] User upsert OK. userId:", userResult?._id);
    } catch (userError) {
      console.error(
        "[handleNotification] Ошибка upsert User:",
        userError.code,
        userError.message
      );

      await AuthTransaction.findOneAndUpdate(
        { auth_req_id },
        {
          status: "failed",
          error: "user_upsert_failed",
          error_description: userError.message,
          can_retry: false,
        }
      );

      return res.status(204).end();
    }

    // Атомарно: переводим в success только если транзакция не была уже
    // финализирована (success/expired). Это защищает от ретраев нотификаций
    // и от рассинхрона, если юзер уже ушёл с expired-экрана.
    const updateResult = await AuthTransaction.findOneAndUpdate(
      { auth_req_id, status: { $nin: ["success", "expired"] } },
      { status: "success", access_token, id_token, sub: decoded.sub },
      { new: true }
    );

    console.log("[handleNotification] Транзакция переведена в success:", {
      auth_req_id,
      updated: !!updateResult,
      finalStatus: updateResult?.status,
    });

    res.status(204).end();
  } catch (error) {
    console.error(
      "[handleNotification] Критическая ошибка:",
      error.message,
      error.stack
    );
    res.status(500).json({
      error: "server_error",
      message: error.message,
    });
  }
};

// Статусы, при которых клиенту ничего не нужно делать, кроме как ждать —
// long-poll крутится до изменения статуса или таймаута.
const WAITING_STATUSES = new Set(["pending", "verifying"]);

// Long-poll: сервер держит запрос до изменения статуса (или таймаута),
// чтобы переходы PUSH→push_failed→sms_sent→success доходили мгновенно,
// а не через 1.5-2 сек клиентского polling.
const LONG_POLL_MS = 20000;
const POLL_TICK_MS = 400;

export const checkAuthStatus = async (req, res) => {
  try {
    const { auth_req_id } = req.params;
    const wait = req.query.wait === "1" || req.query.wait === "true";

    const fetchTxn = () => AuthTransaction.findOne({ auth_req_id });

    let transaction = await fetchTxn();

    if (!transaction) {
      const total = await AuthTransaction.countDocuments();
      const recent = await AuthTransaction.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .select("auth_req_id status createdAt expires_at");
      console.warn("[checkAuthStatus] Транзакция не найдена:", auth_req_id, {
        totalInDb: total,
        recentInDb: recent.map((t) => ({
          id: t.auth_req_id,
          status: t.status,
          createdAt: t.createdAt,
          expires_at: t.expires_at,
        })),
      });
      return res.status(404).json({
        error: "not_found",
        message: "Транзакция не найдена",
      });
    }

    // Long-poll: пока статус «ждущий», ждём изменения до LONG_POLL_MS.
    if (wait && WAITING_STATUSES.has(transaction.status)) {
      const deadline = Date.now() + LONG_POLL_MS;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, POLL_TICK_MS));
        if (req.aborted || res.writableEnded) return;
        const fresh = await fetchTxn();
        if (!fresh) {
          transaction = null;
          break;
        }
        if (!WAITING_STATUSES.has(fresh.status)) {
          transaction = fresh;
          break;
        }
        // Проверка истечения внутри long-poll
        if (
          fresh.expires_at &&
          new Date() > fresh.expires_at &&
          fresh.status === "pending"
        ) {
          transaction = fresh;
          break;
        }
      }
      if (!transaction) {
        return res.status(404).json({
          error: "not_found",
          message: "Транзакция не найдена",
        });
      }
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
      // По телефону транзакции — handleNotification сделал upsert User
      // именно по phone, так что юзер гарантированно тот, что ввёл номер.
      // Поиск по mts_sub давал чужой аккаунт при коллизии sub'ов.
      const user = await User.findOne({ phone: transaction.phone });
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
      console.warn(
        `[checkAuthStatus] Статус failed. error: ${transaction.error}, can_retry: ${response.can_retry}`
      );
    }

    if (transaction.status === "push_failed") {
      // Клиент покажет SMS-экран и продолжит polling до sms_sent или failed.
      response.error = transaction.error;
      response.error_description = transaction.error_description;
      response.can_retry = transaction.can_retry || false;
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

    const user = await User.findOne({ phone: transaction.phone });

    if (!user) {
      console.warn(
        "[finalizeAuth] Пользователь не найден. phone:",
        transaction.phone
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

    // НЕ httpOnly: фронт сам удаляет cookie при логауте через document.cookie.
    res.cookie("app_token", appToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
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
    res.setHeader("Content-Type", "application/json");
    res.send(jwks);
  } catch (err) {
    console.error("[getJwks] Ошибка чтения JWKS:", err.message);
    res.status(500).json({ error: "Failed to load JWKS" });
  }
};
