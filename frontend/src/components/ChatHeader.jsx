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
  const selectedUser = useChatStore((state) => state.selectedUser);
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const selectedGroup = useChatStore((state) => state.selectedGroup);
  const setSelectedGroup = useChatStore((state) => state.setSelectedGroup);
  const clearChat = useChatStore((state) => state.clearChat);
  const typingUsers = useChatStore((state) => state.typingUsers);
  const groupTypingUsers = useChatStore((state) => state.groupTypingUsers);
  const messages = useChatStore((state) => state.messages);
  const isSelectionMode = useChatStore((state) => state.isSelectionMode);

  const toggleSelectionMode = useChatStore(
    (state) => state.toggleSelectionMode,
  );
  const deleteSelectedMessages = useChatStore(
    (state) => state.deleteSelectedMessages,
  );
  const setForwardingMessages = useChatStore(
    (state) => state.setForwardingMessages,
  );
  const groupMessages = useChatStore((state) => state.groupMessages);
  const selectedMessages = useChatStore(
    (state) => state.selectedMessages || [],
  );

  const { onlineUsers, authUser } = useAuthStore();

  const [showMenu, setShowMenu] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const menuRef = useRef(null);

  const isGroup = !!selectedGroup;

  const activeChatId = isGroup
    ? selectedGroup?._id?.toString()
    : selectedUser?._id?.toString();
  const isOnline = !isGroup && onlineUsers.includes(selectedUser?._id);

  const getTypingStatusText = () => {
    if (isGroup) {
      const currentGroupTyping = groupTypingUsers[activeChatId] || [];
      const otherTypers = currentGroupTyping.filter(
        (u) => u.userId !== authUser?._id,
      );

      if (otherTypers.length === 0) return null;

      const names = otherTypers.map(
        (u) => u.userName?.split(" ")[0] || "Someone",
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showGroupInfo || showMenu) {
      Promise.resolve().then(() => {
        setShowGroupInfo(false);
        setShowMenu(false);
      });
    }
    return () => {
      if (isSelectionMode) {
        toggleSelectionMode(false);
      }
    };
  }, [activeChatId, toggleSelectionMode, isSelectionMode]);

  // Handle delete selected messages
  const handleDeleteSelected = async () => {
    if (selectedMessages.length === 0) {
      toast.error("No messages selected");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSelectedMessages("forMe");
      toast.success(`${selectedMessages.length} message(s) deleted`);
      toggleSelectionMode(false);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete messages");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle clear chat
  const handleClearChat = async () => {
    if (!activeChatId) {
      toast.error("Invalid chat");
      return;
    }

    setIsClearing(true);
    try {
      await clearChat(activeChatId, isGroup);
      toast.success("Chat cleared successfully");
      setShowMenu(false);
    } catch (error) {
      console.error("Clear chat error:", error);
      toast.error("Failed to clear chat");
    } finally {
      setIsClearing(false);
    }
  };

  if (isSelectionMode) {
    return (
      <div className="flex justify-between items-center bg-black/40 backdrop-blur-xl border-b border-white/10 min-h-[70px] px-6 animate-in slide-in-from-top duration-300 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => toggleSelectionMode(false)}
            className="p-2 hover:bg-white/10 rounded-full text-cyan-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <span className="text-white font-bold text-lg">
            {selectedMessages?.length || 0} selected
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => {
              const sourceMessages = isGroup ? groupMessages : messages;
              const msgsToForward = sourceMessages.filter((m) =>
                selectedMessages.some(
                  (id) => id.toString() === m._id.toString(),
                ),
              );

              if (msgsToForward.length > 0) {
                setForwardingMessages(msgsToForward);
                toggleSelectionMode(false);
              } else {
                toast.error("Could not find messages to forward");
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-cyan-400 rounded-lg transition-all"
          >
            <Forward className="w-5 h-5" />
            <span className="hidden md:inline">Forward</span>
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
            <span className="hidden md:inline">Delete</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center bg-black/30 backdrop-blur-md border-b border-white/10 min-h-[70px] px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* AVATAR SECTION */}
          <div
            className={`avatar ${
              !isGroup && isOnline ? "online" : ""
            } cursor-pointer active:scale-95 transition-transform`}
            onClick={() => {
              if (isGroup) setShowGroupInfo(true);
            }}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 overflow-hidden bg-white/5 flex items-center justify-center">
              {isGroup ? (
                selectedGroup.groupPic ? (
                  <img
                    src={selectedGroup.groupPic}
                    alt="group"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-white/40" />
                  </div>
                )
              ) : (
                <img
                  src={selectedUser?.profilePic || "/avatar.png"}
                  alt="user"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          {/* NAME AND STATUS SECTION */}
          <div
            className="cursor-pointer overflow-hidden"
            onClick={() => {
              if (isGroup) setShowGroupInfo(true);
            }}
          >
            <h3 className="text-white font-semibold text-base md:text-lg leading-tight truncate max-w-[140px] md:max-w-[300px]">
              {isGroup
                ? selectedGroup.groupName || selectedGroup.name
                : selectedUser?.fullName}
            </h3>

            <div className="text-[11px] md:text-xs flex items-center gap-1.5 h-4 mt-0.5">
              {typingText ? (
                <span className="text-cyan-400 font-medium animate-pulse truncate italic">
                  {typingText}
                </span>
              ) : (
                <div className="flex items-center gap-1.5 text-white/40 truncate">
                  {!isGroup && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isOnline ? "bg-cyan-500" : "bg-white/30"
                      }`}
                    ></span>
                  )}
                  <span
                    className={`truncate transition-colors duration-300 ${
                      !isGroup && isOnline
                        ? "text-cyan-400 font-medium"
                        : "text-white/40"
                    }`}
                  >
                    {isGroup
                      ? `${selectedGroup.members?.length || 0} members`
                      : isOnline
                        ? "Online"
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
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:bg-white/10"
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    toggleSelectionMode(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 transition-colors"
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
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 transition-colors"
                  >
                    <Info className="w-4 h-4 text-cyan-400" />{" "}
                    <span className="text-sm">Group Info</span>
                  </button>
                )}

                <div className="h-[1px] bg-white/10 mx-2" />
                <button
                  onClick={handleClearChat}
                  disabled={isClearing}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  {isClearing ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
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
            <XIcon className="w-5 h-5 text-white/40 group-hover:text-red-400" />
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
