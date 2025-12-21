import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socketAuthMiddleware.js";
import User from "../models/user.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

const userSocketMap = new Map(); 

io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  const user = socket.user;
  const userId = user._id.toString();

  console.log("User connected:", user.fullName);

  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set());
  }
  userSocketMap.get(userId).add(socket.id);

  socket.join(userId);
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));


  //typing indicator
  socket.on("typing", ({ receiverId }) => {
    
    const receiverSocketIds = userSocketMap.get(receiverId);
    if (receiverSocketIds) {
      receiverSocketIds.forEach((socketId) => {
        io.to(socketId).emit("userTyping", { userId });
      });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketIds = userSocketMap.get(receiverId);
    if (receiverSocketIds) {
      receiverSocketIds.forEach((socketId) => {
        io.to(socketId).emit("userStopTyping", { userId });
      });
    }
  });


  // socket disconnet
  socket.on("disconnect", async () => {
    console.log("User disconnected:", user.fullName);

    const userSockets = userSocketMap.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      
      
      if (userSockets.size === 0) {
        userSocketMap.delete(userId);
        
        try {
          await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
          console.log(`updated lastSeen for ${user.fullName}`);
        } catch (error) {
          console.error("Error in updating lastSeen:", error);
        }
      }
    }

    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

export const getReceiverSocketIds = (userId) => {
  return userSocketMap.get(userId.toString()) || new Set();
};

export const emitToUser = (userId, event, payload) => {
  const socketIds = userSocketMap.get(userId.toString());
  if (socketIds) {
    socketIds.forEach((id) => io.to(id).emit(event, payload));
  }
};

export { io, app, server };