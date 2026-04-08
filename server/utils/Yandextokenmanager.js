import axios from "axios";

const YANDEX_IAM_URL = "https://iam.api.cloud.yandex.net/iam/v1/tokens";
const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

let cachedToken = null;
let tokenExpiresAt = null;
let refreshTimer = null;

const fetchNewToken = async () => {
  const oauthToken = process.env.OAUTH_TOKEN;

  if (!oauthToken) {
    throw new Error("OAUTH_TOKEN не задан в переменных окружения");
  }

  const response = await axios.post(YANDEX_IAM_URL, {
    yandexPassportOauthToken: oauthToken,
  });

  const { iamToken, expiresAt } = response.data;

  cachedToken = iamToken;
  tokenExpiresAt = new Date(expiresAt);

  return iamToken;
};

export const startTokenAutoRefresh = async () => {
  await fetchNewToken();

  refreshTimer = setInterval(async () => {
    try {
      await fetchNewToken();
    } catch (error) {
      console.error(
        "[YandexTokenManager] Ошибка обновления токена:",
        error.message
      );
    }
  }, REFRESH_INTERVAL_MS);

  refreshTimer.unref();
};

export const getIamToken = async () => {
  const now = new Date();
  const isExpired = tokenExpiresAt && now >= tokenExpiresAt;

  if (!cachedToken || isExpired) {
    console.warn(
      "[YandexTokenManager] Токен отсутствует или истёк. Обновляем..."
    );
    await fetchNewToken();
  }

  return cachedToken;
};

export const stopTokenAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};
