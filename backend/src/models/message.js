import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emoji: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function() { return !this.groupId; }
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    image: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  
    isEdited: {
      type: Boolean,
      default: false,
    },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    seen: {
      type: Boolean,
      default: false,
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reactions: [reactionSchema],
    replyTo: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      text: String,
      image: String,
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    isForwarded: { type: Boolean, default: false },
    
    // System message fields
    isSystemMessage: {
      type: Boolean,
      default: false,
    },
    systemMessageType: {
      type: String,
      enum: ['member_added', 'member_removed', 'member_left', 'admin_promoted', 'group_created', 'settings_changed'],
      default: null,
    },
    systemMessageData: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      userName: String,
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      addedByName: String,
    },
  },
  { timestamps: true }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ deletedFor: 1 });
messageSchema.index({ isSystemMessage: 1 });

export default mongoose.model("Message", messageSchema);