import Group from "../models/group.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import {
  getReceiverSocketIds,
  io,
  emitToGroup,
  emitToUser,
} from "../lib/socket.js";
import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import { createSystemMessage } from "../lib/systemMessages.js";

// 1. Create a New Group
export const createGroup = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { groupName, groupDescription, memberIds, groupPic } = req.body;
    const creatorId = req.user._id.toString();
    const creator = req.user;

    if (
      !groupName ||
      !memberIds ||
      !Array.isArray(memberIds) ||
      memberIds.length < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Group name and at least 1 other member are required",
      });
    }

    const uniqueMemberIds = [...new Set(memberIds)].filter(
      (id) => id.toString() !== creatorId.toString()
    );

    const validMembers = await User.find({ _id: { $in: uniqueMemberIds } });
    if (validMembers.length !== uniqueMemberIds.length) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid member IDs provided" });
    }

    const allMembers = [creatorId, ...uniqueMemberIds];

    //  Create memberJoinInfo for all initial members
    const memberJoinInfo = allMembers.map((memberId) => ({
      userId: memberId,
      joinedAt: new Date(),
    }));

    let imageUrl = "";
    if (groupPic && groupPic.startsWith("data:image")) {
      const uploadRes = await cloudinary.uploader.upload(groupPic, {
        folder: "group_avatars",
      });
      imageUrl = uploadRes.secure_url;
    }

    const [newGroup] = await Group.create(
      [
        {
          groupName: groupName.trim(),
          groupDescription: groupDescription || "",
          groupPic: imageUrl,
          members: allMembers,
          memberJoinInfo,
          admins: [creatorId],
          createdBy: creatorId,
        },
      ],
      { session }
    );

    const populatedGroup = await newGroup.populate([
      { path: "members", select: "fullName profilePic isOnline" },
      { path: "admins", select: "fullName profilePic" },
      { path: "createdBy", select: "fullName profilePic" },
    ]);

    await session.commitTransaction();

    //Create system message
    await createSystemMessage({
      groupId: newGroup._id,
      type: "group_created",
      userId: creatorId,
      userName: creator.fullName,
    });

    allMembers.forEach((memberId) => {
      if (memberId.toString() === creatorId.toString()) return;

      emitToUser(memberId, "group:created", populatedGroup);
    });

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: populatedGroup,
    });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error("createGroup error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

// 2. Get All User Groups
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId })
      .populate("members", "fullName profilePic isOnline")
      .populate("admins", "fullName profilePic")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching groups" });
  }
};

// 3. Get Specific Group Details
export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id).populate(
      "members admins createdBy",
      "fullName profilePic isOnline"
    );

    if (!group || !group.members.some((m) => m._id.equals(req.user._id))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching group details" });
  }
};

// 4. Update Group Info
export const updateGroupInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { groupName, groupDescription, groupPic, settings } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group)
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });

    const isCreator = group.createdBy.toString() === userId.toString();
    const isAdmin = group.admins.some(
      (a) => a.toString() === userId.toString()
    );

    //  PERMISSION CHECK
    if (group.settings?.onlyAdminsCanEditGroupInfo && !isAdmin && !isCreator) {
      return res
        .status(403)
        .json({ success: false, message: "Only admins can edit info" });
    }

    //  settings protection (Only Creator)
    if (settings && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can change settings",
      });
    }

    // project updation object
    const updateData = {};
    if (groupName) updateData.groupName = groupName.trim();
    if (groupDescription !== undefined)
      updateData.groupDescription = groupDescription.trim();

    // Handle Nested Settings properly for Mongoose
    if (settings) {
      updateData["settings.onlyAdminsCanSend"] = settings.onlyAdminsCanSend;
      updateData["settings.onlyAdminsCanEditGroupInfo"] =
        settings.onlyAdminsCanEditGroupInfo;
    }

    // Handle Image
    if (groupPic && !groupPic.startsWith("http")) {
      const uploadResult = await cloudinary.uploader.upload(groupPic, {
        folder: "group_avatars",
      });
      updateData.groupPic = uploadResult.secure_url;
    }

    const updated = await Group.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate("members admins createdBy", "fullName profilePic isOnline");

    emitToGroup(id, "group:updated", updated);

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

