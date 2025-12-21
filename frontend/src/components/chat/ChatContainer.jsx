import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import ChatHeader from "../ChatHeader";
import MessageInput from "../MessageInput";
import MessagesLoadingSkeleton from "../MessagesLoadingSkeleton";
import NoChatHistoryPlaceholder from "../NoChatHistoryPlaceholder";
import MessageList from "./MessageList";
import ImageLightbox from "./ImageLightbox";
import useKeyboardSound from "../../hooks/useKeyboardSound";
import useReadReceipts from "../../hooks/useReadReceipts";
import useMessageActions from "../../hooks/useMessageActions";
import MessageSearch from "./MessageSearch";

const ChatContainer = () => {
  const { authUser } = useAuthStore();
  const { playRandomKeyStrokeSound, playMessageReceivedSound } = useKeyboardSound();

  const {
    selectedUser,
    messages,
    isMessagesLoading,
    getMessagesByUserId,
    subscribeToMessages,
    unsubscribeFromMessages,
    editMessage,
    deleteForMe,
    deleteForEveryone,
    toggleReaction,
    isSoundEnabled,
    markMessagesAsRead,
    getFilteredMessages, // Added from your store
    searchTerm, 
    clearSearch         // Added from your store
  } = useChatStore();

  // IMPORTANT: Use the filtered results for rendering
  const filteredMessages = getFilteredMessages();

  const prevMessagesLengthRef = useRef(messages.length);
  const messageEndRef = useRef(null);
  const [selectedImg, setSelectedImg] = useState(null);

  useReadReceipts(selectedUser, messages, markMessagesAsRead, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages);

  const messageActions = useMessageActions({
    editMessage,
    deleteForMe,
    deleteForEveryone,
    toggleReaction,
    isSoundEnabled,
    playRandomKeyStrokeSound,
  });

  useEffect(() => {
    // Only auto-scroll if we aren't currently searching (optional UX preference)
    if (!searchTerm) {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    
    if (messages.length > prevMessagesLengthRef.current) {
      const latestMessage = messages[messages.length - 1];
      const isIncomingMessage = latestMessage.senderId.toString() !== authUser._id.toString();

      if (isIncomingMessage && isSoundEnabled) {
        if (playMessageReceivedSound) {
          playMessageReceivedSound();
        } else {
          playRandomKeyStrokeSound();
        }
      }
    }
    prevMessagesLengthRef.current = messages.length;

  }, [messages, authUser._id, isSoundEnabled, playMessageReceivedSound, playRandomKeyStrokeSound, searchTerm]);
 
useEffect(() => {
  
  clearSearch();

  return () => clearSearch();
}, [selectedUser?._id, clearSearch]);

  return (
    <>
      <ChatHeader>
        {/* Make sure your ChatHeader component renders {children} */}
        <MessageSearch />
      </ChatHeader>

      <div
        className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-900 relative custom-scrollbar"
        onClick={messageActions.closeAllMenus}
      >
        {/* 1. Check if messages are loading */}
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : filteredMessages.length > 0 ? (
          /* 2. If we have filtered results, show them */
          <div className="max-w-3xl mx-auto space-y-6">
            <MessageList
              messages={filteredMessages} // Changed from 'messages' to 'filteredMessages'
              authUser={authUser}
              selectedUser={selectedUser}
              messageActions={messageActions}
              setSelectedImg={setSelectedImg}
            />
            <div ref={messageEndRef} />
          </div>
        ) : searchTerm ? (
          /* 3. If searching and no results found */
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <p className="text-slate-400">No messages found matching "{searchTerm}"</p>
          </div>
        ) : (
          /* 4. If no chat history at all */
          <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
        )}
      </div>

      <ImageLightbox selectedImg={selectedImg} setSelectedImg={setSelectedImg} />

      <MessageInput replyTo={messageActions.replyTo} setReplyTo={messageActions.setReplyTo} />
    </>
  );
};

export default ChatContainer;