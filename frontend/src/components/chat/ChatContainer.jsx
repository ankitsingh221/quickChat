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
  } = useChatStore();

  const prevMessagesLengthRef = useRef(messages.length);
  const messageEndRef = useRef(null);

  const [selectedImg, setSelectedImg] = useState(null);

  // Custom hook for read receipts
  useReadReceipts(selectedUser, messages, markMessagesAsRead, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages);

  // Custom hook for message actions (edit, delete, reply, reactions)
  const messageActions = useMessageActions({
    editMessage,
    deleteForMe,
    deleteForEveryone,
    toggleReaction,
    isSoundEnabled,
    playRandomKeyStrokeSound,
  });

  // Auto-scroll and sound effects
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
  }, [messages, authUser._id, isSoundEnabled, playMessageReceivedSound, playRandomKeyStrokeSound]);

  return (
    <>
      <ChatHeader />

      <div
        className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-900 relative custom-scrollbar"
        onClick={messageActions.closeAllMenus}
      >
        {!isMessagesLoading && messages.length ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <MessageList
              messages={messages}
              authUser={authUser}
              selectedUser={selectedUser}
              messageActions={messageActions}
              setSelectedImg={setSelectedImg}
            />
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
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