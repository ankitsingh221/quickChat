import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { MessageSquare } from "lucide-react";

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
    markGroupMessagesAsRead,
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
  const activeMessages = isGroup ? (groupMessages || []) : (messages || []);
  const isLoading = isGroup ? isGroupMessagesLoading : isMessagesLoading;

  const { playRandomKeyStrokeSound, playMessageReceivedSound } = useKeyboardSound();

  // get typing user for group
  const typingUsers = isGroup ? (groupTypingUsers[activeChatId] || []) : [];
  const otherTypingUsers = typingUsers.filter(u => u.userId !== authUser?._id);

  // intilize action
  const messageActions = useMessageActions({
    editMessage,
    deleteForMe,
    deleteForEveryone,
    toggleReaction,
    isSoundEnabled,
    playRandomKeyStrokeSound,
    isGroup: isGroup,
  });
  
 
  useEffect(() => {
    subscribeToMessages();
    subscribeToGroupEvents();
    return () => {
      unsubscribeFromMessages();
      unsubscribeFromGroupEvents();
    };
  }, []);

 
  useEffect(() => {
    if (!activeChatId) return;

    // Fetch messages
    if (isGroup) {
      getGroupMessages(activeChatId);
      
      // Join the group socket room
      if (socket) {
        socket.emit("joinChat", activeChatId);
        socket.emit("joinGroup", activeChatId);
      }
    } else {
      getMessagesByUserId(activeChatId);
      
      // Join the private chat room
      if (socket) {
        socket.emit("joinChat", activeChatId);
      }
    }

    prevMessagesLengthRef.current = 0;

    //  Leave room when switching chats
    return () => {
      if (socket && activeChatId) {
        console.log("🚪 Leaving room:", activeChatId);
        socket.emit("leaveChat", activeChatId);
        if (isGroup) {
          socket.emit("leaveGroup", activeChatId);
        }
      }
    };
  }, [activeChatId, isGroup, socket, getMessagesByUserId, getGroupMessages]);

  // 5. read receipts (Private Only)
  useReadReceipts(
    isGroup ? null : selectedUser, 
    messages,
    markMessagesAsRead,
    getMessagesByUserId
  );

  // visiblity and unread logic
  // Inside ChatContainer.jsx
useEffect(() => {
  // CRITICAL: Only proceed if we have an active chat AND the window is actually visible
  if (!activeChatId || !authUser?._id || document.hidden) return;

  const handleReadMarking = () => {
    // Check if the chat container is actually visible (not just the tab)
    if (document.hidden) return;

    const hasUnread = activeMessages.some((msg) => {
      const senderId = msg.senderId?._id || msg.senderId;
      const isMine = senderId?.toString() === authUser._id.toString();
      if (isMine) return false;

      // Only mark as read if the message belongs to the CURRENT active chat
      // If it's a private chat, check msg.senderId matches activeChatId
      const isMessageFromCurrentChat = isGroup 
        ? msg.groupId === activeChatId 
        : senderId === activeChatId;

      if (!isMessageFromCurrentChat) return false;

      return isGroup 
        ? !msg.seenBy?.includes(authUser._id) 
        : !msg.seen;
    });

    if (!hasUnread) return;

    if (isGroup) {
      markGroupMessagesAsRead?.(activeChatId);
    } else {
      markMessagesAsRead?.(activeChatId);
    }
    updateUnreadCount?.(activeChatId, 0);
  };

  // Add a slight delay to ensure the UI has rendered
  const timeoutId = setTimeout(handleReadMarking, 300);

  document.addEventListener("visibilitychange", handleReadMarking);
  return () => {
    clearTimeout(timeoutId);
    document.removeEventListener("visibilitychange", handleReadMarking);
  };
}, [
  activeChatId, 
  activeMessages, 
  isGroup,
  authUser?._id,
  markGroupMessagesAsRead,
  updateUnreadCount,
  markMessagesAsRead
]);

  // auto scroll and sound
  useEffect(() => {
    if (activeMessages.length > prevMessagesLengthRef.current) {
      if (!searchTerm) {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }

      const latestMsg = activeMessages[activeMessages.length - 1];
      const senderId = latestMsg?.senderId?._id || latestMsg?.senderId;
      if (senderId?.toString() !== authUser?._id?.toString() && isSoundEnabled) {
        playMessageReceivedSound?.();
      }
    }
    prevMessagesLengthRef.current = activeMessages.length;
  }, [
    activeMessages.length, 
    isSoundEnabled, 
    searchTerm, 
    authUser?._id, 
    playMessageReceivedSound,
    activeMessages
  ]);

 // search cleanup
  useEffect(() => {
    clearSearch?.();
  }, [activeChatId, clearSearch]);

  // filterd messages
  const filteredMessages = getFilteredMessages(activeMessages) || [];

  if (!activeChatId) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ChatHeader>
        <MessageSearch />
      </ChatHeader>

      <div
        className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar bg-base-200/50 relative"
        onClick={() => messageActions.closeAllMenus()}
      >
        {isLoading ? (
          <MessagesLoadingSkeleton />
        ) : filteredMessages.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-6">
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
              No messages found matching "<span className="text-primary">{searchTerm}</span>"
            </p>
          </div>
        ) : (
          <NoChatHistoryPlaceholder 
            name={isGroup ? selectedGroup?.groupName : selectedUser?.fullName} 
          />
        )}
      </div>

      <ImageLightbox selectedImg={selectedImg} setSelectedImg={setSelectedImg} />

      {/*  TYPING INDICATOR FOR GROUP CHAT */}
      {isGroup && otherTypingUsers.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-900/50">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <div className="flex space-x-1">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-xs text-slate-400 italic">
              {otherTypingUsers.map(u => u.userName).join(", ")} 
              {otherTypingUsers.length === 1 ? " is" : " are"} typing...
            </p>
          </div>
        </div>
      )}

      <MessageInput 
        replyTo={messageActions.replyTo} 
        setReplyTo={messageActions.setReplyTo} 
        isGroup={isGroup} 
      />

      {forwardingMessages?.length > 0 && <ForwardModal />}
    </div>
  );
};

export default ChatContainer;