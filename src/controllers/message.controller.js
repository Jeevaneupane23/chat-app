import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


export const sendMessage = asyncHandler(async (req, res) => {
    const { message, chatId } = req.body;


    if (!message || !chatId) {
        throw new ApiError(400, "Content and chatId are required")
    }

    const existedChat = await Chat.findById(chatId);

    if (!existedChat) {
        throw new ApiError(404, "Chat not found")
    }

    let newMessage = {
        chat: chatId,
        sender: req.user._id,
        message: message,

    }


    let createdMessage = await Message.create(newMessage);

    createdMessage = await Message.populate(createdMessage, { path: 'sender', select: 'fullName avatar' });

    createdMessage = await Chat.populate(createdMessage, { path: 'chat', select: 'chatUsers' });

    createdMessage = await User.populate(createdMessage, { path: 'chat.chatUsers', select: 'fullName avatar' });


    await Chat.findByIdAndUpdate(chatId, {
        latestMessage: createdMessage
    }, {
        new: true

    })

    if (!createdMessage) {
        throw new ApiError(500, "Error while sending message")
    }


    return res.status(200).json(new ApiResponse(200, createdMessage, "Message sent successfully"))

})



export const allMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    if (!chatId) {
        throw new ApiError(400, "Chat Id is required")
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat not found")
    }

    let messages = await Message.find({ chat: chatId }).populate("sender", "fullName avatar email").populate("chat").sort({ createdAt: 1 });

    messages = await User.populate(messages, { path: 'chat.chatUsers', select: 'fullName avatar' });

    if (!messages) {
        throw new ApiError(404, "No messages found")
    }
    return res.status(200).json(new ApiResponse(200, messages, "Messages found successfully"))
})

export const updateViewBy = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    if (!messageId) {
        throw new ApiError(400, "Chat Id is required")
    }
    const message = await Message.findById(messageId.toString()).populate("sender", "_id");







    if (!message) {
        throw new ApiError(404, "Message not found")
    }
    let newMessage;
    if (message.sender._id.toString() !== req.user._id.toString()) {
        newMessage = await Message.findByIdAndUpdate(messageId, {
            $addToSet: {
                readBy: req.user._id
            }
        }, {
            new: true
        }
        )
    }


    if (!newMessage) {
        throw new ApiError(500, "Error while updating message")
    }

    newMessage = await Message.populate(newMessage, { path: 'sender', select: 'fullName avatar' });
    newMessage
    newMessage = await Chat.populate(newMessage, { path: 'chat', select: 'chatUsers' });

    newMessage = await User.populate(newMessage, { path: 'chat.chatUsers', select: 'fullName avatar' });
    newMessage = await User.populate(newMessage, { path: 'readBy', select: 'fullName avatar' });

    return res.status(200).json(new ApiResponse(200, newMessage, "Message updated successfully"))

});