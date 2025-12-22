import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { XIcon, MoreVertical, Trash2, X, CheckSquare, Forward } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader({ children }) {
  const { 
    selectedUser, 
    setSelectedUser, 
    clearChat, 
    typingUsers,
    messages,
    isSelectionMode,
    selectedMessages = [], 
    toggleSelectionMode,
    deleteSelectedMessages,
    setForwardingMessages  
  } = useChatStore();
  
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser?._id);
  const [showMenu, setShowMenu] = useState(false);
  const isTyping = typingUsers[selectedUser?._id];

  // Close selection mode if user switches chat
  useEffect(() => {
    return () => toggleSelectionMode(false);
  }, [selectedUser?._id, toggleSelectionMode]);

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        if (isSelectionMode) {
          toggleSelectionMode(false);
        } else {
          setSelectedUser(null);
        }
      }
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser, isSelectionMode, toggleSelectionMode]);

  // Handle Click Outside Menu
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) setShowMenu(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [showMenu]);

  const formatLastSeen = (dateString) => {
    if (!dateString) return "offline";
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    if (isToday) return `last seen today at ${time}`;
    if (isYesterday) return `last seen yesterday at ${time}`;
    return `last seen ${date.toLocaleDateString()} at ${time}`;
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear this chat? Messages will only be removed for you.")) {
      clearChat(selectedUser._id);
      setShowMenu(false);
    }
  };

  
  const handleBulkForward = () => {
    // If selectedMessages is an array of IDs, we filter the objects from the message list
    const msgsToForward = messages.filter(m => selectedMessages.includes(m._id));
    
    if (msgsToForward.length > 0) {
      setForwardingMessages(msgsToForward);
    }
  };

  //  rendering selection mode header
  if (isSelectionMode) {
    return (
      <div className="flex justify-between items-center bg-cyan-950 border-b border-cyan-500/30 min-h-[70px] px-6 animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => toggleSelectionMode(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-cyan-400"
          >
            <X className="w-6 h-6" />
          </button>
          <span className="text-slate-200 font-bold text-lg">
            {(selectedMessages?.length || 0)} selected
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* FORWARD BUTTON */}
          <button 
            onClick={handleBulkForward}
            disabled={selectedMessages?.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Forward className="w-5 h-5" />
            <span className="hidden md:inline font-semibold">Forward</span>
          </button>

          {/* DELETE BUTTON */}
          <button 
            onClick={deleteSelectedMessages}
            disabled={selectedMessages?.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-5 h-5" />
            <span className="hidden md:inline font-semibold">Delete</span>
          </button>
        </div>
      </div>
    );
  }

  //rendering normal header
  return (
    <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 min-h-[70px] px-6">
      <div className="flex items-center gap-3">
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-700 overflow-hidden">
            <img
              src={selectedUser?.profilePic || "/avatar.png"}
              alt={selectedUser?.fullName}
            />
          </div>
        </div>
        <div>
          <h3 className="text-slate-200 font-semibold text-base md:text-lg leading-tight">
            {selectedUser?.fullName}
          </h3>
          <div className="text-[11px] md:text-xs text-slate-400 flex items-center gap-1.5 tracking-wider">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500" : "bg-slate-500"}`}></span>
            <span className="lowercase">
              {isTyping ? (
                <span className="text-green-500 font-medium animate-pulse">typing...</span>
              ) : (
                isOnline ? "online" : formatLastSeen(selectedUser?.lastSeen)
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-3">
        {children}

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className={`p-2 rounded-full transition-colors ${showMenu ? "bg-slate-700" : "hover:bg-slate-700/50"}`}
          >
            <MoreVertical className="w-5 h-5 text-slate-400 hover:text-slate-200" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                   toggleSelectionMode(true);
                   setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Select Messages</span>
              </button>
              
              <div className="h-[1px] bg-slate-700 mx-2" />

              <button
                onClick={handleClearChat}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-200 hover:bg-red-600/20 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Clear Chat</span>
              </button>
            </div>
          )}
        </div>

        <div className="w-[1px] h-6 bg-slate-700 mx-1 md:mx-2" />

        <button 
          onClick={() => setSelectedUser(null)}
          className="p-2 hover:bg-slate-700/50 rounded-full transition-colors"
        >
          <XIcon className="w-5 h-5 text-slate-400 hover:text-white" />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;