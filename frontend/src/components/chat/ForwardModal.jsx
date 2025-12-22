import React, { useState, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore"; 
import { X, Search, Send, CheckCircle2, Files, Loader2, Users, CheckSquare, Square } from "lucide-react";
import toast from "react-hot-toast";

const ForwardModal = () => {
  const { 
    allContacts: users = [], 
    forwardingMessages = [], 
    closeForwardModal, 
    forwardMessages,    
    getAllContacts,
    isUsersLoading 
  } = useChatStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTargetIds, setSelectedTargetIds] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [sentIds, setSentIds] = useState([]);

  useEffect(() => {
    if (forwardingMessages.length > 0) getAllContacts();
  }, [forwardingMessages, getAllContacts]);

  if (forwardingMessages.length === 0) return null;

  const filteredUsers = users.filter((user) =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //select all 
  const handleSelectAll = () => {
    if (selectedTargetIds.length === filteredUsers.length) {
      setSelectedTargetIds([]); 
    } else {
      const allIds = filteredUsers.map(u => u._id);
      setSelectedTargetIds(allIds); 
    }
  };

  const toggleUserSelection = (userId) => {
    if (sentIds.includes(userId)) return; 
    setSelectedTargetIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleFinalSend = async () => {
    if (selectedTargetIds.length === 0) return;
    setIsSending(true);
    let successCount = 0;

    for (const userId of selectedTargetIds) {
      const success = await forwardMessages(userId);
      if (success) {
        setSentIds((prev) => [...prev, userId]);
        successCount++;
      }
    }

    setIsSending(false);
    setSelectedTargetIds([]); 
    if (successCount > 0) {
      toast.success(`Forwarded successfully to ${successCount} contacts`);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={closeForwardModal}></div>

      <div className="relative bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[550px] border border-slate-700/50 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/40">
          <div>
            <h3 className="font-bold text-slate-100 text-lg leading-tight">Forward to</h3>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              {forwardingMessages.length} {forwardingMessages.length === 1 ? "Item" : "Items"} selected
            </p>
          </div>
          <button onClick={closeForwardModal} className="p-2 hover:bg-slate-700 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Search & Select All */}
        <div className="p-3 bg-slate-900 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full bg-slate-800 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors px-1"
          >
            {selectedTargetIds.length === filteredUsers.length ? <CheckSquare size={14}/> : <Square size={14}/>}
            {selectedTargetIds.length === filteredUsers.length ? "Deselect All" : "Select All Contacts"}
          </button>
        </div>

        {/* Contact List */}
        <div className="overflow-y-auto flex-1 p-2 bg-slate-900 min-h-[200px] custom-scrollbar">
          {isUsersLoading ? (
            <div className="flex justify-center py-10"><span className="loading loading-spinner text-cyan-500"></span></div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isSelected = selectedTargetIds.includes(user._id);
              const isSent = sentIds.includes(user._id);

              return (
                <div 
                  key={user._id} 
                  onClick={() => toggleUserSelection(user._id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected ? "bg-cyan-500/10" : "hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={user.profilePic || "/avatar.png"} className="w-9 h-9 rounded-full object-cover border border-slate-700" alt="" />
                    <span className={`font-medium text-sm ${isSelected ? "text-cyan-400" : "text-slate-300"}`}>
                      {user.fullName}
                    </span>
                  </div>
                  <div className={`flex items-center justify-center w-5 h-5 rounded border transition-all ${
                    isSent ? "bg-green-500 border-green-500 text-white" :
                    isSelected ? "bg-cyan-500 border-cyan-500 text-white" : "border-slate-600 text-transparent"
                  }`}>
                    <CheckCircle2 size={14} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-slate-600 text-sm italic">No contacts found</div>
          )}
        </div>

        {/* Footer Preview & Action */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700/50 flex flex-col gap-3">
            {/* RESTORED: Specific message preview */}
            <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-lg border border-slate-700/30">
                <div className="p-2 bg-cyan-500/10 rounded-md text-cyan-500">
                  <Files size={16} />
                </div>
                <div className="truncate">
                  <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Forwarding Content</p>
                  <p className="text-xs text-slate-400 truncate italic">
                    {forwardingMessages.length === 1 
                      ? (forwardingMessages[0].text || "📷 Image Content") 
                      : `${forwardingMessages.length} messages selected`}
                  </p>
                </div>
            </div>

            {selectedTargetIds.length > 0 ? (
              <button 
                onClick={handleFinalSend}
                disabled={isSending}
                className="w-full btn btn-primary flex items-center justify-center gap-2 font-bold py-2.5"
              >
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Send to {selectedTargetIds.length} contact{selectedTargetIds.length > 1 ? 's' : ''}</>}
              </button>
            ) : sentIds.length > 0 ? (
              <button onClick={closeForwardModal} className="w-full btn btn-ghost text-cyan-500 border border-cyan-500/20">Done</button>
            ) : (
              <p className="text-[10px] text-center text-slate-500 uppercase font-semibold">Select a contact to forward</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;