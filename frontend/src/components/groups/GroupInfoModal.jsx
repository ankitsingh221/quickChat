import { useState, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { X, Users, Edit2, UserPlus, LogOut, Trash2, Settings, Info, Camera, Loader2, Lock } from "lucide-react";
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
  
  //  Check if user is the Creator (Super Admin)
  const isCreator = (
    typeof selectedGroup.createdBy === "string" 
      ? selectedGroup.createdBy === authUser._id 
      : (selectedGroup.createdBy?._id || selectedGroup.createdBy) === authUser._id
  );

  //  Check if user is an Admin
  const isAdmin = selectedGroup.admins?.some(id => 
    typeof id === "string" ? id === authUser._id : id._id === authUser._id
  );

  //  Creator can do ANYTHING, Admins can do most things
  const hasAdminPowers = isCreator || isAdmin;

  //  Logic for editing Name/Description 
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
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
               <Info size={18} className="text-cyan-400" /> Group Info
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="size-32 rounded-3xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden shadow-2xl">
                  {selectedGroup.groupPic ? (
                    <img src={selectedGroup.groupPic} alt="Group" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-16 h-16 text-slate-600" />
                  )}
                </div>
                {/* Only admins/creator can change group picture */}
                {hasAdminPowers && (
                  <label className="absolute -bottom-2 -right-2 p-3 bg-cyan-600 hover:bg-cyan-500 rounded-2xl cursor-pointer shadow-lg border-4 border-slate-900 transition-all hover:scale-110 active:scale-95">
                    {isUpdatingGroup ? <Loader2 size={18} className="text-white animate-spin" /> : <Camera size={18} className="text-white" />}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUpdatingGroup} />
                  </label>
                )}
              </div>

              {/* Title & Description Editing */}
              <div className="mt-6 w-full text-center px-2">
                {isEditing ? (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <input
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl focus:border-cyan-500 outline-none text-center font-bold"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Group Name"
                    />
                    <textarea
                      className="w-full bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-xl focus:border-cyan-500 outline-none text-sm min-h-[80px] resize-none"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="Add a description..."
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveInfo} disabled={isUpdatingGroup} className="flex-1 bg-cyan-600 hover:bg-cyan-500 py-2.5 rounded-xl text-xs font-bold text-slate-900 transition-colors disabled:opacity-50">
                        {isUpdatingGroup ? "Saving..." : "Save Changes"}
                      </button>
                      <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2.5 rounded-xl text-xs font-bold text-white transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-2xl font-bold text-white truncate max-w-[280px]">{selectedGroup.groupName}</h3>
                      {/*  'onlyAdminsCanEditGroupInfo' setting but Creator bypasses it */}
                      {canEditInfo && (
                        <button onClick={() => setIsEditing(true)} className="p-1 text-slate-500 hover:text-cyan-400 transition-colors">
                          <Edit2 size={16} />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      {selectedGroup.groupDescription || "No description provided."}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Stats / Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowMembers(true)} 
                className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 hover:border-cyan-500/30 transition-all"
              >
                <span className="text-2xl font-black text-cyan-400">{selectedGroup.members?.length || 0}</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Members</span>
              </button>
              
              <button 
                onClick={() => setShowAddMembers(true)} 
                disabled={!hasAdminPowers} 
                className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 hover:border-green-500/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <UserPlus size={24} className="text-green-400 mb-1" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Add People</span>
              </button>
            </div>

            {/* Menu Options */}
            <div className="space-y-1 pt-4 border-t border-slate-800">
              {/* Settings button - ONLY for Creator/Admins */}
              {hasAdminPowers && (
                <button onClick={() => setShowSettings(true)} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-800 text-slate-300 transition-all group">
                    <div className="flex items-center gap-3">
                      <Settings size={18} className="group-hover:rotate-45 transition-transform duration-500" /> 
                      <span className="text-sm font-medium">Group Settings</span>
                    </div>
                    <div className="size-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_cyan]" />
                </button>
              )}
              
              {/* Creator CANNOT leave, others CAN */}
              {!isCreator && (
                <button onClick={() => leaveGroup(selectedGroup._id)} className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut size={18} /> <span className="text-sm font-semibold">Leave Group</span>
                </button>
              )}
              
              {/* ONLY Creator can delete the entire group */}
              {isCreator && (
                <button onClick={() => deleteGroup(selectedGroup._id)} className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={18} /> <span className="text-sm font-semibold">Delete Group (Creator)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-modals - Passing live 'selectedGroup' to each */}
      {showMembers && <GroupMembersModal group={selectedGroup} isAdmin={hasAdminPowers} isCreator={isCreator} onClose={() => setShowMembers(false)} />}
      {showAddMembers && <AddMembersModal group={selectedGroup} onClose={() => setShowAddMembers(false)} />}
      {showSettings && <GroupSettingsModal group={selectedGroup} isCreator={isCreator} onClose={() => setShowSettings(false)} />}
    </>
  );
}

export default GroupInfoModal;