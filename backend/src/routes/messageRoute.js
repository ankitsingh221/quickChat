import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessageToUser,
} from "../controllers/messageController.js";
import { protectRoute } from "../middleware/auth.middleware.js";


const router = express.Router();

// protect all message routes
router.use(protectRoute);

router.get("/contacts", getAllContacts);

router.get("/conversations", getChatPartners); 

router.get("/messages/:userId", getMessagesByUserId);

router.post("/messages/:userId", sendMessageToUser);

export default router;
