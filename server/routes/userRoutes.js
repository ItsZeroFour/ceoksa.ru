import express from "express";
import {
  deleteUser,
  saveConsentPdf,
  updateUser,
} from "../controllers/UserControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.patch("/update", verifyToken, updateUser);
router.delete("/delete", verifyToken, deleteUser);
router.post("/save-consent-pdf", verifyToken, saveConsentPdf);

export default router;
