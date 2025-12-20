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
  markMessagesAsRead
} from "../controllers/messageController.js";
import protectRoute from "../middleware/authMiddleware.js";


const router = express.Router();

// Protect all routes
router.use(protectRoute);


router.get("/contacts", getAllContacts);
router.get("/conversations", getChatPartners);

router.get("/:id", getMessagesByUserId);

router.post("/send/:id", sendMessageToUser);


router.patch("/edit/:id", editMessage);


router.delete("/delete/forMe/:messageId", deleteForMe);
router.delete("/delete/forEveryone/:id", deleteForEveryone);

router.delete("/clear/:id", protectRoute, clearChat);

router.patch("/reaction/:messageId/",toggleReaction)
router.put("/read/:id", protectRoute, markMessagesAsRead);

export default router;
