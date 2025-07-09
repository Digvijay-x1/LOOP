import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../config/cloudinary.js";
import { io, emitNewMessage } from "../config/socket.js";

export const getMessages = async (req, res) =>{ 
    try {
        const {id:userToChatId} = req.params;
        const myId = req.user._id;

        // Validate user IDs
        if (!userToChatId || !myId) {
            return res.status(400).json({ 
                error: "Invalid request", 
                message: "User IDs are required",
                code: "VALIDATION_ERROR"
            });
        }

        const messages = await Message.find({
            $or: [
                {$and: [{senderId: myId}, {receiverId: userToChatId}]},
                {$and: [{senderId: userToChatId}, {receiverId: myId}]}
            ]
        }).sort({ createdAt: 1 });

        // Format messages for frontend
        const formattedMessages = messages.map(msg => ({
            ...msg.toObject(),
            _id: msg._id.toString(),
            fromUser: msg.senderId.toString() === myId.toString()
        }));

        res.status(200).json(formattedMessages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ 
            error: "Failed to fetch messages",
            message: error.message,
            code: "SERVER_ERROR",
            status: 500
        });
    }
}

export const sendMessage = async (req, res) =>{
    try {
        const { content, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        // Validate input
        if (!receiverId || !senderId) {
            return res.status(400).json({ 
                error: "Invalid request", 
                message: "Sender and receiver IDs are required",
                code: "VALIDATION_ERROR"
            });
        }

        if (!content && !image) {
            return res.status(400).json({ 
                error: "Message validation failed", 
                message: "Message must contain either text or an image",
                code: "VALIDATION_ERROR"
            });
        }

        // Verify receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                error: "User not found",
                message: "The recipient user does not exist",
                code: "NOT_FOUND"
            });
        }

        let imageUrl;
        if(image){
            try {
                const uploadOptions = {
                    resource_type: "image",
                    quality: "auto",
                    fetch_format: "auto",
                    timeout: 120000, // 2 minutes
                };
                
                const uploadResult = await cloudinary.uploader.upload(image, uploadOptions);
                imageUrl = uploadResult.secure_url;
            } catch (uploadError) {
                console.error("Image upload error:", uploadError);
                return res.status(500).json({
                    error: "Image upload failed",
                    message: "Failed to upload image. Please try again.",
                    code: "UPLOAD_ERROR"
                });
            }
        }
        
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text: content,
            image: imageUrl,
        });

        if (!newMessage) {
            throw new Error("Failed to create message in database");
        }

        // Format message for frontend
        const messageToSend = {
            ...newMessage.toObject(),
            _id: newMessage._id.toString(),
            fromUser: true,
            content: newMessage.text // Map text to content for frontend
        };

        // Emit socket event for real-time messaging
        const emitted = emitNewMessage(messageToSend);
        if (!emitted) {
            console.log("Message saved but recipient is offline");
        }

        res.status(201).json(messageToSend);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ 
            error: "Failed to send message", 
            message: error.message || "An unexpected error occurred",
            code: "SERVER_ERROR",
            status: 500
        });
    }
}