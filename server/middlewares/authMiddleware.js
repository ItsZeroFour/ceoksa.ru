import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.app_token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.APP_SECRET);

    // Серверный отзыв: токены с iat < user.lastLogoutAt считаются истёкшими
    const user = await User.findById(decoded.userId).select("lastLogoutAt");
    if (!user) return res.status(401).json({ error: "User not found" });
    if (
      user.lastLogoutAt &&
      decoded.iat &&
      decoded.iat * 1000 < new Date(user.lastLogoutAt).getTime()
    ) {
      return res.status(401).json({ error: "Session ended" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
