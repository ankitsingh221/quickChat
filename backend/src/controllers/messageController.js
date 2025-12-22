import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketIds, io, emitToUser } from "../lib/socket.js";
import Message from "../models/message.js";
import User from "../models/user.js";
import mongoose from "mongoose";

const FIVE_MIN = 5 * 60 * 1000;

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const users = await User.find(
      { _id: { $ne: loggedInUserId } },
      "-password"
    );
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("getAllContacts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      deletedFor: { $ne: myId },
    })
      .sort({ createdAt: 1 })
      .populate("reactions.userId", "fullName profilePic")
      .lean();

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("getMessagesByUserId error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const sendMessageToUser = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { id: receiverId } = req.params;
    const { text, image, replyTo } = req.body;
    if (!text && !image)
      return res
        .status(400)
        .json({ success: false, message: "Text or image is required" });

    if (!mongoose.Types.ObjectId.isValid(receiverId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid receiver ID" });

    if (senderId.equals(receiverId))
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself",
      });

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists)
      return res
        .status(404)
        .json({ success: false, message: "Receiver not found" });

    let imageUrl;
    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image);
      imageUrl = uploadResult.secure_url;
    }

    const messageData = {
      senderId,
      receiverId,
      text,
      image: imageUrl,
    };

    if (replyTo) {
      messageData.replyTo = {
        _id: replyTo._id,
        text: replyTo.text || null,
        image: replyTo.image || null,
        senderId: replyTo.senderId,
      };
    }

    const newMessage = await Message.create(messageData);

    const receiverSockets = getReceiverSocketIds(receiverId);
    receiverSockets.forEach((socketId) =>
      io.to(socketId).emit("newMessage", newMessage)
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
      deletedFor: { $ne: loggedInUserId },
    })
      .sort({ createdAt: -1 })
      .lean();

    const chatMap = new Map();
    messages.forEach((msg) => {
      const partnerId =
        msg.senderId.toString() === loggedInUserId.toString()
          ? msg.receiverId.toString()
          : msg.senderId.toString();

      if (!chatMap.has(partnerId)) {
        chatMap.set(partnerId, msg);
      }
    });

    const partnerIds = Array.from(chatMap.keys());
    const users = await User.find({ _id: { $in: partnerIds } }, "-password");

    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          seen: false,
        });

        return {
          ...user.toObject(),
          lastMessage: chatMap.get(user._id.toString()),
          unreadCount,
        };
      })
    );

    //  Sort by last message date
    usersWithLastMessage.sort(
      (a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt
    );

    res.status(200).json({ success: true, users: usersWithLastMessage });
  } catch (error) {
    console.error("getChatPartners error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const message = await Message.findById(id);
    if (!message) return res.sendStatus(404);
    if (!message.senderId.equals(req.user._id)) return res.sendStatus(403);
    if (Date.now() - message.createdAt.getTime() > FIVE_MIN)
      return res.status(403).json({ message: "Edit time expired" });

    message.text = text;
    message.isEdited = true;
    await message.save();

    const receiverSockets = getReceiverSocketIds(message.receiverId);
    receiverSockets.forEach((socketId) =>
      io.to(socketId).emit("message:edited", message)
    );

    res.json(message);
  } catch (error) {
    console.error("editMessage error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteForMe = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        $addToSet: { deletedFor: req.user._id },
      },
      { new: true }
    );

    const sockets = getReceiverSocketIds(req.user._id);
    sockets.forEach((socketId) =>
      io.to(socketId).emit("message:deletedForMe", { messageId })
    );

    res.sendStatus(200);
  } catch (error) {
    console.error("deleteForMe error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteForEveryone = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) return res.sendStatus(404);
    if (!message.senderId.equals(req.user._id)) return res.sendStatus(403);
    if (Date.now() - message.createdAt.getTime() > FIVE_MIN)
      return res.status(403).json({ message: "Time expired" });

    message.isDeleted = true;
    message.text = null;
    message.image = null;
    await message.save();

    // Emit to all sockets of receiver
    const receiverSockets = getReceiverSocketIds(message.receiverId);
    receiverSockets.forEach((socketId) =>
      io.to(socketId).emit("message:deleted", { messageId: id })
    );

    res.sendStatus(200);
  } catch (error) {
    console.error("deleteForEveryone error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const clearChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: otherUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    await Message.updateMany(
      {
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      {
        $addToSet: { deletedFor: userId },
      }
    );

    res.status(200).json({
      success: true,
      message: "Chat cleared successfully",
    });
  } catch (error) {
    console.error("Clear chat error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid message ID" });
    }

    const message = await Message.findById(messageId);
    if (!message)
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });

    // 1. Find if user already reacted
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingReactionIndex > -1) {
      const existingEmoji = message.reactions[existingReactionIndex].emoji;

      //  remove the existing one (Toggle behavior)
      message.reactions.splice(existingReactionIndex, 1);

      // If the new emoji is different, add it. If it's the same, we leave it removed.
      if (existingEmoji !== emoji) {
        message.reactions.push({ userId, emoji });
      }
    } else {
      // 2. If no existing reaction, add new one
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // 3. Re-fetch and Populate to send full user objects (fullName, profilePic) to frontend
    const populatedMessage = await Message.findById(messageId)
      .populate("reactions.userId", "fullName profilePic")
      .lean();

    // 4. Emit via Socket.io
    const sockets = new Set([
      ...(getReceiverSocketIds(message.senderId) || []),
      ...(getReceiverSocketIds(message.receiverId) || []),
    ]);

    sockets.forEach((socketId) => {
      io.to(socketId).emit("message:reactionUpdated", {
        messageId: message._id.toString(),
        reactions: populatedMessage.reactions,
      });
    });

    res
      .status(200)
      .json({ success: true, reactions: populatedMessage.reactions });
  } catch (error) {
    console.error("toggleReaction error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messagesToMark = await Message.find({
      senderId: userToChatId,
      receiverId: myId,
      seen: false,
    }).select("_id");

    if (messagesToMark.length === 0) {
      return res.status(200).json({ message: "No unread messages" });
    }

    const messageIds = messagesToMark.map((m) => m._id.toString());

    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, seen: false },
      { $set: { seen: true } }
    );

    emitToUser(userToChatId, "messagesRead", {
      messageIds: messageIds,
      readBy: myId.toString(),
    });

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.log("Error in markMessagesAsRead controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteBulkMessages = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user._id;

    await Message.updateMany(
      {
        _id: { $in: messageIds },
      },
      {
        $addToSet: { deletedFor: userId },
      }
    );
    res.status(200).json({success:true});
  } catch (error) {
    res.status(500).json({message:"server error"});
  }
};
