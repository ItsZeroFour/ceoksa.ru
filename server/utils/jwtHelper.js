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
const JWKS_PATH = path.join(__dirname, "../jwks.json");
const CLIENT_ID = process.env.CLIENT_ID;
const MTS_AUDIENCE = process.env.MTS_AUDIENCE;

let mtsPublicKey = null;
let mtsPublicKeyExpiry = 0;

const getKidFromJwks = () => {
  try {
    const jwks = JSON.parse(fs.readFileSync(JWKS_PATH, "utf8"));
    const key = jwks.keys.find((k) => k.use === "sig");
    return key?.kid || "rsa1";
  } catch (err) {
    return "rsa1";
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
  const kid = getKidFromJwks();

  const payload = {
    client_id: CLIENT_ID,
    iss: CLIENT_ID,
    aud: MTS_AUDIENCE,
    version: "mc_si_r2_v1.0",
    scope: "openid mc_authn",
    response_type: "mc_si_async_code",
    nonce: crypto.randomBytes(16).toString("hex").slice(0, 32),
    notification_uri: notificationUri,
    client_notification_token: clientNotificationToken,
    login_hint: `MSISDN:${phoneNumber}`,
    acr_values: acrValues,
    ...(correlationId && { correlation_id: correlationId }),
  };

  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    header: {
      alg: "RS256",
      typ: "JWT",
      kid: kid,
    },
    expiresIn: "5m",
  });
};

export const getMtsPublicKey = async () => {
  const now = Date.now();

  if (mtsPublicKey && now < mtsPublicKeyExpiry) {
    return mtsPublicKey;
  }

  const response = await axios.get("https://idgw.mobileid.mts.ru/oidc/jwks", {
    timeout: 5000,
  });

  const jwks = response.data;
  const signingKey = jwks.keys.find(
    (key) => key.use === "sig" && key.kty === "RSA"
  );

  if (!signingKey) {
    throw new Error("Не найден ключ подписи в JWKS МТС");
  }

  const publicKeyPem = jwkToPem(signingKey);
  mtsPublicKey = publicKeyPem;
  mtsPublicKeyExpiry = now + 3600000;

  return publicKeyPem;
};

export const verifyIdToken = async (idToken) => {
  const publicKeyPem = await getMtsPublicKey();
  return jwt.verify(idToken, publicKeyPem, {
    algorithms: ["RS256"],
  });
};

export const generateClientNotificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
