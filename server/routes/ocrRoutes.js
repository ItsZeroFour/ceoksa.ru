import express from "express";
import { recognizePassport } from "../controllers/OcrControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/passport", verifyToken, recognizePassport);

export default router;