import express from "express";
import {
  handleNotification,
  handleSmsOtp,
} from "../controllers/MobileControllers.js";

const router = express.Router();

router.post("/notifications", handleNotification);
router.post("/sms-otp", handleSmsOtp);

export default router;
