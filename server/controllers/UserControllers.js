import User from "../models/User.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const updateUser = async (req, res) => {
  const protected_fields = ["phone", "mts_sub", "lastAuthAt"];

  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Пользователь не авторизован",
      });
    }

    const updateData = { ...req.body };

    protected_fields.forEach((field) => {
      delete updateData[field];
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Ошибка при обновлении пользователя:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера при обновлении данных",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Пользователь не авторизован",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    const filePaths = [
      user.profilePhoto,
      ...Object.values(user.photos?.toObject?.() ?? user.photos ?? {}),
    ].filter(Boolean);

    await Promise.allSettled(
      filePaths.map((relativePath) => {
        const absolutePath = path.join(__dirname, "..", relativePath);
        console.log("Удален");

        return fs.unlink(absolutePath);
      })
    );

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: "Пользователь успешно удален",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера при удалении пользователя",
      error: error.message,
    });
  }
};

export const saveConsentPdf = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false });

    if (user.consentPdfPath) {
      return res.json({
        success: true,
        path: user.consentPdfPath,
        cached: true,
      });
    }

    const { pdfBase64 } = req.body;
    if (!pdfBase64) return res.status(400).json({ success: false });

    const filesDir = path.join(__dirname, "..", "files");
    await fs.mkdir(filesDir, { recursive: true });

    const filename = `${userId}_${Date.now()}.pdf`;
    const filePath = path.join(filesDir, filename);

    await fs.writeFile(filePath, pdfBase64, "base64");

    const relativePath = `/files/${filename}`;

    await User.findByIdAndUpdate(userId, { consentPdfPath: relativePath });

    res.json({ success: true, path: relativePath });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
