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
        "exp://192.168.87.199:8081",
        // Add wildcard for Expo Go on various devices
        /^exp:\/\/.*$/,
        // Add wildcard for local development
        /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
        // Add wildcard for local network
        /^http:\/\/\d+\.\d+\.\d+\.\d+:\d+$/
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

console.log("Socket.io CORS config:", corsOptions);

const io = new Server(server, {
    cors: corsOptions,
    path: '/socket.io',  // Explicitly set the path
    transports: ['websocket', 'polling'], // Allow both transports
    pingTimeout: 30000, // Increase ping timeout
    pingInterval: 10000, // Decrease ping interval for more frequent checks
    connectTimeout: 30000, // Increase connection timeout
    allowEIO3: true, // Allow Engine.IO v3 client
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
        console.log('Message received:', message);
        const receiverSocketId = userSocketMap[message.receiverId];
        if (receiverSocketId) {
            // Send message to the specific receiver
            io.to(receiverSocketId).emit('newMessage', message);
            console.log('Message sent to:', receiverSocketId);
        } else {
            console.log('Receiver not online:', message.receiverId);
        }
    });

    // Handle test event
    socket.on('test', (data) => {
        console.log('Test event received:', data);
        // Echo back to sender
        socket.emit('testResponse', { message: 'Hello from server', received: data });
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected', socket.id);
        
        // Find and remove the user from the userSocketMap
        for (const [key, value] of Object.entries(userSocketMap)) {
            if (value === socket.id) {
                delete userSocketMap[key];
                break;
            }
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
    const receiverSocketId = userSocketMap[message.receiverId];
    if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', message);
        return true;
    }
    return false;
}

export {io, app, server, emitNewMessage};