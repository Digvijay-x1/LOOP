import { Server } from "socket.io";
import http from "http";
import express from 'express';

const app = express();
const server = http.createServer(app);

// Define CORS options
const corsOptions = {
    origin: [
        "https://loop-blond.vercel.app",
        "capacitor://localhost",
        "ionic://localhost",
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:19000", // Expo development server
        "http://localhost:19006", // Expo web
        "exp://localhost:19000",   // Expo Go app
        "exp://192.168.87.199:8081"
    ],
    credentials: true
};

console.log("Socket.io CORS config:", corsOptions);

const io = new Server(server, {
    cors: corsOptions,
    path: '/socket.io'  // Explicitly set the path
});

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    console.log('connection query params:', socket.handshake.query);

    const userId = socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId] = socket.id;
        // Emit updated online users list immediately after this user connects
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
        console.log('Current online users:', Object.keys(userSocketMap));
    } else {
        console.log('Warning: User connected without userId in query params');
    }

    // Handle new message event
    socket.on('sendMessage', (message) => {
        try {
            console.log('Message received:', message);
            if (!message || !message.receiverId) {
                console.error('Invalid message format:', message);
                return;
            }

            const receiverSocketId = userSocketMap[message.receiverId];
            if (receiverSocketId) {
                // Ensure message has required fields and handle undefined values
                const formattedMessage = {
                    ...message,
                    _id: message._id ? message._id.toString() : `temp-${Date.now()}`,
                    content: message.content || message.text || "",
                    fromUser: message.senderId === userId,
                    createdAt: message.createdAt || new Date().toISOString(),
                    updatedAt: message.updatedAt || new Date().toISOString()
                };

                // Send message to the specific receiver
                io.to(receiverSocketId).emit('newMessage', formattedMessage);
                console.log('Message sent to:', receiverSocketId);
            } else {
                console.log('Receiver not online:', message.receiverId);
            }
        } catch (error) {
            console.error('Error handling sendMessage:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected', socket.id);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
        console.log('Updated online users after disconnect:', Object.keys(userSocketMap));
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Function to emit a new message to a specific user
const emitNewMessage = (message) => {
    try {
        // Validate message object
        if (!message) {
            console.error('Message object is undefined in emitNewMessage');
            return false;
        }
        
        // Validate receiverId
        if (!message.receiverId) {
            console.error('receiverId is undefined in message:', message);
            return false;
        }

        const receiverSocketId = userSocketMap[message.receiverId];
        if (receiverSocketId) {
            // Create a safe copy of the message with fallbacks for all required fields
            const formattedMessage = {
                // Use spread operator only if message is a valid object
                ...(typeof message === 'object' && message !== null ? message : {}),
                
                // Ensure all required fields have fallback values
                _id: message._id ? message._id.toString() : `server-${Date.now()}`,
                content: message.content || message.text || "",
                fromUser: true, // This is always true for emitNewMessage as it's called after sending
                createdAt: message.createdAt || new Date().toISOString(),
                updatedAt: message.updatedAt || new Date().toISOString(),
                senderId: message.senderId || "unknown",
                receiverId: message.receiverId
            };

            // Log the formatted message for debugging
            console.log('Emitting formatted message:', formattedMessage);

            io.to(receiverSocketId).emit('newMessage', formattedMessage);
            console.log('Message emitted successfully to:', receiverSocketId);
            return true;
        }
        console.log('Receiver not online:', message.receiverId);
        return false;
    } catch (error) {
        console.error('Error in emitNewMessage:', error);
        return false;
    }
}

export {io, app, server, emitNewMessage};