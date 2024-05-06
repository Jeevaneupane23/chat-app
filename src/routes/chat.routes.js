import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { createSingleChat, fetchAllChats, getChatWithId } from "../controllers/chat.controller.js";

const router = Router();

router.route("/:userId").post(verifyToken, createSingleChat)
router.route("/singleChat/:chatId").get(verifyToken, getChatWithId);

router.route("/all").get(verifyToken, fetchAllChats)



export default router;