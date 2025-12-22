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
    editMessage,
    deleteForMe,
    deleteForEveryone,
    toggleReaction,
    isSoundEnabled,
    markMessagesAsRead,
    getFilteredMessages,
    searchTerm, 
    clearSearch,
    updateUnreadCount 
  } = useChatStore();

  const filteredMessages = getFilteredMessages();

  const prevMessagesLengthRef = useRef(messages.length);
  const messageEndRef = useRef(null);
  const [selectedImg, setSelectedImg] = useState(null);

  useReadReceipts(selectedUser, messages, markMessagesAsRead, getMessagesByUserId);

  const messageActions = useMessageActions({
    editMessage,
    deleteForMe,
    deleteForEveryone,
    toggleReaction,
    isSoundEnabled,
    playRandomKeyStrokeSound,
  });

  
  useEffect(() => {
    if (!selectedUser) return;

    const handleVisibilityChange = () => {
      // When user returns to the tab page becomes visible
      if (!document.hidden) {
        const hasUnreadMessages = messages.some(
          msg => msg.senderId.toString() === selectedUser._id.toString() && !msg.seen
        );

        if (hasUnreadMessages) {
          markMessagesAsRead(selectedUser._id);
          
          if (updateUnreadCount) {
            updateUnreadCount(selectedUser._id, 0);
          } else {
            useChatStore.setState((state) => ({
              unreadCounts: {
                ...state.unreadCounts,
                [selectedUser._id]: 0,
              },
              chats: state.chats.map(chat => 
                chat._id === selectedUser._id 
                  ? { ...chat, unreadCount: 0 }
                  : chat
              )
            }));
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedUser, messages, markMessagesAsRead, updateUnreadCount]);

  // FIXED: Only scroll to bottom when NEW messages arrive, not on edits/deletes/reactions
  useEffect(() => {
    // Only scroll if there are MORE messages than before (new message received/sent)
    const hasNewMessages = messages.length > prevMessagesLengthRef.current;
    
    if (hasNewMessages && !searchTerm) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    
    if (hasNewMessages) {
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
  }, [messages.length, authUser._id, isSoundEnabled, playMessageReceivedSound, playRandomKeyStrokeSound, searchTerm,messages]);
 
  useEffect(() => {
    clearSearch();
    return () => clearSearch();
  }, [selectedUser?._id, clearSearch]);

  return (
    <>
      <ChatHeader>
        <MessageSearch />
      </ChatHeader>

      <div
        className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-900 relative custom-scrollbar"
        onClick={messageActions.closeAllMenus}
      >
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : filteredMessages.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <MessageList
              messages={filteredMessages}
              authUser={authUser}
              selectedUser={selectedUser}
              messageActions={messageActions}
              setSelectedImg={setSelectedImg}
            />
            <div ref={messageEndRef} />
          </div>
        ) : searchTerm ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <p className="text-slate-400">No messages found matching "{searchTerm}"</p>
          </div>
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
        )}
      </div>

      <ImageLightbox selectedImg={selectedImg} setSelectedImg={setSelectedImg} />

      <MessageInput replyTo={messageActions.replyTo} setReplyTo={messageActions.setReplyTo} />
    </>
  );
};

export default ChatContainer;