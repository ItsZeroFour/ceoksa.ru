import express from "express";
import { deleteUser, updateUser } from "../controllers/UserControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.patch("/update", verifyToken, updateUser);
router.delete("/delete", verifyToken, deleteUser);

export default router;
