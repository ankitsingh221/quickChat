import { useState, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import {
  X,
  Users,
  Edit2,
  UserPlus,
  LogOut,
  Trash2,
  Settings,
  Info,
  Camera,
  Loader2,
  Crop,
} from "lucide-react";
import AddMembersModal from "./AddMembersModal";
import GroupSettingsModal from "./GroupSettingsModal";
import GroupMembersModal from "./GroupMembersModal";
import ImageCropper from "../ImageCropper";
import toast from "react-hot-toast";

function GroupInfoModal({ onClose }) {
  const {
    selectedGroup,
    updateGroupInfo,
    leaveGroup,
    deleteGroup,
    isUpdatingGroup,
  } = useChatStore();
  const { authUser } = useAuthStore();

  const [showMembers, setShowMembers] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  useEffect(() => {
    if (selectedGroup) {
      setGroupName(selectedGroup.groupName || "");
      setGroupDescription(selectedGroup.groupDescription || "");
    }
  }, [selectedGroup]);

  // Early return after hooks
  if (!selectedGroup) return null;

  // Permission logic with safe optional chaining
  const isCreator =
    typeof selectedGroup.createdBy === "string"
      ? selectedGroup.createdBy === authUser?._id
      : (selectedGroup.createdBy?._id || selectedGroup.createdBy) ===
        authUser?._id;

  const isAdmin = selectedGroup.admins?.some((admin) =>
    typeof admin === "string"
      ? admin === authUser?._id
      : admin?._id === authUser?._id
  );

  const hasAdminPowers = isCreator || isAdmin;
  const canEditInfo =
    isCreator || isAdmin || !selectedGroup.settings?.onlyAdminsCanEditGroupInfo;

  // Handle new image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setTempImage(reader.result);
        setIsEditingExisting(false);
        setShowCropper(true);
      };
      reader.onerror = () => {
        toast.error("Failed to read image file");
      };
    } catch (error) {
      toast.error("Error processing image",error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle editing existing group picture
  const handleEditExistingImage = () => {
    if (selectedGroup?.groupPic) {
      setTempImage(selectedGroup.groupPic);
      setIsEditingExisting(true);
      setShowCropper(true);
    } else {
      toast.error("No group picture to edit");
    }
  };

  // Handle cropped image upload with proper rollback
  const handleCropComplete = async (croppedImage) => {
    setShowCropper(false);

    // Store original before optimistic update
    const originalGroup = { ...selectedGroup };

    // Optimistically update the UI
    const updatedGroup = { ...selectedGroup, groupPic: croppedImage };
    useChatStore.setState({ selectedGroup: updatedGroup });

    try {
      await updateGroupInfo(selectedGroup._id, { groupPic: croppedImage });
    } catch (error) {
      // Rollback on error
      useChatStore.setState({ selectedGroup: originalGroup });
      toast.error(error?.message || "Failed to update group picture");
    } finally {
      setTempImage(null);
      setIsEditingExisting(false);
    }
  };

  // Handle save group info
  const handleSaveInfo = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    if (isSavingInfo) return;

    setIsSavingInfo(true);

    try {
      const success = await updateGroupInfo(selectedGroup._id, {
        groupName: groupName.trim(),
        groupDescription: groupDescription.trim(),
      });
      if (success) {
        setIsEditing(false);
        toast.success("Group updated successfully");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to update group info");
    } finally {
      setIsSavingInfo(false);
    }
  };

  // Handle leave group
  const handleLeaveGroup = async () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        await leaveGroup(selectedGroup._id);
        onClose();
        toast.success("Left group successfully");
      } catch (error) {
        toast.error(error?.message || "Failed to leave group");
      }
    }
  };

  // Handle delete group
  const handleDeleteGroup = async () => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      try {
        await deleteGroup(selectedGroup._id);
        onClose();
        toast.success("Group deleted successfully");
      } catch (error) {
        toast.error(error?.message || "Failed to delete group");
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Info size={18} className="text-cyan-400" /> Group Info
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                  {selectedGroup.groupPic ? (
                    <img
                      src={selectedGroup.groupPic}
                      alt="Group"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-12 h-12 text-white/40" />
                  )}
                </div>

                {hasAdminPowers && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {/* Edit/Crop existing image button */}
                    {selectedGroup.groupPic && (
                      <button
                        onClick={handleEditExistingImage}
                        disabled={isUpdatingGroup || isUploading}
                        className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:scale-110 transition-transform duration-300 disabled:opacity-50"
                        title="Edit current picture"
                      >
                        <Crop size={14} />
                      </button>
                    )}

                    {/* Upload new image button */}
                    <label className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer disabled:opacity-50">
                      {isUpdatingGroup || isUploading ? (
                        <Loader2 size={14} className="text-white animate-spin" />
                      ) : (
                        <Camera size={14} className="text-white" />
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUpdatingGroup || isUploading}
                      />
                    </label>
                  </div>
                )}
              </div>

              <p className="text-white/40 text-xs mt-6 text-center">
                Click crop to edit or click camera to upload new picture
              </p>

              {/* Title & Description Editing */}
              <div className="mt-4 w-full text-center">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      className="w-full bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none text-center font-medium placeholder:text-white/30"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Group Name"
                    />
                    <textarea
                      className="w-full bg-white/10 border border-white/20 text-white/80 px-4 py-2 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm min-h-[80px] resize-none placeholder:text-white/30"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="Add a description..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveInfo}
                        disabled={isUpdatingGroup || isSavingInfo}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-600 py-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                      >
                        {isUpdatingGroup || isSavingInfo ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-xl text-sm font-medium text-white/80 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-xl font-semibold text-white truncate max-w-[250px]">
                        {selectedGroup.groupName}
                      </h3>
                      {canEditInfo && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-1 text-white/40 hover:text-cyan-400 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-white/40 mt-1">
                      {selectedGroup.groupDescription ||
                        "No description provided."}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Stats / Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowMembers(true)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <span className="text-2xl font-bold text-cyan-400">
                  {selectedGroup.members?.length || 0}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
                  Members
                </span>
              </button>

              <button
                onClick={() => setShowAddMembers(true)}
                disabled={!hasAdminPowers}
                className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <UserPlus size={20} className="text-green-400" />
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
                  Add People
                </span>
              </button>
            </div>

            {/* Menu Options */}
            <div className="space-y-1 pt-2 border-t border-white/10">
              {hasAdminPowers && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all"
                >
                  <Settings size={18} />
                  <span className="text-sm">Group Settings</span>
                </button>
              )}

              {!isCreator && (
                <button
                  onClick={handleLeaveGroup}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={18} />
                  <span className="text-sm">Leave Group</span>
                </button>
              )}

              {isCreator && (
                <button
                  onClick={handleDeleteGroup}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={18} />
                  <span className="text-sm">Delete Group</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && tempImage && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setShowCropper(false);
            setTempImage(null);
            setIsEditingExisting(false);
          }}
        />
      )}

      {/* Sub-modals */}
      {showMembers && (
        <GroupMembersModal
          group={selectedGroup}
          isAdmin={hasAdminPowers}
          isCreator={isCreator}
          onClose={() => setShowMembers(false)}
        />
      )}
      {showAddMembers && (
        <AddMembersModal
          group={selectedGroup}
          onClose={() => setShowAddMembers(false)}
        />
      )}
      {showSettings && (
        <GroupSettingsModal
          group={selectedGroup}
          isCreator={isCreator}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}

export default GroupInfoModal;