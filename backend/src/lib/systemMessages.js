import Message from "../models/message.js";
import { emitToGroup } from "./socket.js";

export const createSystemMessage = async ({
  groupId,
  type,
  userId,
  userName,
  addedBy,
  addedByName,
}) => {
  try {
    // Generate system message text
    let text = "";
    switch (type) {
      case 'member_added':
        text = addedByName 
          ? `${addedByName} added  ${userName}` 
          : `${userName} joined`;
        break;
      case 'member_removed':
        text = `${addedByName} removed ${userName}`;
        break;
      case 'member_left':
        text = `${userName} left`;
        break;
      case 'admin_promoted':
        text = `${addedByName} made ${userName} an admin`;
        break;
      case 'group_created':
        text = `${userName} created this group`;
        break;
      default:
        text = "Group updated";
    }

    // Create the system message
    const systemMessage = await Message.create({
      senderId: userId, // Use the user who performed the action
      groupId,
      text,
      isSystemMessage: true,
      systemMessageType: type,
      systemMessageData: {
        userId,
        userName,
        addedBy,
        addedByName,
      },
    });

    await systemMessage.populate("senderId", "fullName profilePic");

    // Emit to all group members
    emitToGroup(groupId, "newGroupMessage", systemMessage);

    return systemMessage;
  } catch (error) {
    console.error("Error creating system message:", error);
    return null;
  }
};