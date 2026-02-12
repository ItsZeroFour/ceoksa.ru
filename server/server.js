import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import cookieSession from "cookie-session";
import MobileRoutes from "./routes/mobileRoutes.js";
import { getJwks } from "./controllers/MobileControllers.js";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import User from "./models/User.js";
import AuthTransaction from "./models/AuthTransaction.js";
import jwt from "jsonwebtoken";


/* ROUTES */

dotenv.config({ path: "./.env" });
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* CONSTANTS */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

/* MIDDLEWARES */
app.use(express.urlencoded({ extended: true }));
// app.use(cookieSession({ name: "sess", keys: [CONFIG.SESSION_KEY] }));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(
  cors({
    origin: "https://ceoksa.ru",
    credentials: true,
  })
);
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "20mb" }));
// app.use(bodyParser.json({ type: "application/jose" }));
// app.use(bodyParser.text({ type: "application/jose" }));
app.use(
  bodyParser.urlencoded({
    limit: "20mb",
    extended: true,
    parameterLimit: 1000000,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use(
//   cors({
//     origin: "https://ceoksa.ru",
//     credentials: true,
//   })
// );

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

app.get("/auth/complete", async (req, res) => {
  const { auth_req_id } = req.query;

  const transaction = await AuthTransaction.findOne({ auth_req_id });
  if (!transaction || transaction.status !== "success") {
    return res.status(400).json({ error: "Auth not completed" });
  }

  const user = await User.findOne({ phone: transaction.phone });

  const appToken = jwt.sign(
    { userId: user._id, phone: user.phone },
    process.env.APP_SECRET,
    { expiresIn: "7d" }
  );

  console.log("APP_SECRET:", process.env.APP_SECRET);


  res.cookie("app_token", appToken, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect("https://ceoksa.ru");
});

app.get("/auth/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId);

  res.json(user);
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
