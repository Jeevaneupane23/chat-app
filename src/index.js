import dotenv from "dotenv"
import connectDB from "./db/db.js"
import app from "./app.js"
import { Server } from 'socket.io';

dotenv.config({
    path: "./"
})

connectDB().then(() => {

    const server = app.listen(process.env.PORT || 8000, () => {

        console.log(`Server is Running At Port ${process.env.PORT}`);
    })

    const io = new Server(server, {
        pingTimeout: 60000,
        cors: {
            origin: process.env.CORS_ORIGIN,
        }
    });

    io.on('connection', (socket) => {



        socket.on("setup", (userId) => {
            socket.join(userId);
            socket.emit("connected", socket.id);
            console.log("User connected", userId);
        })

        socket.on("join chat", (chatId) => {
            socket.join(chatId);
            console.log("User joined chat", chatId)

        })

        socket.on("new message", (newMessage) => {

            let chatUsers = newMessage.chat.chatUsers;
            let senderId = newMessage.sender._id;


            chatUsers.forEach(user => {

                if (user._id !== senderId) {
                    socket.to(user._id).emit("message received", newMessage);

                }

            })


        })

        socket.on("message read", (readMsg) => {

            console.log("Message Read", readMsg);
            let chatUsers = readMsg.chat.chatUsers;
            let senderId = readMsg.sender._id;
            console.log(senderId, chatUsers);


            chatUsers.forEach(user => {
                console.log("user", user);

                if (user._id === senderId) {
                    socket.to(user._id).emit("read by update", readMsg);

                }

            })




        })






    })





}).catch((error) => {
    console.log("Mongo DB connection Failed ", error);
})

