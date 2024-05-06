import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { allMessages, sendMessage, updateViewBy } from "../controllers/message.controller.js";


const router = Router();


router.get("/all/:chatId", verifyToken, allMessages);
router.post("/send", verifyToken, sendMessage);
router.put("/update/:messageId", verifyToken, updateViewBy);


export default router;