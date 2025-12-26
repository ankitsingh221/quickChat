import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";

import ChatHeader from "../ChatHeader";
import MessageInput from "../MessageInput";
import MessagesLoadingSkeleton from "../MessagesLoadingSkeleton";
import NoChatHistoryPlaceholder from "../NoChatHistoryPlaceholder";
import MessageList from "./MessageList";
import ImageLightbox from "./ImageLightbox";
import MessageSearch from "./MessageSearch";

import useKeyboardSound from "../../hooks/useKeyboardSound";
import useReadReceipts from "../../hooks/useReadReceipts";
import useMessageActions from "../../hooks/useMessageActions";
import ForwardModal from "./ForwardModal";

const ChatContainer = () => {
  const { authUser, socket } = useAuthStore();
  const {
    selectedUser,
    selectedGroup,
    messages,
    groupMessages,
    isMessagesLoading,
    isGroupMessagesLoading,
    getMessagesByUserId,
    getGroupMessages,
    editMessage,
    deleteForMe,
    deleteForEveryone,
    toggleReaction,
    isSoundEnabled,
    markMessagesAsRead,
    markGroupMessagesAsSeen,
    getFilteredMessages,
    searchTerm,
    clearSearch,
    updateGroupUnreadCount, 
    groupUnreadCounts, 
    forwardingMessages,
    groupTypingUsers,
  } = useChatStore();

  const [selectedImg, setSelectedImg] = useState(null);
  const messageEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const isGroup = !!selectedGroup;
  const activeChatId = isGroup ? selectedGroup?._id : selectedUser?._id;
  const activeMessages = isGroup ? groupMessages || [] : messages || [];
  const isLoading = isGroup ? isGroupMessagesLoading : isMessagesLoading;

  const { playRandomKeyStrokeSound, playMessageReceivedSound } =
    useKeyboardSound();

  const typingUsers = isGroup ? groupTypingUsers[activeChatId] || [] : [];
  const otherTypingUsers = typingUsers.filter(
    (u) => u.userId !== authUser?._id
  );

  const messageActions = useMessageActions({
    editMessage,
    deleteForMe,
    deleteForEveryone,
    toggleReaction,
    isSoundEnabled,
    playRandomKeyStrokeSound,
     isGroup: isGroup,
    activeChatId: activeChatId,
  });

  const isCreator =
    isGroup &&
    (selectedGroup?.createdBy?._id || selectedGroup?.createdBy) ===
      authUser?._id;
  const isAdmin =
    isGroup &&
    selectedGroup?.admins?.some(
      (admin) => (admin._id || admin) === authUser?._id
    );
  const onlyAdminsCanSend =
    isGroup && selectedGroup?.settings?.onlyAdminsCanSend;
  const canSendMessage = !isGroup || !onlyAdminsCanSend || isAdmin || isCreator;

  // 1. Room Joining & Fetching
  useEffect(() => {
    if (!activeChatId) return;

    if (isGroup) {
      getGroupMessages(activeChatId);
      if (socket) {
        socket.emit("joinChat", activeChatId);
        socket.emit("joinGroup", activeChatId);
      }
    } else {
      getMessagesByUserId(activeChatId);
      if (socket) socket.emit("joinChat", activeChatId);
    }

    prevMessagesLengthRef.current = 0;

    return () => {
      if (socket && activeChatId) {
        socket.emit("leaveChat", activeChatId);
        if (isGroup) socket.emit("leaveGroup", activeChatId);
      }
    };
  }, [activeChatId, isGroup, socket, getMessagesByUserId, getGroupMessages]);

  // 2. Read Receipts Hook (Private only)
  useReadReceipts(
    isGroup ? null : selectedUser,
    messages,
    markMessagesAsRead,
    getMessagesByUserId
  );

  // 3. Mark Read Logic
  useEffect(() => {
    if (!activeChatId || !authUser?._id || isLoading) return;

    let shouldMarkAsRead = false;

    const performMarkAsRead = () => {
      if (document.hidden) return;

      const unreadCount = isGroup ? groupUnreadCounts[activeChatId] || 0 : 0;

      if (unreadCount > 0 || !isGroup) {
        if (isGroup) {
          markGroupMessagesAsSeen?.(activeChatId);
          updateGroupUnreadCount?.(activeChatId, 0);
        } else {
          markMessagesAsRead?.(activeChatId);
        }
        shouldMarkAsRead = false;
      }
    };

    // ⏱ Start the 3-second timer
    let timeoutId = setTimeout(() => {
      shouldMarkAsRead = true;
      performMarkAsRead();
    }, 2000);

    // Function to handle tab switching/focus
    const handleStateChange = () => {
      clearTimeout(timeoutId);
      if (!document.hidden) {
        timeoutId = setTimeout(() => {
          shouldMarkAsRead = true;
          performMarkAsRead();
        }, 3000);
      }
    };

    window.addEventListener("focus", handleStateChange);
    document.addEventListener("visibilitychange", handleStateChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("focus", handleStateChange);
      document.removeEventListener("visibilitychange", handleStateChange);

      if (shouldMarkAsRead) {
        performMarkAsRead();
      }
    };
  }, [
    activeChatId,
    isGroup,
    isLoading,
    authUser?._id,
    groupUnreadCounts,
    activeMessages.length,
    markGroupMessagesAsSeen,
    markMessagesAsRead,
    updateGroupUnreadCount,
  ]);

  // 4. Scrolling Logic
  useEffect(() => {
    if (isLoading || activeMessages.length === 0) return;
    const isFirstLoad = prevMessagesLengthRef.current === 0;

    if (isFirstLoad) {
      const firstUnreadIndex = activeMessages.findIndex((msg) => {
        const senderId = msg.senderId?._id || msg.senderId;
        if (senderId?.toString() === authUser?._id?.toString()) return false;
        return isGroup ? !msg.seenBy?.includes(authUser._id) : !msg.seen;
      });

      const timeoutId = setTimeout(() => {
        if (firstUnreadIndex !== -1) {
          const element = document.getElementById(
            `msg-${activeMessages[firstUnreadIndex]._id}`
          );
          if (element)
            element.scrollIntoView({ behavior: "auto", block: "center" });
        } else {
          messageEndRef.current?.scrollIntoView({ behavior: "auto" });
        }
        prevMessagesLengthRef.current = activeMessages.length;
      }, 50);
      return () => clearTimeout(timeoutId);
    } else if (activeMessages.length > prevMessagesLengthRef.current) {
      if (!searchTerm)
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      const latestMsg = activeMessages[activeMessages.length - 1];
      const sId = latestMsg?.senderId?._id || latestMsg?.senderId;
      if (sId?.toString() !== authUser?._id?.toString() && isSoundEnabled) {
        playMessageReceivedSound?.();
      }
      prevMessagesLengthRef.current = activeMessages.length;
    }
  }, [
    activeChatId,
    isLoading,
    activeMessages,
    authUser?._id,
    isGroup,
    searchTerm,
    isSoundEnabled,
    playMessageReceivedSound,
  ]);

  useEffect(() => {
    clearSearch?.();
  }, [activeChatId, clearSearch]);

  const filteredMessages = getFilteredMessages(activeMessages) || [];
  if (!activeChatId) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ChatHeader>
        <MessageSearch />
      </ChatHeader>
      <div
        className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar relative"
        style={{
          backgroundColor: "#0b141a",
          backgroundImage: `linear-gradient(rgba(18, 25, 31, 0.94), rgba(18, 25, 31, 0.94)), url("https://www.transparenttextures.com/patterns/cubes.png")`,
        }}
        onClick={(e) =>
          e.target === e.currentTarget && messageActions.closeAllMenus()
        }
      >
        {isLoading ? (
          <MessagesLoadingSkeleton />
        ) : filteredMessages.length > 0 ? (
          <div className="w-full flex flex-col space-y-2">
            <MessageList
              messages={filteredMessages}
              authUser={authUser}
              selectedUser={selectedUser}
              selectedGroup={selectedGroup}
              messageActions={messageActions}
              setSelectedImg={setSelectedImg}
            />
            <div ref={messageEndRef} className="h-2" />
          </div>
        ) : searchTerm ? (
          <div className="flex items-center justify-center h-full opacity-60">
            <p className="text-base-content/60">
              No messages found matching "
              <span className="text-primary">{searchTerm}</span>"
            </p>
          </div>
        ) : (
          <NoChatHistoryPlaceholder
            name={
              isGroup
                ? selectedGroup?.groupName || "Group"
                : selectedUser?.fullName || "User"
            }
          />
        )}
      </div>
      <ImageLightbox
        selectedImg={selectedImg}
        setSelectedImg={setSelectedImg}
      />
      {isGroup && otherTypingUsers.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-900/50 flex items-center gap-2">
          {/* Typing dots animation */}
          <div className="flex gap-1">
            <span className="size-1.5 rounded-full bg-[#5bc0de] animate-bounce [animation-delay:-0.3s]"></span>
            <span className="size-1.5 rounded-full bg-[#5bc0de] animate-bounce [animation-delay:-0.15s]"></span>
            <span className="size-1.5 rounded-full bg-[#5bc0de] animate-bounce"></span>
          </div>
          <p className="text-xs text-[#5bc0de] font-medium italic">
            {otherTypingUsers.map((u) => u.userName).join(", ")} is typing...
          </p>
        </div>
      )}
      {canSendMessage ? (
        <MessageInput
          replyTo={messageActions.replyTo}
          setReplyTo={messageActions.setReplyTo}
          isGroup={isGroup}
        />
      ) : (
        <div className="p-4 text-center text-slate-500 text-xs">
          Only admins can send messages.
        </div>
      )}
      {forwardingMessages?.length > 0 && <ForwardModal />}
    </div>
  );
};
export default ChatContainer;
