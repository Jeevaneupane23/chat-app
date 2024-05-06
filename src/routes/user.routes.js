import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { searchUser } from "../controllers/user.controller.js";
const router = Router();

router.get("/:search", verifyToken, searchUser);



export default router;