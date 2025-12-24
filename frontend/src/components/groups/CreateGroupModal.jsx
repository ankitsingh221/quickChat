import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { X, Users, Camera, Check, MessageSquare, AlignLeft, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function CreateGroupModal({ isOpen, onClose }) {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupPic, setGroupPic] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);

  // 1. Destructure based on your specific slice names
  const { createGroup, getAllContacts, allContacts, isUsersLoading, isCreatingGroup } = useChatStore();

  // 2. Automatically fetch contacts when modal opens
  useEffect(() => {
    if (isOpen) {
      getAllContacts();
    }
  }, [isOpen, getAllContacts]);

  if (!isOpen) return null;

  // 3. Filter contacts based on search
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

    // 4. Payload matches your backend: groupName, groupDescription, memberIds, groupPic
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-800/30">
          <div>
            <h2 className="text-xl font-bold text-white">Create Group</h2>
            <p className="text-xs text-slate-400">Invite your friends to a new space</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Group Branding */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col items-center gap-2">
              <div 
                className="relative cursor-pointer group size-24"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="size-full rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-cyan-500 transition-colors">
                  {groupPic ? (
                    <img src={groupPic} alt="Group" className="size-full object-cover" />
                  ) : (
                    <Users className="size-10 text-slate-600 group-hover:text-cyan-500" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-cyan-600 p-2 rounded-xl text-white">
                  <Camera size={14} />
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>

            <div className="flex-1 space-y-3">
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 size-4 text-slate-500" />
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group Name *"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-500 outline-none"
                />
              </div>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 size-4 text-slate-500" />
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Description (Optional)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-cyan-500 outline-none h-20 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Member Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-semibold text-slate-300">Add Members</span>
              {isUsersLoading && <Loader2 className="animate-spin text-cyan-500 size-4" />}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your contacts..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-300 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    onClick={() => toggleMember(contact._id)}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer border transition-all ${
                      selectedMembers.includes(contact._id) 
                      ? "bg-cyan-500/10 border-cyan-500/30" 
                      : "bg-slate-800/40 border-transparent hover:bg-slate-800"
                    }`}
                  >
                    <img
                      src={contact.profilePic || "/avatar.png"}
                      className="size-8 rounded-full object-cover"
                    />
                    <span className="text-sm text-slate-300 truncate flex-1">{contact.fullName}</span>
                    {selectedMembers.includes(contact._id) && (
                      <div className="bg-cyan-500 rounded-full p-0.5"><Check className="text-white" size={12} /></div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-slate-500 text-xs italic">
                  {isUsersLoading ? "Loading contacts..." : "No contacts found"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-slate-800 bg-slate-800/20">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedMembers.length < 1 || isCreatingGroup}
            className="flex-[2] py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isCreatingGroup && <Loader2 className="animate-spin size-4" />}
            {isCreatingGroup ? "Creating..." : "Create Group Chat"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;