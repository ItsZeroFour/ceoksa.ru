import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.app_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Токен не найден",
      });
    }

    const decoded = jwt.verify(token, process.env.APP_SECRET);

    // Серверная проверка отзыва токена через User.lastLogoutAt.
    // Если юзер делал /logout после выпуска этого JWT — отказ,
    // даже если cookie уцелела в браузере.
    const user = await User.findById(decoded.userId).select("lastLogoutAt");
    if (!user) {
      return res.status(401).json({ success: false, message: "Пользователь не найден" });
    }
    if (
      user.lastLogoutAt &&
      decoded.iat &&
      decoded.iat * 1000 < new Date(user.lastLogoutAt).getTime()
    ) {
      return res.status(401).json({
        success: false,
        message: "Сессия завершена",
      });
    }

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
