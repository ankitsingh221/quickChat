import React, { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import {
  XIcon,
  Trash2,
  X,
  CheckSquare,
  Forward,
  Users,
  Info,
  AlertTriangle,
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

  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

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

  // Handle delete selected messages
  const handleDeleteSelected = async () => {
    if (!activeChatId) {
      toast.error("No active chat selected");
      return;
    }

    if (!selectedMessages || selectedMessages.length === 0) {
      toast.error("No messages selected");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSelectedMessages(activeChatId, isGroup, "forMe");
      toast.success(
        `${selectedMessages.length} message(s) deleted successfully`,
      );
      toggleSelectionMode(false);
    } catch (error) {
      toast.error(error?.message || "Failed to delete messages");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle clear chat - opens modal instead of direct action
  const handleClearChatClick = () => {
    setShowClearChatModal(true);
  };

  // Confirm clear chat
  const confirmClearChat = async () => {
    if (!activeChatId) {
      toast.error("Invalid chat");
      return;
    }

    setIsClearing(true);
    setShowClearChatModal(false);

    try {
      await clearChat(activeChatId, isGroup);
      toast.success("Chat cleared successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to clear chat");
    } finally {
      setIsClearing(false);
    }
  };

  // Cancel clear chat
  const cancelClearChat = () => {
    setShowClearChatModal(false);
  };

  // Handle forward messages
  const handleForwardMessages = () => {
    const sourceMessages = isGroup ? groupMessages : messages;
    const msgsToForward = sourceMessages.filter((m) =>
      selectedMessages.some((id) => id.toString() === m._id.toString()),
    );

    if (msgsToForward.length > 0) {
      setForwardingMessages(msgsToForward);
      toggleSelectionMode(false);
      toast.success(`${msgsToForward.length} message(s) ready to forward`);
    } else {
      toast.error("Could not find messages to forward");
    }
  };

  // Handle select messages
  const handleSelectMessages = () => {
    toggleSelectionMode(true);
  };

  if (isSelectionMode) {
    return (
      <div className="flex justify-between items-center bg-black/40 backdrop-blur-xl border-b border-white/10 min-h-[70px] px-6 animate-in slide-in-from-top duration-300 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              toggleSelectionMode(false);
            }}
            className="p-2 hover:bg-white/10 rounded-full text-cyan-400 transition-colors"
            title="Cancel selection"
          >
            <X className="w-6 h-6" />
          </button>
          <span className="text-white font-bold text-lg">
            {selectedMessages?.length || 0} selected
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={handleForwardMessages}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-cyan-400 rounded-lg transition-all"
            title="Forward selected messages"
          >
            <Forward className="w-5 h-5" />
            <span className="hidden md:inline">Forward</span>
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all disabled:opacity-50"
            title="Delete selected messages"
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
            title={isGroup ? "Group info" : selectedUser?.fullName}
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

        {/* ACTIONS SECTION - DIRECT BUTTONS WITH TOOLTIPS */}
        <div className="flex items-center gap-1 md:gap-2">
          {children}

          {/* SELECT MESSAGES BUTTON */}
          <button
            onClick={handleSelectMessages}
            className="group relative p-2 rounded-full transition-all duration-200 text-white/40 hover:bg-white/10 hover:text-cyan-400"
            title="Select messages"
          >
            <CheckSquare className="w-5 h-5" />
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              Select Messages
            </span>
          </button>

          {/* GROUP INFO BUTTON (only for groups) */}
          {isGroup && (
            <button
              onClick={() => setShowGroupInfo(true)}
              className="group relative p-2 rounded-full transition-all duration-200 text-white/40 hover:bg-white/10 hover:text-cyan-400"
              title="Group information"
            >
              <Info className="w-5 h-5" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                Group Info
              </span>
            </button>
          )}

          {/* CLEAR CHAT BUTTON */}
          <button
            onClick={handleClearChatClick}
            disabled={isClearing}
            className="group relative p-2 rounded-full transition-all duration-200 text-white/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            title="Clear all messages"
          >
            {isClearing ? (
              <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              Clear Chat
            </span>
          </button>

          {/* CLOSE CHAT BUTTON */}
          <button
            onClick={() => {
              isGroup ? setSelectedGroup(null) : setSelectedUser(null);
            }}
            className="group relative p-2 rounded-full transition-all duration-200 text-white/40 hover:bg-red-500/10 hover:text-red-400"
            title="Close chat"
          >
            <XIcon className="w-5 h-5" />
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              Close Chat
            </span>
          </button>
        </div>
      </div>

      {/* CUSTOM CLEAR CHAT CONFIRMATION MODAL */}
      {showClearChatModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center gap-3 p-6 border-b border-white/10">
              <div className="p-2 bg-red-500/10 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Clear Chat</h3>
                <p className="text-sm text-white/40">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-white/80">
                Are you sure you want to clear all messages in this{" "}
                {isGroup ? "group" : "chat"}?
              </p>
              <p className="text-sm text-red-400/60 mt-2">
                ⚠️ This will permanently delete all messages from your view.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={cancelClearChat}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearChat}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors font-medium"
              >
                Yes, Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}

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
