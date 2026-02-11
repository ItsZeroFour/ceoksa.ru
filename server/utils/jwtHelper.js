import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRIVATE_KEY_PATH = path.join(__dirname, "../private.pem");
const JWKS_PATH = path.join(__dirname, "../jwks.json");
const CLIENT_ID = process.env.CLIENT_ID;
const MTS_AUDIENCE = process.env.MTS_AUDIENCE;

const getKidFromJwks = () => {
  try {
    const jwks = JSON.parse(fs.readFileSync(JWKS_PATH, "utf8"));
    const key = jwks.keys.find((k) => k.use === "sig");
    return key?.kid || "rsa1";
  } catch (err) {
    console.warn("⚠️ Не удалось прочитать kid из JWKS, используем дефолтный");
    return "rsa1";
  }
};
export const generateRequestJWT = (params) => {
  const {
    phoneNumber,
    notificationUri,
    clientNotificationToken,
    correlationId,
    acrValues = "2", // Уровень аутентификации (2 = SMS-OTP)
  } = params;

  const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");
  const kid = getKidFromJwks();

  const payload = {
    iss: CLIENT_ID,
    aud: MTS_AUDIENCE,
    version: 1,
    scope: "openid mc_authn",
    response_type: "mc_si_async_code",
    nonce: crypto.randomBytes(16).toString("hex"),
    notification_uri: notificationUri,
    client_notification_token: clientNotificationToken,
    login_hint: `MSISDN:${phoneNumber}`,
    acr_values: acrValues,
    ...(correlationId && { correlation_id: correlationId }),
  };

  console.log("📝 JWT payload:", payload);
  console.log("🔑 Using kid:", kid);

  // Подписываем с алгоритмом RS256
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    header: {
      kid: kid,
    },
    expiresIn: "5m",
  });
};

// Верификация ID Token от МТС
export const verifyIdToken = (idToken, publicKeyPem) => {
  return jwt.verify(idToken, publicKeyPem, {
    algorithms: ["RS256"],
    audience: CLIENT_ID,
  });
};
