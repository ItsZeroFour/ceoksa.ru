import bodyParser from "body-parser";
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
import cookieParser from "cookie-parser";
import AuthRoutes from "./routes/authRoutes.js";
import UserRoutes from "./routes/userRoutes.js";
import ValidateBICRoutes from "./routes/validateBICRoutes.js";

/* ROUTES */
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* CONSTANTS */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

/* MIDDLEWARES */
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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  cors({
     origin: "https://ceoksa.ru",
     credentials: true,
   })
 );

/**
 * @description Загрузка изображений в папку uploads
 * @access public
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

app.post("/logout", (req, res) => {
  res.clearCookie("app_token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    domain: "ceoksa.ru",
  });

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

    app.listen(PORT, (err) => {
      if (err) return console.log("Приложение аварийно завершилось: ", err);
      console.log(`Сервер успешно запущен! Порт: ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
}

start();
