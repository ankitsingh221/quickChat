import { useState, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { X, Users, Edit2, UserPlus, LogOut, Trash2, Settings, Info, Camera, Loader2 } from "lucide-react";
import AddMembersModal from "./AddMembersModal";
import GroupSettingsModal from "./GroupSettingsModal";
import GroupMembersModal from "./GroupMembersModal";
import toast from "react-hot-toast";

function GroupInfoModal({ onClose }) {
  const { selectedGroup, updateGroupInfo, leaveGroup, deleteGroup, isUpdatingGroup } = useChatStore();
  const { authUser } = useAuthStore();

  const [showMembers, setShowMembers] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  useEffect(() => {
    if (selectedGroup) {
      setGroupName(selectedGroup.groupName || "");
      setGroupDescription(selectedGroup.groupDescription || ""); 
    }
  }, [selectedGroup]);

  if (!selectedGroup) return null;

  // Permission logics 
  const isCreator = (
    typeof selectedGroup.createdBy === "string" 
      ? selectedGroup.createdBy === authUser._id 
      : (selectedGroup.createdBy?._id || selectedGroup.createdBy) === authUser._id
  );

  const isAdmin = selectedGroup.admins?.some(id => 
    typeof id === "string" ? id === authUser._id : id._id === authUser._id
  );

  const hasAdminPowers = isCreator || isAdmin;
  const canEditInfo = isCreator || isAdmin || !selectedGroup.settings?.onlyAdminsCanEditGroupInfo;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Image must be under 2MB");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateGroupInfo(selectedGroup._id, { groupPic: base64Image });
    };
  };

  const handleSaveInfo = async () => {
    if (!groupName.trim()) return toast.error("Group name is required");
    const success = await updateGroupInfo(selectedGroup._id, {
      groupName: groupName.trim(),
      groupDescription: groupDescription.trim(),
    });
    if (success) setIsEditing(false);
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
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                  {selectedGroup.groupPic ? (
                    <img src={selectedGroup.groupPic} alt="Group" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-12 h-12 text-white/40" />
                  )}
                </div>
                {hasAdminPowers && (
                  <label className="absolute -bottom-1 -right-1 p-2 bg-cyan-500 hover:bg-cyan-600 rounded-full cursor-pointer shadow-md border-2 border-black/50 transition-all hover:scale-105">
                    {isUpdatingGroup ? <Loader2 size={14} className="text-white animate-spin" /> : <Camera size={14} className="text-white" />}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUpdatingGroup} />
                  </label>
                )}
              </div>

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
                      <button onClick={handleSaveInfo} disabled={isUpdatingGroup} className="flex-1 bg-cyan-500 hover:bg-cyan-600 py-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50">
                        {isUpdatingGroup ? "Saving..." : "Save"}
                      </button>
                      <button onClick={() => setIsEditing(false)} className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-xl text-sm font-medium text-white/80 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-xl font-semibold text-white truncate max-w-[250px]">{selectedGroup.groupName}</h3>
                      {canEditInfo && (
                        <button onClick={() => setIsEditing(true)} className="p-1 text-white/40 hover:text-cyan-400 transition-colors">
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-white/40 mt-1">
                      {selectedGroup.groupDescription || "No description provided."}
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
                <span className="text-2xl font-bold text-cyan-400">{selectedGroup.members?.length || 0}</span>
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Members</span>
              </button>
              
              <button 
                onClick={() => setShowAddMembers(true)} 
                disabled={!hasAdminPowers} 
                className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <UserPlus size={20} className="text-green-400" />
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Add People</span>
              </button>
            </div>

            {/* Menu Options */}
            <div className="space-y-1 pt-2 border-t border-white/10">
              {hasAdminPowers && (
                <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all">
                  <Settings size={18} /> 
                  <span className="text-sm">Group Settings</span>
                </button>
              )}
              
              {!isCreator && (
                <button onClick={() => leaveGroup(selectedGroup._id)} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                  <LogOut size={18} /> 
                  <span className="text-sm">Leave Group</span>
                </button>
              )}
              
              {isCreator && (
                <button onClick={() => deleteGroup(selectedGroup._id)} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 size={18} /> 
                  <span className="text-sm">Delete Group</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      {showMembers && <GroupMembersModal group={selectedGroup} isAdmin={hasAdminPowers} isCreator={isCreator} onClose={() => setShowMembers(false)} />}
      {showAddMembers && <AddMembersModal group={selectedGroup} onClose={() => setShowAddMembers(false)} />}
      {showSettings && <GroupSettingsModal group={selectedGroup} isCreator={isCreator} onClose={() => setShowSettings(false)} />}
    </>
  );
}

export default GroupInfoModal;