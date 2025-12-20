import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socketAuthMiddleware.js";

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// Map to track multiple sockets per user (for multiple devices/tabs)
const userSocketMap = new Map(); // userId => Set of socketIds

// Middleware for authentication
io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  const user = socket.user;
  const userId = user._id.toString();

  console.log("User connected:", user.fullName);

  // Track sockets per user
  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set());
  }
  userSocketMap.get(userId).add(socket.id);

  socket.join(userId);

  // Emit online users
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  // Disconnect handler
  socket.on("disconnect", () => {
    console.log("User disconnected:", user.fullName);

    const userSockets = userSocketMap.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) userSocketMap.delete(userId);
    }

    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });

  // You can add more socket.on handlers here for:
  // sendMessage, editMessage, deleteMessage, addReaction, removeReaction
});

// Get all socket IDs for a user
export const getReceiverSocketIds = (userId) => {
  return userSocketMap.get(userId.toString()) || new Set();
};

// Emit to all sockets of a user
export const emitToUser = (userId, event, payload) => {
  const socketIds = userSocketMap.get(userId.toString());
  if (socketIds) {
    socketIds.forEach((id) => io.to(id).emit(event, payload));
  }
};

export { io, app, server };
