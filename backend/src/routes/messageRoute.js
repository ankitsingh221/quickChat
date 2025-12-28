import express from "express";
import {
  editMessage,
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessageToUser,
  deleteForMe,
  deleteForEveryone,
  clearChat,
  toggleReaction,
  markMessagesAsRead,
  deleteBulkMessages,
  sendMessageToGroup,
  getGroupMessages,
  markGroupMessagesAsSeen
} from "../controllers/messageController.js";
import protectRoute from "../middleware/authMiddleware.js";


const router = express.Router();

// middleware for Protect all routes
router.use(protectRoute);


router.get("/contacts", getAllContacts);
router.get("/conversations", getChatPartners);

router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessageToUser);


router.post("/group/:id/send", sendMessageToGroup);
router.get("/group/:id",  getGroupMessages);
router.put("/group/:id/read",  markGroupMessagesAsSeen);
  

router.patch("/edit/:id", editMessage);


router.delete("/delete/forMe/:messageId", deleteForMe);
router.delete("/delete/forEveryone/:id", deleteForEveryone);
router.post("/delete-bulk", deleteBulkMessages)
router.delete("/clear/:id", protectRoute, clearChat);


router.patch("/reaction/:messageId/",toggleReaction)
router.put("/read/:id", protectRoute, markMessagesAsRead);



export default router;
