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
    const receiverSocketId = userSocketMap[message.receiverId];
    if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', message);
        return true;
    }
    return false;
}

export {io, app, server, emitNewMessage};