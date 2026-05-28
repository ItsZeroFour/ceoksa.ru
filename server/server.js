import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import MobileRoutes from "./routes/mobileRoutes.js";
import { getJwks } from "./controllers/MobileControllers.js";
import AuthTransaction from "./models/AuthTransaction.js";
import cookieParser from "cookie-parser";

import AuthRoutes from "./routes/authRoutes.js";
import UserRoutes from "./routes/userRoutes.js";
import ValidateBICRoutes from "./routes/validateBICRoutes.js";
import OcrRoutes from "./routes/ocrRoutes.js";
import RimRoutes from "./routes/rimRoutes.js";
import { startRimTokenAutoRefresh } from "./utils/mtsRimToken.js";

/* ROUTES */
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* CONSTANTS */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

/* MIDDLEWARES */
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(
  cors({
    origin: ["https://ceoksa.ru", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(helmet());
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "same-site",
  })
);
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "20mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "20mb",
    extended: true,
    parameterLimit: 1000000,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads"), { maxAge: "7d" }));
app.use("/files", express.static(path.join(__dirname, "files"), { maxAge: "30d" }));

/**
 * Загрузка изображений
 */
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (_, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Файл не загружен" });
    }
    res.json({ path: `/uploads/${req.file.filename}` });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Произошла ошибка при загрузке изображения",
    });
  }
});

/* ROUTES */
app.use("/mobile", MobileRoutes);
app.get("/.well-known/jwks.json", getJwks);
app.use("/auth", AuthRoutes);
app.use("/user", UserRoutes);
app.use("/validate", ValidateBICRoutes);
app.use("/ocr", OcrRoutes);
app.use("/rim", RimRoutes);

app.post("/logout", (req, res) => {
  // Параметры должны совпадать с теми, с которыми ставилась кука в finalizeAuth.
  // Иначе браузер не удалит её и юзер останется залогинен после reload.
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
  };

  res.clearCookie("app_token", cookieOptions);
  // Подстраховка на случай, если где-то осталась кука без httpOnly или с другими опциями
  res.cookie("app_token", "", { ...cookieOptions, maxAge: 0, expires: new Date(0) });

  console.log("[logout] Выход выполнен. hadCookie:", !!req.cookies?.app_token);
  res.json({ success: true, message: "Вышли из системы" });
});

/* START FUNCTION */
async function start() {
  try {
    await mongoose
      .connect(MONGO_URI)
      .then(() => {
        console.log("Mongo db connection successfully");
      })
      .catch((err) => console.log(err));

    // Старый TTL-индекс на createdAt (expires=300) удалял транзакции авторизации
    // быстрее, чем успевал прийти notification от МТС. Дропаем его, чтобы остался
    // только новый TTL на expires_at. Mongoose не пересоздаёт TTL-индексы автоматически.
    try {
      const indexes = await AuthTransaction.collection.indexes();
      for (const idx of indexes) {
        if (idx.key && idx.key.createdAt === 1 && typeof idx.expireAfterSeconds === "number") {
          console.log(
            `[startup] Дропаю устаревший TTL-индекс ${idx.name} (expireAfterSeconds=${idx.expireAfterSeconds}) на createdAt`
          );
          await AuthTransaction.collection.dropIndex(idx.name);
        }
      }
      await AuthTransaction.syncIndexes();
      console.log("[startup] Индексы AuthTransaction синхронизированы");
    } catch (idxErr) {
      console.warn("[startup] Не удалось обновить индексы AuthTransaction:", idxErr.message);
    }

    if (process.env.MTS_RIM_CLIENT_ID && process.env.MTS_RIM_CLIENT_SECRET) {
      startRimTokenAutoRefresh().catch((err) =>
        console.warn("[RIM] Не удалось запустить автообновление токена:", err.message)
      );
    } else {
      console.warn(
        "[RIM] MTS_RIM_CLIENT_ID / MTS_RIM_CLIENT_SECRET не заданы. RIM интеграция отключена."
      );
    }

    app.listen(PORT, (err) => {
      if (err) return console.log("Приложение аварийно завершилось: ", err);
      console.log(`Сервер успешно запущен! Порт: ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
}

start();
