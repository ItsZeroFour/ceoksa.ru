import axios from "axios";

const MTS_TOKEN_URL = "https://api.mts.ru/token";
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

let cachedToken = null;
let tokenExpiresAt = 0;
let refreshTimer = null;

const fetchNewToken = async () => {
  const clientId = process.env.MTS_RIM_CLIENT_ID;
  const clientSecret = process.env.MTS_RIM_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "MTS_RIM_CLIENT_ID и MTS_RIM_CLIENT_SECRET должны быть заданы в .env"
    );
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await axios.post(
    MTS_TOKEN_URL,
    "grant_type=client_credentials",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  const { access_token, expires_in } = response.data;

  cachedToken = access_token;
  tokenExpiresAt = Date.now() + expires_in * 1000 - REFRESH_MARGIN_MS;

  console.log(
    `[MTS RIM Token] Токен получен, истекает через ${expires_in}с`
  );

  return access_token;
};

export const getRimToken = async () => {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  console.log("[MTS RIM Token] Токен отсутствует или истёк. Обновляем...");
  return await fetchNewToken();
};

export const startRimTokenAutoRefresh = async () => {
  try {
    await fetchNewToken();
  } catch (error) {
    console.error(
      "[MTS RIM Token] Ошибка первоначального получения токена:",
      error.message
    );
  }

  refreshTimer = setInterval(async () => {
    try {
      await fetchNewToken();
    } catch (error) {
      console.error(
        "[MTS RIM Token] Ошибка обновления токена:",
        error.message
      );
    }
  }, 50 * 60 * 1000);

  if (refreshTimer.unref) {
    refreshTimer.unref();
  }
};

export const stopRimTokenAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};
