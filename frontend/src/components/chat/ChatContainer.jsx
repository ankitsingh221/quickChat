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
    updateUnreadCount,
    forwardingMessages,
    subscribeToMessages,
    subscribeToGroupEvents,
    unsubscribeFromMessages,
    unsubscribeFromGroupEvents,
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

  // permission logic for edit info of groups
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

  // 1. Subscriptions
  useEffect(() => {
    subscribeToMessages();
    subscribeToGroupEvents();
    return () => {
      unsubscribeFromMessages();
      unsubscribeFromGroupEvents();
    };
  }, [
    subscribeToMessages,
    subscribeToGroupEvents,
    unsubscribeFromMessages,
    unsubscribeFromGroupEvents,
  ]);

  // 2. Room Joining & Fetching
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

  // 3. Read Receipts Hook
  useReadReceipts(
    isGroup ? null : selectedUser,
    messages,
    markMessagesAsRead,
    getMessagesByUserId
  );

  // 4. Mark Read Logic
  useEffect(() => {
    if (!activeChatId || !authUser?._id || document.hidden) return;

    const handleReadMarking = () => {
      if (document.hidden) return;
      const hasUnread = activeMessages.some((msg) => {
        const senderId = msg.senderId?._id || msg.senderId;
        if (senderId?.toString() === authUser._id.toString()) return false;
        const isFromCurrent = isGroup
          ? msg.groupId === activeChatId
          : senderId === activeChatId;
        if (!isFromCurrent) return false;
        return isGroup ? !msg.seenBy?.includes(authUser._id) : !msg.seen;
      });

      if (!hasUnread) return;

      if (isGroup) markGroupMessagesAsSeen?.(activeChatId);
      else markMessagesAsRead?.(activeChatId);
      updateUnreadCount?.(activeChatId, 0);
    };

    const timeoutId = setTimeout(handleReadMarking, 500);
    document.addEventListener("visibilitychange", handleReadMarking);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleReadMarking);
    };
  }, [
    activeChatId,
    activeMessages,
    isGroup,
    authUser._id,
    markGroupMessagesAsSeen,
    markMessagesAsRead,
    updateUnreadCount,
  ]);

 // 5 & 6. Combined Initial Jump and New Message Scroll
useEffect(() => {
  if (isLoading || activeMessages.length === 0) return;

  // Determine if this is the initial load of a new chat
  const isFirstLoad = prevMessagesLengthRef.current === 0;

  if (isFirstLoad) {
    // 1. INITIAL JUMP LOGIC
    const firstUnreadIndex = activeMessages.findIndex((msg) => {
      const senderId = msg.senderId?._id || msg.senderId;
      if (senderId?.toString() === authUser?._id?.toString()) return false;
      return isGroup ? !msg.seenBy?.includes(authUser._id) : !msg.seen;
    });

    const timeoutId = setTimeout(() => {
      if (firstUnreadIndex !== -1) {
        const element = document.getElementById(`msg-${activeMessages[firstUnreadIndex]._id}`);
        if (element) {
          // Use 'auto' to jump instantly without showing the scrolling animation
          element.scrollIntoView({ behavior: "auto", block: "center" });
        }
      } else {
        // No unread, jump to bottom instantly
        messageEndRef.current?.scrollIntoView({ behavior: "auto" });
      }
      // Update ref to current length AFTER the initial jump
      prevMessagesLengthRef.current = activeMessages.length;
    }, 50); // Lower timeout for snappier feel

    return () => clearTimeout(timeoutId);
  } else {
    // 2. NEW MESSAGE LOGIC
    // Only trigger if messages length actually increased
    if (activeMessages.length > prevMessagesLengthRef.current) {
      if (!searchTerm) {
        // Use 'smooth' only for new messages coming in
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }

      const latestMsg = activeMessages[activeMessages.length - 1];
      const senderId = latestMsg?.senderId?._id || latestMsg?.senderId;

      if (senderId?.toString() !== authUser?._id?.toString() && isSoundEnabled) {
        playMessageReceivedSound?.();
      }

      // Sync the ref length
      prevMessagesLengthRef.current = activeMessages.length;
    }
  }
}, [
  activeChatId, 
  isLoading, 
  activeMessages, 
  authUser._id, 
  isGroup, 
  searchTerm, 
  isSoundEnabled, 
  playMessageReceivedSound
]);

  // 7. Search Cleanup
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
          backgroundImage: `
            linear-gradient(rgba(18, 25, 31, 0.94), rgba(18, 25, 31, 0.94)),
            url("https://www.transparenttextures.com/patterns/cubes.png"),
            radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)
          `,
          backgroundSize: "auto, auto, 24px 24px",
        }}
        // FIX: Check if the click is actually on the background
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            messageActions.closeAllMenus();
          }
        }}
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
          <div className="flex flex-col items-center justify-center h-full opacity-60">
            <p className="text-base-content/60">
              No messages found matching "
              <span className="text-primary">{searchTerm}</span>"
            </p>
          </div>
        ) : (
          <NoChatHistoryPlaceholder
            name={isGroup ? selectedGroup?.groupName : selectedUser?.fullName}
          />
        )}
      </div>

      <ImageLightbox
        selectedImg={selectedImg}
        setSelectedImg={setSelectedImg}
      />

      {isGroup && otherTypingUsers.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-900/50">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <div className="flex space-x-1">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 italic">
              {otherTypingUsers.map((u) => u.userName).join(", ")}{" "}
              {otherTypingUsers.length === 1 ? " is" : " are"} typing...
            </p>
          </div>
        </div>
      )}

      {canSendMessage ? (
        <MessageInput
          replyTo={messageActions.replyTo}
          setReplyTo={messageActions.setReplyTo}
          isGroup={isGroup}
        />
      ) : (
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 text-center flex items-center justify-center gap-2">
          <div className="p-1.5 bg-slate-800 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-500"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Only admins can send messages to this group.
          </p>
        </div>
      )}
      {forwardingMessages?.length > 0 && <ForwardModal />}
    </div>
  );
};

export default ChatContainer;
