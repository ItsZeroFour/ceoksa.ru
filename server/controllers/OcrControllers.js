import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import User from "../models/User.js";
import { getIamToken } from "../utils/Yandextokenmanager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YANDEX_OCR_URL = "https://ocr.api.cloud.yandex.net/ocr/v1/recognizeText";

export const recognizePassport = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const photoRelativePath = user.photos?.first_page_of_the_passport;
    if (!photoRelativePath) {
      return res.status(400).json({
        message: "Фото основного разворота паспорта не загружено",
      });
    }

    const absolutePath = path.join(__dirname, "..", photoRelativePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        message: "Файл изображения не найден на сервере",
      });
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    const base64Image = fileBuffer.toString("base64");

    const ext = path.extname(photoRelativePath).toLowerCase();
    const mimeTypeMap = {
      ".jpg": "JPEG",
      ".jpeg": "JPEG",
      ".png": "PNG",
      ".pdf": "PDF",
    };
    const mimeType = mimeTypeMap[ext] || "JPEG";

    const iamToken = await getIamToken();

    const ocrResponse = await axios.post(
      YANDEX_OCR_URL,
      {
        mimeType,
        languageCodes: ["ru"],
        model: "passport",
        content: base64Image,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${iamToken}`,
          "x-folder-id": process.env.CATALOG_ID,
          "x-data-logging-enabled": "false",
        },
      }
    );

    const textAnnotation = ocrResponse.data?.result?.textAnnotation;
    const entities = textAnnotation?.entities || [];
    const fullText = textAnnotation?.fullText || "";

    if (entities.length === 0) {
      console.warn(
        `[recognizePassport] Паспортные поля не распознаны. userId: ${userId}`
      );
      return res.status(422).json({
        message:
          "Не удалось распознать данные паспорта. Проверьте качество фотографии.",
        fullText,
      });
    }

    const passportData = entities.reduce((acc, entity) => {
      acc[entity.name] = entity.text;
      return acc;
    }, {});

    await User.findByIdAndUpdate(userId, {
      $set: {
        "passport.series_number": passportData.number || "",
        "passport.date": passportData.issue_date || "",
        "passport.department_code": passportData.subdivision || "",
        "passport.issued_by": passportData.issued_by || "",
        "passport.birth": passportData.birth_date || "",
        "passport.place_of_birth": passportData.birth_place || "",
        "passport.name": passportData.name || "",
        "passport.middle_name": passportData.middle_name || "",
        "passport.surname": passportData.surname || "",
        "passport.gender": passportData.gender || "",
        "passport.citizenship": passportData.citizenship || "",
        fullName:
          [passportData.surname, passportData.name, passportData.middle_name]
            .filter(Boolean)
            .join(" ") || undefined,
      },
    });

    res.json({
      success: true,
      passportData,
      // Поля из документации модели "passport":
      // name          — имя
      // middle_name   — отчество
      // surname       — фамилия
      // gender        — пол
      // citizenship   — гражданство
      // birth_date    — дата рождения
      // birth_place   — место рождения
      // number        — серия и номер паспорта
      // issued_by     — кем выдан
      // issue_date    — дата выдачи
      // subdivision   — код подразделения
      // expiration_date — дата окончания (для иностранных паспортов)
    });
  } catch (error) {
    if (error.response?.data) {
      console.error(
        "[recognizePassport] Ошибка Yandex OCR:",
        error.response.data
      );
      return res.status(502).json({
        message: "Ошибка сервиса распознавания",
        details: error.response.data,
      });
    }

    console.error("[recognizePassport] Ошибка:", error.message);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};
