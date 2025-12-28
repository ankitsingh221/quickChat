import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketIds, io, emitToUser } from "../lib/socket.js";
import Message from "../models/message.js";
import User from "../models/user.js";
import Group from "../models/group.js";

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
    const { text, image, replyTo, isForwarded } = req.body;

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

    let imageUrl = null;
    if (image) {
      if (image.startsWith("http")) {
        imageUrl = image;
      } else {
        const uploadResult = await cloudinary.uploader.upload(image);
        imageUrl = uploadResult.secure_url;
      }
    }

    const messageData = {
      senderId,
      receiverId,
      text,
      image: imageUrl,
      isForwarded: isForwarded || false,
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
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const loggedInUserId = req.user._id;
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
      deletedFor: { $ne: loggedInUserId },
    })
      .sort({ createdAt: -1 })
      .lean();

    const chatMap = new Map();
    messages.forEach((msg) => {
      if (!msg.senderId || !msg.receiverId) return;

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
        try {
          const unreadCount = await Message.countDocuments({
            senderId: user._id,
            receiverId: loggedInUserId,
            seen: false,
          });

          const lastMsg = chatMap.get(user._id.toString());

          return {
            ...user.toObject(),
            lastMessage: lastMsg || null,
            unreadCount: unreadCount || 0,
          };
        } catch (innerErr) {
          return null;
        }
      })
    );
    const filteredUsers = usersWithLastMessage.filter((u) => u !== null);
    //sage sort
    filteredUsers.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const timeB = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return timeB - timeA;
    });

    return res.status(200).json({ success: true, users: filteredUsers });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      details: error.message,
    });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const message = await Message.findById(id).populate(
      "senderId",
      "fullName profilePic"
    );
    if (!message) return res.sendStatus(404);
    if (!message.senderId.equals(req.user._id)) return res.sendStatus(403);

    if (Date.now() - message.createdAt.getTime() > FIVE_MIN)
      return res.status(403).json({ message: "Edit time expired" });

    message.text = text;
    message.isEdited = true;
    await message.save();

    // real-time broadcast
    if (message.groupId) {
      // using helper from  socket.js to notify the whole group room
      io.to(message.groupId.toString()).emit("message:edited", message);
    } else {
      // Private chat logic
      const receiverSockets = getReceiverSocketIds(message.receiverId);
      receiverSockets.forEach((socketId) =>
        io.to(socketId).emit("message:edited", message)
      );
    }
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

    const payload = { messageId: id, groupId: message.groupId || null };

    if (message.groupId) {
      // Broadcast to group room
      io.to(message.groupId.toString()).emit("message:deleted", payload);
    } else {
      // Broadcast to private receiver
      const receiverSockets = getReceiverSocketIds(message.receiverId);
      receiverSockets.forEach((socketId) =>
        io.to(socketId).emit("message:deleted", payload)
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("deleteForEveryone error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const clearChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { isGroup } = req.query;
    const userId = req.user._id;

    let filter = {};
    if (isGroup === "true") {
      filter = { groupId: id };
    } else {
      filter = {
        $or: [
          { senderId: userId, receiverId: id },
          { senderId: id, receiverId: userId },
        ],
      };
    }

    // Important : We don't delete the message, we add the user to the "hidden" list
    await Message.updateMany(filter, {
      $addToSet: { deletedFor: userId },
    });

    res.status(200).json({ success: true, message: "Chat cleared" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Handle Toggle Logic
    const existingIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        message.reactions.splice(existingIndex, 1); // Remove if same emoji
      } else {
        message.reactions[existingIndex].emoji = emoji; // Update if different emoji
      }
    } else {
      message.reactions.push({ userId, emoji }); // Add new
    }

    await message.save();

    // CRITICAL: Populate user details so other clients see names/avatars
    const populated = await Message.findById(messageId)
      .populate("reactions.userId", "fullName profilePic")
      .lean();

    const reactionPayload = {
      messageId: message._id.toString(),
      reactions: populated.reactions,
      groupId: message.groupId || null,
    };

    // broadcast
    if (message.groupId) {
      io.to(message.groupId.toString()).emit(
        "message:reactionUpdated",
        reactionPayload
      );
    } else {
      // Send to both parties in private chat
      [message.senderId, message.receiverId].forEach((uId) => {
        getReceiverSocketIds(uId).forEach((sId) =>
          io.to(sId).emit("message:reactionUpdated", reactionPayload)
        );
      });
    }

    res.status(200).json({ success: true, reactions: populated.reactions });
  } catch (error) {
    res.status(500).json({ success: false });
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
    const { messageIds, isForEveryone } = req.body;
    const userId = req.user._id;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No messages selected" });
    }

    // Find the first message to identify the group/chat room
    const firstMsg = await Message.findById(messageIds[0]);
    if (!firstMsg)
      return res.status(404).json({ message: "Messages not found" });

    if (isForEveryone) {
      // Logic: Only mark messages as deleted if the current user is the sender
      await Message.updateMany(
        { _id: { $in: messageIds }, senderId: userId },
        { $set: { isDeleted: true, text: null, image: null } }
      );

      // Broadcast to others
      const payload = {
        messageIds,
        isForEveryone: true,
        groupId: firstMsg.groupId,
      };
      if (firstMsg.groupId) {
        io.to(firstMsg.groupId.toString()).emit(
          "messages:bulkDeleted",
          payload
        );
      } else {
        const partnerId = firstMsg.senderId.equals(userId)
          ? firstMsg.receiverId
          : firstMsg.senderId;
        getReceiverSocketIds(partnerId).forEach((sId) =>
          io.to(sId).emit("messages:bulkDeleted", payload)
        );
      }
    } else {
      // "Delete for Me" ->> works for any message in the chat
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $addToSet: { deletedFor: userId } }
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Bulk Delete Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during deletion" });
  }
};

