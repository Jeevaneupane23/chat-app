import { Router } from "express";
import { getUser, login, logout, signup } from "../controllers/auth.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";
const router = Router();



router.post("/signup", upload.single("avatar")
    , signup)



router.post("/login", login)


router.post("/logout", verifyToken, logout)

router.get("/user", verifyToken, getUser)



export default router;