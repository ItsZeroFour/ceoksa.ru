import express from "express";
import {
  initiateAuth,
  handleNotification,
  handleSmsOtp,
  verifySmsCode,
  checkAuthStatus,
} from "../controllers/MobileControllers.js";

const router = express.Router();

router.post("/auth/init", initiateAuth);

router.post("/auth/verify", verifySmsCode);

router.get("/auth/status/:auth_req_id", checkAuthStatus);

router.post("/notifications", handleNotification);
router.post("/sms-otp", handleSmsOtp);

export default router;
