import express from "express";
import { updateUser } from "../controllers/UserControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.patch("/update", verifyToken, updateUser);

export default router;
