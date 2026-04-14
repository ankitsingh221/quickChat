import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { X, Users, Camera, Check, MessageSquare, AlignLeft, Search, Loader2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

function CreateGroupModal({ isOpen, onClose }) {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupPic, setGroupPic] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);

  const { createGroup, getAllContacts, allContacts, isUsersLoading, isCreatingGroup } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      getAllContacts();
    }
  }, [isOpen, getAllContacts]);

  if (!isOpen) return null;

  const filteredContacts = (allContacts || []).filter((contact) =>
    contact.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");

    const reader = new FileReader();
    reader.onloadend = () => setGroupPic(reader.result);
    reader.readAsDataURL(file);
  };

  const toggleMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return toast.error("Please enter a group name");
    if (selectedMembers.length < 1) return toast.error("Select at least 1 member");

    const success = await createGroup({
      groupName: groupName.trim(),
      groupDescription: groupDescription.trim(),
      memberIds: selectedMembers,
      groupPic: groupPic,
    });

    if (success) {
      onClose();
      setGroupName("");
      setGroupDescription("");
      setGroupPic(null);
      setSelectedMembers([]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-white">Create Group</h2>
            <p className="text-sm text-white/40 mt-0.5">Create a group to chat with multiple people</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 custom-scrollbar">
          
          {/* Group Photo */}
          <div className="flex items-center gap-4">
            <div 
              className="relative cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center overflow-hidden group-hover:border-cyan-500 transition-colors">
                {groupPic ? (
                  <img src={groupPic} alt="Group" className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-7 h-7 text-white/40 group-hover:text-cyan-400" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-1.5 shadow-md">
                <Camera size={12} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/70">Group Photo</p>
              <p className="text-xs text-white/30 mt-0.5">JPG, PNG or GIF. Max 2MB.</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Group Name <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Weekend Trip, Study Group"
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Description <span className="text-white/30 text-xs font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-white/30" />
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="What's this group about?"
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all h-20 resize-none"
              />
            </div>
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-white/70">
                Add Members <span className="text-cyan-400">*</span>
              </label>
              {selectedMembers.length > 0 && (
                <span className="text-xs text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-full">
                  {selectedMembers.length} selected
                </span>
              )}
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
              {isUsersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-cyan-500 w-5 h-5" />
                </div>
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    onClick={() => toggleMember(contact._id)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                      selectedMembers.includes(contact._id)
                        ? "bg-cyan-500/20 border border-cyan-500/30"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <img
                      src={contact.profilePic || "/avatar.png"}
                      className="w-9 h-9 rounded-full object-cover border border-white/20"
                      alt={contact.fullName}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/80">{contact.fullName}</p>
                    </div>
                    {selectedMembers.includes(contact._id) ? (
                      <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-white/30" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <UserPlus className="w-10 h-10 text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-white/30">No contacts found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedMembers.length < 1 || isCreatingGroup}
            className="flex-[1.5] px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isCreatingGroup ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Group
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;