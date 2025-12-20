import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { XIcon, MoreVertical, Trash2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser, clearChat } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser?._id);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") setSelectedUser(null);
    };
    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [setSelectedUser]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) setShowMenu(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [showMenu]);

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear this chat? Messages will only be removed for you.")) {
      clearChat(selectedUser._id);
      setShowMenu(false);
    }
  };

  return (
    <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 max-h-[80px] px-6 flex-1">
      <div className="flex items-center gap-3">
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 h-12 rounded-full border-2 overflow-hidden">
            <img
              src={selectedUser?.profilePic || "/avatar.png"}
              alt={selectedUser?.fullName}
            />
          </div>
        </div>
        <div>
          <h3 className="text-slate-200 font-semibold text-lg">
            {selectedUser?.fullName}
          </h3>
          <div className="text-sm text-slate-400">
            {isOnline ? "online" : "offline"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* More Options Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 hover:bg-slate-700/50 rounded-full transition-colors"
          >
            <MoreVertical className="text-slate-400 hover:text-slate-200" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50">
              <button
                onClick={handleClearChat}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-200 hover:bg-red-600/20 hover:text-red-400 transition-colors rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Chat</span>
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button onClick={() => setSelectedUser(null)}>
          <XIcon className="text-slate-400 hover:text-slate-200 cursor-pointer" />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;