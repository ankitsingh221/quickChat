import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socketAuthMiddleware.js";

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

  userSocketMap.set(userId, socket.id);

  socket.join(userId);

  // io.emit is used to  broadcast to all connected clients
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  // with socket.on we listen for events from the clients
  socket.on("disconnect", () => {
    console.log("User disconnected:", user.fullName);

    userSocketMap.delete(userId);

    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

export const getReceiverSocketId = (userId) => {
  return userSocketMap.get(userId.toString());
};

export { io, app, server };
