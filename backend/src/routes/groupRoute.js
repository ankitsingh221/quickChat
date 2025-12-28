import express from "express";
import protectRoute from "../middleware/authMiddleware.js";
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

router.use(protectRoute);

router.post("/create", createGroup);
router.get("/my-groups", getMyGroups);
router.get("/:id", getGroupById);
router.put("/:id", updateGroupInfo);
router.post("/:id/add-members", addMembersToGroup);
router.delete("/:id/remove/:memberId", removeMemberFromGroup);
router.post("/:id/make-admin/:memberId", makeAdmin);
router.post("/:id/leave", leaveGroup);
router.delete("/:id", deleteGroup);

export default router;
