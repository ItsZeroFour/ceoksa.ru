import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.app_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Токен не найден",
      });
    }

    const decoded = jwt.verify(token, process.env.APP_SECRET);

    req.userId = decoded.userId;
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Ошибка верификации токена:", error);
    return res.status(401).json({
      success: false,
      message: "Неверный или просроченный токен",
    });
  }
};
