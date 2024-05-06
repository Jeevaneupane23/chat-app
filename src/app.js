import express from "express";
import cors from "cors"
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(bodyParser.json());

app.use(express.json({
    limit: "50mb",
    extended: true
}))

app.use(cookieParser());


app.use(express.urlencoded({ extended: true, limit: "16kb" }))

app.use(express.static("public"))

import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes)
app.use('/api/message', messageRoutes);
app.use('/api/user', userRoutes);




export default app;