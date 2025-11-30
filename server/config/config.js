import "dotenv/config";

export const CONFIG = {
  ESIA_BASE: process.env.ESIA_BASE,
  CLIENT_ID: process.env.ESIA_CLIENT_ID,
  REDIRECT_URI: process.env.ESIA_REDIRECT_URI,
  CERT_HASH: process.env.ESIA_CERT_HASH,
  CERT_PATH: process.env.ESIA_CERT_PATH,
  KEY_PATH: process.env.ESIA_KEY_PATH,
  SIGN_TOOL: process.env.ESIA_SIGN_TOOL_PATH,
  SESSION_KEY: process.env.SESSION_KEY,
};
