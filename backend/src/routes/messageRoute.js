import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessageToUser,
} from "../controllers/messageController.js";
import  protectRoute  from "../middleware/authMiddleware.js";


const router = express.Router();

// protect all message routes
router.use(protectRoute);

router.get("/contacts", getAllContacts);

router.get("/conversations", getChatPartners); 

router.get("/:id", getMessagesByUserId);

router.post("/send/:id", sendMessageToUser);

export default router;
