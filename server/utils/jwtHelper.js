import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import axios from "axios";
import jwkToPem from "jwk-to-pem";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRIVATE_KEY_PATH = path.join(__dirname, "../private.pem");
const CLIENT_ID = process.env.CLIENT_ID;
const MTS_AUDIENCE = process.env.MTS_AUDIENCE;

let mtsPublicKey = null;
let mtsPublicKeyExpiry = 0;

export const getMtsPublicKey = async () => {
  const now = Date.now();
  
  if (mtsPublicKey && now < mtsPublicKeyExpiry) {
    console.log("Используем кэшированный публичный ключ МТС");
    return mtsPublicKey;
  }

  try {
    console.log("Получение публичного ключа МТС из JWKS...");
    
    const response = await axios.get("https://idgw.mobileid.mts.ru/oidc/jwks", {
      timeout: 5000
    });

    const jwks = response.data;
    
    const signingKey = jwks.keys.find(key => key.use === "sig" && key.kty === "RSA");
    
    if (!signingKey) {
      throw new Error("Не найден ключ подписи в JWKS МТС");
    }

    const publicKeyPem = jwkToPem(signingKey);
    
    mtsPublicKey = publicKeyPem;
    mtsPublicKeyExpiry = now + 3600000;
    
    console.log("Публичный ключ МТС успешно загружен и закэширован");
    console.log("Ключ:", signingKey.kid, signingKey.kty);
    
    return publicKeyPem;
  } catch (error) {
    console.error("Ошибка получения публичного ключа МТС:", error.message);
    throw error;
  }
};

export const generateRequestJWT = (params) => {
  const {
    phoneNumber,
    notificationUri,
    clientNotificationToken,
    correlationId,
    acrValues = "2",
  } = params;
  
  const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");
  
  const nonce = crypto.randomBytes(16).toString("hex").slice(0, 32);
  
  const payload = {
    client_id: CLIENT_ID,
    iss: CLIENT_ID,
    aud: MTS_AUDIENCE,
    version: "mc_si_r2_v1.0",
    scope: "openid mc_authn",
    response_type: "mc_si_async_code",
    nonce: nonce,
    notification_uri: notificationUri,
    client_notification_token: clientNotificationToken,
    login_hint: `MSISDN:${phoneNumber}`,
    acr_values: acrValues,
    ...(correlationId && { correlation_id: correlationId }),
  };
  
  console.log("Генерация запроса на аутентификацию:", {
    phoneNumber,
    nonce,
    client_id: CLIENT_ID,
    aud: MTS_AUDIENCE,
  });
  
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    header: {
      alg: "RS256",
      typ: "JWT",
      kid: "rsa1",
    },
    expiresIn: "5m",
  });
};

/**
 * Верификация id_token, подписанного МТС
 * @param {string} idToken - ID Token от МТС
 * @returns {object} Декодированный токен
 */
export const verifyIdToken = async (idToken) => {
  try {
    console.log("Начинаем верификацию ID Token");
    
    const decodedHeader = jwt.decode(idToken, { complete: true });
    console.log("JWT Header:", decodedHeader?.header);
    console.log("JWT Payload:", decodedHeader?.payload);
    
    const publicKeyPem = await getMtsPublicKey();
    
    const decoded = jwt.verify(idToken, publicKeyPem, {
      algorithms: ["RS256"],
    });
    
    console.log("ID Token успешно верифицирован:", {
      sub: decoded.sub,
      iss: decoded.iss,
      aud: decoded.aud,
      exp: decoded.exp,
      iat: decoded.iat,
    });
    
    return decoded;
  } catch (error) {
    console.error("Ошибка верификации ID Token:", error.message);
    console.error("JWT Header:", jwt.decode(idToken, { complete: true })?.header);
    console.error("JWT Payload:", jwt.decode(idToken, { complete: true })?.payload);
    throw error;
  }
};

export const generateClientNotificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    console.error("Ошибка декодирования токена:", error);
    return null;
  }
};