import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.js";
import User from "../models/user.js";
import mongoose from "mongoose";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const users = await User.find(
      { _id: { $ne: loggedInUserId } },
      "-password"
    );

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("getAllContacts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 }) 
      .lean();

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("getMessagesByUserId error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const sendMessageToUser = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { id: receiverId } = req.params;
    const { text, image } = req.body;

    if (!text && !image) {
      return res.status(400).json({
        success: false,
        message: "Text or image is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver ID",
      });
    }

    if (senderId.equals(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself",
      });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    let imageUrl;
    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image);
      imageUrl = uploadResult.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

   
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

   
    const sentTo = await Message.distinct("receiverId", {
      senderId: loggedInUserId,
    });

    const receivedFrom = await Message.distinct("senderId", {
      receiverId: loggedInUserId,
    });

    const partnerIds = [...new Set([...sentTo, ...receivedFrom])];

    const users = await User.find(
      { _id: { $in: partnerIds } },
      "-password"
    );

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("getChatPartners error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