export const sendMessageToGroup = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { id: groupId } = req.params;
    const { text, image, replyTo, isForwarded } = req.body;

    if (!text && !image) {
      return res.status(400).json({
        success: false,
        message: "Text or image is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if sender is a member
    if (!group.members.some((m) => m.equals(senderId))) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Check if only admins can send
    if (group.settings.onlyAdminsCanSend) {
      const isAdmin = group.admins.some((a) => a.equals(senderId));
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only admins can send messages in this group",
        });
      }
    }

    let imageUrl = null;
    if (image) {
      if (image.startsWith("http")) {
        imageUrl = image;
      } else {
        const uploadResult = await cloudinary.uploader.upload(image);
        imageUrl = uploadResult.secure_url;
      }
    }

    const messageData = {
      senderId,
      groupId,
      text,
      image: imageUrl,
      isForwarded: isForwarded || false,
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

    // Populate sender info
    await newMessage.populate("senderId", "fullName profilePic");

    // Update group's lastMessage
    group.lastMessage = newMessage._id;
    await group.save();

    // Emit to all group members EXCEPT sender
    group.members.forEach((memberId) => {
      if (!memberId.equals(senderId)) {
        const sockets = getReceiverSocketIds(memberId);
        sockets.forEach((socketId) => {
          io.to(socketId).emit("newGroupMessage", newMessage);
        });
      }
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("sendMessageToGroup error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid group ID" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const isMember = group.members?.some(
      (m) => m.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // 1. Get user's join time from memberJoinInfo
    const memberInfo = group.memberJoinInfo?.find(
      (info) => info.userId.toString() === userId.toString()
    );

    const joinedAt = memberInfo ? memberInfo.joinedAt : group.createdAt;

    // 2. Fetch messages with the date filter
    const messages = await Message.find({
      groupId,
      createdAt: { $gte: joinedAt },
      deletedFor: { $ne: userId },
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "fullName profilePic")
      .lean();

    res.status(200).json({
      success: true,
      messages: messages || [],
    });
  } catch (error) {
    console.error("getGroupMessages error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const markGroupMessagesAsSeen = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      groupId,
      senderId: { $ne: userId },
      seenBy: { $ne: userId },
    });

    if (messages.length === 0) {
      return res.status(200).json({ message: "No unread messages" });
    }

    await Message.updateMany(
      {
        groupId,
        senderId: { $ne: userId },
        seenBy: { $ne: userId },
      },
      {
        $addToSet: { seenBy: userId },
      }
    );

    // Emit to group members
    const group = await Group.findById(groupId);
    group.members.forEach((memberId) => {
      const sockets = getReceiverSocketIds(memberId);
      sockets.forEach((socketId) => {
        io.to(socketId).emit("groupMessagesRead", {
          groupId,
          userId,
          messageIds: messages.map((m) => m._id.toString()),
        });
      });
    });

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (error) {
    console.error("markGroupMessagesAsSeen error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
