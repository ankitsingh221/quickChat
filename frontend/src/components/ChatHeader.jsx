import React, { useEffect, useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import {
  XIcon,
  MoreVertical,
  Trash2,
  X,
  CheckSquare,
  Forward,
  Users,
  Info,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import GroupInfoModal from "./groups/GroupInfoModal";
import toast from "react-hot-toast";

function ChatHeader({ children }) {
  const {
    selectedUser,
    setSelectedUser,
    selectedGroup,
    setSelectedGroup,
    clearChat,
    typingUsers,
    groupTypingUsers,
    messages,
    isSelectionMode,
    selectedMessages = [],
    toggleSelectionMode,
    deleteSelectedMessages,
    setForwardingMessages,
    groupMessages,
  } = useChatStore();

  const { onlineUsers, authUser } = useAuthStore();

  const [showMenu, setShowMenu] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const menuRef = useRef(null);

  const isGroup = !!selectedGroup;

  const activeChatId = isGroup
    ? selectedGroup?._id?.toString()
    : selectedUser?._id?.toString();
  const isOnline = !isGroup && onlineUsers.includes(selectedUser?._id);

  const getTypingStatusText = () => {
    if (isGroup) {
      // Get array of users typing in THIS group from store
      const currentGroupTyping = groupTypingUsers[activeChatId] || [];
      const otherTypers = currentGroupTyping.filter(
        (u) => u.userId !== authUser?._id
      );

      if (otherTypers.length === 0) return null;

      const names = otherTypers.map(
        (u) => u.userName?.split(" ")[0] || "Someone"
      );

      if (names.length === 1) return `${names[0]} is typing...`;
      if (names.length === 2)
        return `${names[0]} and ${names[1]} are typing...`;
      return `${names[0]}, ${names[1]} and ${names.length - 2} others...`;
    } else {
      const isTyping =
        !isGroup && selectedUser && !!typingUsers[selectedUser._id.toString()];
      return isTyping ? "typing..." : null;
    }
  };

  const typingText = getTypingStatusText();

  // formater
  const formatLastSeen = (dateString) => {
    if (!dateString) return "offline";
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const time = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return isToday
      ? `last seen today at ${time}`
      : `last seen ${date.toLocaleDateString()}`;
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selection mode when chat changes
  useEffect(() => {
    return () => toggleSelectionMode(false);
  }, [activeChatId, toggleSelectionMode]);

  // slection mode header
  if (isSelectionMode) {
    return (
      <div className="flex justify-between items-center bg-slate-900 border-b border-cyan-500/50 min-h-[70px] px-6 animate-in slide-in-from-top duration-300 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => toggleSelectionMode(false)}
            className="p-2 hover:bg-white/10 rounded-full text-cyan-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <span className="text-slate-200 font-bold text-lg">
            {selectedMessages?.length || 0} selected
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => {
              // Choose the correct source based on chat type
              const sourceMessages = isGroup ? groupMessages : messages;
              // 3Filter using the correct source
              const msgsToForward = sourceMessages.filter((m) =>
                selectedMessages.some(
                  (id) => id.toString() === m._id.toString()
                )
              );

              if (msgsToForward.length > 0) {
                setForwardingMessages(msgsToForward);
                toggleSelectionMode(false);
              } else {
                toast.error("Could not find messages to forward");
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all"
          >
            <Forward className="w-5 h-5" />
            <span className="hidden md:inline">Forward</span>
          </button>
          <button
            onClick={deleteSelectedMessages}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
          >
            <Trash2 className="w-5 h-5" />
            <span className="hidden md:inline">Delete</span>
          </button>
        </div>
      </div>
    );
  }

  // regular heder
  return (
    <>
      <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 min-h-[70px] px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* AVATAR SECTION */}
          <div
            className={`avatar ${
              !isGroup && isOnline ? "online" : ""
            } cursor-pointer active:scale-95 transition-transform`}
            onClick={() => isGroup && setShowGroupInfo(true)}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-700 overflow-hidden bg-slate-800 flex items-center justify-center">
              {isGroup ? (
                selectedGroup.groupPic ? (
                  <img src={selectedGroup.groupPic} alt="group" />
                ) : (
                  <Users className="w-6 h-6 text-slate-500" />
                )
              ) : (
                <img
                  src={selectedUser?.profilePic || "/avatar.png"}
                  alt="user"
                />
              )}
            </div>
          </div>

          {/* NAME AND STATUS SECTION */}
          <div
            className="cursor-pointer overflow-hidden"
            onClick={() => isGroup && setShowGroupInfo(true)}
          >
            <h3 className="text-slate-200 font-semibold text-base md:text-lg leading-tight truncate max-w-[140px] md:max-w-[300px]">
              {isGroup
                ? selectedGroup.groupName || selectedGroup.name
                : selectedUser?.fullName}
            </h3>

            {/* Status Line: Shows Typing or Online Status */}
            <div className="text-[11px] md:text-xs flex items-center gap-1.5 h-4 mt-0.5">
              {typingText ? (
                <span className="text-cyan-400 font-medium animate-pulse truncate italic">
                  {typingText}
                </span>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-400 truncate">
                  {!isGroup && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isOnline ? "bg-green-500" : "bg-slate-500"
                      }`}
                    ></span>
                  )}
                  <span className="truncate lowercase">
                    {isGroup
                      ? `${selectedGroup.members?.length || 0} members`
                      : isOnline
                      ? "online"
                      : formatLastSeen(selectedUser?.lastSeen)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTIONS SECTION */}
        <div className="flex items-center gap-1 md:gap-2">
          {children}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className={`p-2 rounded-full transition-colors ${
                showMenu
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:bg-slate-700/50"
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    toggleSelectionMode(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <CheckSquare className="w-4 h-4 text-cyan-400" />{" "}
                  <span className="text-sm">Select Messages</span>
                </button>
                {isGroup && (
                  <button
                    onClick={() => {
                      setShowGroupInfo(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    <Info className="w-4 h-4 text-cyan-400" />{" "}
                    <span className="text-sm">Group Info</span>
                  </button>
                )}
                <div className="h-[1px] bg-slate-700 mx-2" />
                <button
                  onClick={() => {
                    clearChat(activeChatId, isGroup);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-600/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />{" "}
                  <span className="text-sm">Clear Chat</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() =>
              isGroup ? setSelectedGroup(null) : setSelectedUser(null)
            }
            className="p-2 hover:bg-red-500/10 rounded-full transition-colors group"
          >
            <XIcon className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
          </button>
        </div>
      </div>

      {isGroup && showGroupInfo && (
        <GroupInfoModal
          group={selectedGroup}
          onClose={() => setShowGroupInfo(false)}
        />
      )}
    </>
  );
}

export default ChatHeader;
