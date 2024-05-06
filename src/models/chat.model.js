import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({


    chatUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    latestMessage: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ],
    isGroupChat: {
        type: Boolean,
        default: false,


    },
    groupAdmin: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],



}, {
    timestamps: true
})


const Chat = mongoose.model("Chat", chatSchema);

export default Chat;