//  addmembers to group
export const addMembersToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberIds } = req.body;
    const addedBy = req.user;

    if (!memberIds || !Array.isArray(memberIds)) {
      return res
        .status(400)
        .json({ success: false, message: "memberIds array is required" });
    }

    // Create memberJoinInfo for new members
    const newMemberJoinInfo = memberIds.map((memberId) => ({
      userId: memberId,
      joinedAt: new Date(),
    }));

    const updated = await Group.findByIdAndUpdate(
      id,
      {
        $addToSet: {
          members: { $each: memberIds },
          memberJoinInfo: { $each: newMemberJoinInfo },
        },
      },
      { new: true }
    ).populate("members admins", "fullName profilePic isOnline");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    // Create system messages for each added member
    const addedUsers = await User.find({ _id: { $in: memberIds } });

    for (const user of addedUsers) {
      await createSystemMessage({
        groupId: id,
        type: "member_added",
        userId: user._id,
        userName: user.fullName,
        addedBy: addedBy._id,
        addedByName: addedBy.fullName,
      });
    }

    emitToGroup(id, "group:updated", updated);

    memberIds.forEach((mId) => {
      emitToUser(mId, "group:created", updated);
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Add members backend error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update removeMemberFromGroup
export const removeMemberFromGroup = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user._id;
    const removedBy = req.user;

    if (!isValidObjectId(id) || !isValidObjectId(memberId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid IDs provided" });
    }

    const group = await Group.findById(id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const isAdmin = group.admins.some((a) => a.equals(userId));
    const isSelf = userId.equals(memberId);

    if (!isAdmin && !isSelf) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to remove member" });
    }

    // Get removed user info
    const removedUser = await User.findById(memberId);

    const updated = await Group.findByIdAndUpdate(
      id,
      {
        $pull: {
          members: memberId,
          admins: memberId,
          memberJoinInfo: { userId: memberId },
        },
      },
      { new: true }
    ).populate("members admins", "fullName profilePic");

    // Create system message
    await createSystemMessage({
      groupId: id,
      type: isSelf ? "member_left" : "member_removed",
      userId: removedUser._id,
      userName: removedUser.fullName,
      addedBy: isSelf ? null : removedBy._id,
      addedByName: isSelf ? null : removedBy.fullName,
    });

    emitToUser(memberId, "group:updated", updated);
    emitToGroup(id, "group:updated", updated);

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Remove Member Controller Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update makeAdmin
export const makeAdmin = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const promotedBy = req.user;

    const group = await Group.findById(id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (!group.admins.some((a) => a.equals(req.user._id))) {
      return res
        .status(403)
        .json({ success: false, message: "Admin privileges required" });
    }

    const updated = await Group.findByIdAndUpdate(
      id,
      { $addToSet: { admins: memberId } },
      { new: true }
    ).populate("members admins", "fullName profilePic isOnline");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    // Get promoted user info
    const promotedUser = await User.findById(memberId);

    // Create system message
    await createSystemMessage({
      groupId: id,
      type: "admin_promoted",
      userId: promotedUser._id,
      userName: promotedUser.fullName,
      addedBy: promotedBy._id,
      addedByName: promotedBy.fullName,
    });

    emitToGroup(id, "group:updated", updated);

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("makeAdmin error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to promote admin" });
  }
};

// leave group
export const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (group.createdBy.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "Creator cannot leave. Transfer ownership or delete group.",
      });
    }

    //  Remove user from members and admins
    group.members = group.members.filter((m) => !m.equals(userId));
    group.admins = group.admins.filter((a) => !a.equals(userId));
    await group.save();

    //  Define 'updated'  ( named :'updated' so emit functions work)
    const updated = await Group.findById(id)
      .populate("members", "fullName profilePic isOnline")
      .populate("admins", "fullName profilePic");

    await createSystemMessage({
      groupId: id,
      type: "member_left",
      userId: userId,
      userName: req.user.fullName,
    });
    // Tell the person who left to clear their screen
    emitToUser(userId.toString(), "group:updated", updated);

    // Tell the remaining members to update their list
    emitToGroup(id, "group:updated", updated);

    res.status(200).json({
      success: true,
      message: "Left group successfully",
    });
  } catch (error) {
    console.error("leaveGroup error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 8. Delete Group
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);

    if (!group.createdBy.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can delete the group",
      });
    }

    const memberIds = [...group.members];
    await Group.findByIdAndDelete(id);

    emitToGroup(memberIds, "group:deleted", { groupId: id });

    res.status(200).json({ success: true, message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};
