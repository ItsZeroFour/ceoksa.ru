import express from "express";
import {
  startVerification,
  getIdentificationStatus,
  completeIdentification,
  handleRimCallback,
  getCurrentIdentification,
  getRimPhoto,
} from "../controllers/RimControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/start-verification", verifyToken, startVerification);
router.get("/identification-status", verifyToken, getIdentificationStatus);
router.post("/complete-identification", verifyToken, completeIdentification);
router.get("/current-identification", verifyToken, getCurrentIdentification);
router.get("/photo/:objectName", verifyToken, getRimPhoto);

router.post("/callback", handleRimCallback);

export default router;
