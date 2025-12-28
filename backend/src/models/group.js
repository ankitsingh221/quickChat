import mongoose from "mongoose";

const memberJoinInfoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const groupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true, trim: true, maxlength: 100 },
    groupDescription: { type: String, default: "", maxlength: 500 },
    groupPic: { type: String, default: "" },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    
    // Track when each member joined
    memberJoinInfo: [memberJoinInfoSchema],
    
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    settings: {
      onlyAdminsCanSend: { type: Boolean, default: false },
      onlyAdminsCanEditGroupInfo: { type: Boolean, default: false },
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

groupSchema.index({ members: 1 });
groupSchema.index({ admins: 1 });

export default mongoose.model("Group", groupSchema);