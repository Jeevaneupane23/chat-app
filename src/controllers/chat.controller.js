import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createSingleChat = asyncHandler(async (req, res) => {

    const { userId } = req.params;


    if (!userId) {
        throw new ApiError(400, "User Id is required")
    }

    let chat = await Chat.find({
        isGroupChat: false,
        $and: [
            { chatUsers: { $elemMatch: { $eq: userId } } },
            { chatUsers: { $elemMatch: { $eq: req.user._id } } }
        ]
    }).populate("chatUsers", "-password")
        .populate("latestMessage")


    const receiver_user = await User.findById(userId).select("-password");

    if (!receiver_user) {
        throw new ApiError(404, "User not found")
    }




    if (chat?.length > 0) {


        return res.status(200).json(new ApiResponse(200, chat[0], "Chat found successfully"))


    } else {
        const receiver_user = await User.findById(userId).select("-password");

        if (!receiver_user) {
            throw new ApiError(404, "User not found")
        }

        let chatData = {

            chatUsers: [userId, req.user._id],
            isGroupChat: false,

        }

        const createdChat = await Chat.create(chatData);

        const new_chat = await Chat.findById(createdChat._id).populate("chatUsers", "-password").populate("latestMessage")



        if (new_chat) {
            return res.status(200).json(new ApiResponse(200, new_chat, "Chat created successfully"))
        }
    }

})

export const getChatWithId = asyncHandler(async (req, res) => {

    const { chatId } = req.params;

    if (!chatId) {
        throw new ApiError(400, "Chat Id is required")
    }

    const chat
        = await Chat.findById(chatId).populate("chatUsers", "-password")
            .populate("latestMessage")
            .populate("groupAdmin")
            .populate("latestMessage.sender", "fullName avatar email")

    if (!chat) {
        throw new ApiError(404, "Chat not found")
    }

    return res.status(200).json(new ApiResponse(200, chat, "Chat found successfully"))

})




export const fetchAllChats = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    let chats = await Chat.find({
        chatUsers: { $elemMatch: { $eq: userId } }

    }).populate("chatUsers", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })

    chats = await User.populate(chats, {
        path: "latestMessage.sender",
        select: "fullName avatar email"
    })




    if (chats?.length === 0) {

        throw new ApiError(404, "No chat found")
    }

    return res.status(200).json(new ApiResponse(200, chats, "Chats found successfully"))



})