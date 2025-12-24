import mongoose from "mongoose";

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
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    settings: {
      onlyAdminsCanSend: { type: Boolean, default: false },
      onlyAdminsCanEditGroupInfo: { type: Boolean, default: true },
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

// Index for faster queries
groupSchema.index({ members: 1 });
groupSchema.index({ admins: 1 });

export default mongoose.model("Group", groupSchema);
