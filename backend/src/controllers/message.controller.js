import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../config/cloudinary.js";
import { io, emitNewMessage } from "../config/socket.js";

export const getMessages = async (req, res) =>{ 
    try {
        const {id:userToChatId} = req.params;
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [
                {$and: [{senderId: myId}, {receiverId: userToChatId}]},
                {$and: [{senderId: userToChatId}, {receiverId: myId}]}
            ]
        }).sort({ createdAt: 1 });
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages" })
    }
}

export const sendMessage = async (req, res) =>{
    try {
        const { content, image } = req.body; // Changed from text to content to match frontend
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!content && !image) {
            return res.status(400).json({ 
                error: "Message validation failed", 
                message: "Message must contain either text or an image" 
            });
        }

        let imageUrl;
        if(image){
            // Configure upload options with higher quality and performance settings
            const uploadOptions = {
                resource_type: "image",
                quality: "auto",
                fetch_format: "auto",
                // Add timeout settings for larger uploads
                timeout: 120000, // 2 minutes
            };
            
            const uploadResult = await cloudinary.uploader.upload(image, uploadOptions);
            imageUrl = uploadResult.secure_url;
        }
        
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text: content, // Map content to text field
            image: imageUrl,
        });

        // Convert Mongoose document to plain object and format for frontend
        const messageToSend = {
            ...newMessage.toObject(),
            _id: newMessage._id.toString(), // Ensure _id is a string
            fromUser: true, // Add this field for frontend compatibility
        };

        // Emit socket event for real-time messaging
        emitNewMessage(messageToSend);

        res.status(201).json(messageToSend);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ 
            error: "Failed to send message", 
            message: error.message,
            code: "SERVER_ERROR",
            status: 500
        });
    }
}