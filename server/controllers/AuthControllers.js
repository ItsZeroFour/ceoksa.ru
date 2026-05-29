import AuthTransaction from "../models/AuthTransaction.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const authComplete = async (req, res) => {
  try {
    const { auth_req_id } = req.query;
    const transaction = await AuthTransaction.findOne({ auth_req_id });

    if (!transaction || transaction.status !== "success") {
      return res.status(400).json({ error: "Auth not completed" });
    }

    const user = await User.findOne({ phone: transaction.phone });

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
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

    res.redirect("https://ceoksa.ru/account/loan_applications");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось завершить авторизацию",
    });
  }
};

export const authMe = async (req, res) => {
  // Запрещаем кэширование на всех уровнях (браузер, прокси, CDN).
  // Без этих заголовков nginx/Cloudflare могут хранить ответ
  // до 5 минут — и после логаута fetchMe получает кешированный 200
  // с данными юзера, хотя cookie уже нет. Это и было причиной того,
  // что сессия «отваливалась только через 5 минут».
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Не удалось получить данные пользователя",
    });
  }
};
