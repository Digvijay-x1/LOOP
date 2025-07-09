import { Server } from "socket.io";
import http from "http";
import express from 'express';
import jwt from 'jsonwebtoken';
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

// Define CORS options - expanded to support emulators
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
        // Add common emulator IP patterns
        "exp://192.168.87.199:8081",
        "exp://192.168.87.74:8081", // Added specifically for your emulator
        /^exp:\/\/192\.168\.\d+\.\d+:8081$/, // Regex for dynamic IP addresses
        /^exp:\/\/\d+\.\d+\.\d+\.\d+:8081$/, // Regex for any IP with Expo port
        /^http:\/\/\d+\.\d+\.\d+\.\d+:8081$/  // HTTP version
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

console.log("Socket.io CORS config:", corsOptions);

const io = new Server(server, {
    cors: corsOptions,
    path: '/socket.io',  // Explicitly set the path
    // Enable all transports for better compatibility with emulators
    transports: ['websocket', 'polling'],
    // Increase timeouts for mobile connections
    pingTimeout: 30000,
    pingInterval: 25000,
    // Connection policies
    connectTimeout: 30000,
    // Debug mode for development
    debug: true
});

// Authentication middleware for Socket.io
io.use(async (socket, next) => {
    try {
        // Check for token in auth or query params
        const token = socket.handshake.auth?.token || 
                      socket.handshake.query?.token || 
                      socket.handshake.headers?.authorization?.split(' ')[1];
        
        if (!token) {
            console.log('Socket connection rejected: No token provided');
            return next(new Error('Authentication token is required'));
        }

        // Get userId from query params (this is our MongoDB user ID)
        const userId = socket.handshake.query.userId;
        const clerkId = socket.handshake.query.clerkId;
        
        if (!userId) {
            console.log('Socket connection rejected: No userId provided');
            return next(new Error('User ID is required'));
        }

        // Verify the user exists in our database
        try {
            const user = await User.findById(userId);
            if (!user) {
                console.log(`Socket connection rejected: User not found with ID ${userId}`);
                return next(new Error('User not found'));
            }

            // Attach user to socket for later use
            socket.user = {
                _id: user._id.toString(),
                clerkId: user.clerkId,
                username: user.username
            };
            
            console.log(`Socket authenticated for user: ${user.username} (${user._id})`);
            next();
        } catch (dbError) {
            console.error('Error verifying user in database:', dbError);
            return next(new Error('Error verifying user'));
        }
    } catch (error) {
        console.error('Socket authentication error:', error);
        return next(new Error('Authentication error'));
    }
});

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    console.log('connection query params:', socket.handshake.query);
    console.log('connection transport:', socket.conn.transport.name);

    const userId = socket.user?._id || socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId] = socket.id;
        // Emit updated online users list immediately after this user connects
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
        console.log('Current online users:', Object.keys(userSocketMap));
        
        // Send confirmation to the connected client
        socket.emit('connectionConfirmed', { 
            message: 'Successfully connected to server',
            socketId: socket.id,
            userId,
            username: socket.user?.username
        });
    } else {
        console.log('Warning: User connected without userId in query params');
        socket.emit('connectionError', { 
            message: 'Missing userId in connection parameters'
        });
    }

    // Handle new message event
    socket.on('sendMessage', (message) => {
        try {
            console.log('Message received:', message);
            if (!message || !message.receiverId) {
                console.error('Invalid message format:', message);
                socket.emit('messageError', { 
                    error: 'Invalid message format',
                    originalMessage: message
                });
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
                
                // Send confirmation back to sender
                socket.emit('messageSent', {
                    success: true,
                    messageId: formattedMessage._id,
                    timestamp: new Date().toISOString()
                });
            } else {
                console.log('Receiver not online:', message.receiverId);
                // Notify sender that receiver is offline
                socket.emit('receiverOffline', {
                    receiverId: message.receiverId,
                    messageId: message._id || `temp-${Date.now()}`
                });
            }
        } catch (error) {
            console.error('Error handling sendMessage:', error);
            socket.emit('messageError', { 
                error: error.message || 'Unknown error processing message',
                originalMessage: message
            });
        }
    });

    // Transport upgrade handling
    socket.conn.on('upgrade', (transport) => {
        console.log('Socket transport upgraded from', socket.conn.transport.name, 'to', transport.name);
    });

    socket.on('disconnect', (reason) => {
        console.log('a user disconnected', socket.id, 'reason:', reason);
        // Find and remove user from online users
        const disconnectedUserId = Object.keys(userSocketMap).find(
            key => userSocketMap[key] === socket.id
        );
        if (disconnectedUserId) {
            delete userSocketMap[disconnectedUserId];
            console.log(`User ${disconnectedUserId} removed from online users`);
        }
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