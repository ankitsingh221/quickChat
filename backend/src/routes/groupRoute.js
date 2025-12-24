import express from "express";
import  protectRoute  from "../middleware/authMiddleware.js";
import {
  createGroup,
  getMyGroups,
  getGroupById,
  updateGroupInfo,
  addMembersToGroup,
  removeMemberFromGroup,
  makeAdmin,
  leaveGroup,
  deleteGroup,
} from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/my-groups", protectRoute, getMyGroups);
router.get("/:id", protectRoute, getGroupById);
router.put("/:id", protectRoute, updateGroupInfo);
router.post("/:id/add-members", protectRoute, addMembersToGroup);
router.delete("/:id/remove/:memberId", protectRoute, removeMemberFromGroup);
router.post("/:id/make-admin/:memberId", protectRoute, makeAdmin);
router.post("/:id/leave", protectRoute, leaveGroup);
router.delete("/:id", protectRoute, deleteGroup);

export default router;