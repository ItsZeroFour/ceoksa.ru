import express from "express";
import { authComplete, authMe } from "../controllers/AuthControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/complete", authComplete);
router.get("/me", verifyToken, authMe);

export default router;
