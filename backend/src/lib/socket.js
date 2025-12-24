import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socketAuthMiddleware.js";
import User from "../models/user.js";
import Group from "../models/group.js";

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

io.on("connection", async (socket) => {
  const user = socket.user;
  const userId = user._id.toString();

  console.log("User connected:", user.fullName);

  // Manage user connection mapping
  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set());
  }
  userSocketMap.get(userId).add(socket.id);

  // Join self-room for private messaging
  socket.join(userId);

  try {
    const userGroups = await Group.find({ members: userId }).select("_id");
    userGroups.forEach((group) => {
      const roomId = group._id.toString();
      socket.join(roomId);
      console.log(`User ${user.fullName} joined room: ${roomId}`);
    });
  } catch (error) {
    console.error("Error auto-joining groups:", error);
  }

  //

  // 1. Join Group Room (Manual - for when user creates/joins a new group)
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`User ${user.fullName} joined group room: ${groupId}`);
  });

  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId);
    console.log(`User ${user.fullName} left group room: ${groupId}`);
  });

  // join private chat (for 1-on-1 chats)
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${user.fullName} joined chat room: ${chatId}`);
  });

  socket.on("leaveChat", (chatId) => {
    if (chatId === userId) return;

    socket.leave(chatId);
    console.log(`User ${user.fullName} left chat room: ${chatId}`);
  });

  socket.on("typing", ({ chatId, isGroup }) => {
    if (isGroup) {
      socket.to(chatId).emit("userTyping", {
        chatId,
        userId,
        userName: user.fullName,
        isGroup: true,
      });
    } else {
      socket.to(chatId).emit("userTyping", {
        chatId: userId,
        userId,
        userName: user.fullName,
        isGroup: false,
      });
    }
  });

  socket.on("stopTyping", ({ chatId, isGroup }) => {
    if (isGroup) {
      socket
        .to(chatId)
        .emit("userStopTyping", { chatId, userId, isGroup: true });
    } else {
      socket
        .to(chatId)
        .emit("userStopTyping", { chatId: userId, userId, isGroup: false });
    }
  });

  socket.on("markGroupRead", ({ groupId, userId }) => {
    socket.to(groupId).emit("groupMessageReadUpdate", {
      groupId,
      userId,
    });

    console.log(`User ${userId} read messages in group: ${groupId}`);
  });
  //  group messge delivery recept
  socket.on("groupMessageDelivered", ({ groupId, messageId }) => {
    // Notify group members that this user received the message
    socket.to(groupId).emit("messageDelivered", {
      groupId,
      messageId,
      userId,
    });
  });

  // When user opens a group chat, emit their online status to that group
  socket.on("joinGroupView", (groupId) => {
    socket.to(groupId).emit("memberOnlineInGroup", {
      groupId,
      userId,
      userName: user.fullName,
    });
  });

  socket.on("leaveGroupView", (groupId) => {
    socket.to(groupId).emit("memberOfflineInGroup", {
      groupId,
      userId,
    });
  });

  // Online status broadcast (existing)
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  // Socket disconnect
  socket.on("disconnect", async () => {
    console.log("User disconnected:", user.fullName);

    const userSockets = userSocketMap.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);

      if (userSockets.size === 0) {
        userSocketMap.delete(userId);

        try {
          await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
          console.log(`Updated lastSeen for ${user.fullName}`);
        } catch (error) {
          console.error("Error updating lastSeen:", error);
        }
      }
    }
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

export const getReceiverSocketIds = (userId) => {
  return userSocketMap.get(userId?.toString()) || new Set();
};

export const emitToUser = (userId, event, payload) => {
  const socketIds = userSocketMap.get(userId?.toString());
  if (socketIds) {
    socketIds.forEach((id) => io.to(id).emit(event, payload));
  }
};

export const emitToGroup = (groupId, event, payload) => {
  io.to(groupId.toString()).emit(event, payload);
};

export const emitToGroupExcept = (groupId, excludeUserId, event, payload) => {
  const groupRoom = io.sockets.adapter.rooms.get(groupId.toString());
  if (!groupRoom) return;

  const excludeSocketIds = getReceiverSocketIds(excludeUserId);

  groupRoom.forEach((socketId) => {
    if (!excludeSocketIds.has(socketId)) {
      io.to(socketId).emit(event, payload);
    }
  });
};

export const getOnlineGroupMembers = (groupId) => {
  const groupRoom = io.sockets.adapter.rooms.get(groupId.toString());
  if (!groupRoom) return [];

  const onlineUsers = new Set();

  groupRoom.forEach((socketId) => {
    const socket = io.sockets.sockets.get(socketId);
    if (socket && socket.user) {
      onlineUsers.add(socket.user._id.toString());
    }
  });

  return Array.from(onlineUsers);
};

export const isUserInGroupRoom = (userId, groupId) => {
  const userSocketIds = getReceiverSocketIds(userId);
  const groupRoom = io.sockets.adapter.rooms.get(groupId.toString());

  if (!groupRoom || userSocketIds.size === 0) return false;

  for (const socketId of userSocketIds) {
    if (groupRoom.has(socketId)) return true;
  }

  return false;
};

export { io, app, server };
