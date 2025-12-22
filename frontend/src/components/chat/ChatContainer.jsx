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

const ChatContainer = () => {
  const { authUser } = useAuthStore();
  const {
    selectedUser,
    messages = [],
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
    updateUnreadCount,
  } = useChatStore();

  const [selectedImg, setSelectedImg] = useState(null);
  const messageEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  // SOUNDS
  const { playRandomKeyStrokeSound, playMessageReceivedSound } =
    useKeyboardSound();

  // MESSAGE ACTIONS (UNCONDITIONAL)
  const messageActions = useMessageActions({
    editMessage,
    deleteForMe,
    deleteForEveryone,
    toggleReaction,
    isSoundEnabled,
    playRandomKeyStrokeSound,
  });

  // READ RECEIPTS
  useReadReceipts(
    selectedUser,
    messages,
    markMessagesAsRead,
    getMessagesByUserId
  );

  //FILTERED MESSAGES
  const filteredMessages = getFilteredMessages() || [];

  // VISIBILITY / READ HANDLING
  useEffect(() => {
    if (!selectedUser) return;

    const handleVisibilityChange = () => {
      if (document.hidden) return;

      const hasUnread = messages.some(
        (msg) =>
          msg.senderId?.toString() === selectedUser._id?.toString() && !msg.seen
      );

      if (!hasUnread) return;

      markMessagesAsRead(selectedUser._id);

      if (updateUnreadCount) {
        updateUnreadCount(selectedUser._id, 0);
      } else {
        useChatStore.setState((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [selectedUser._id]: 0,
          },
          chats: state.chats.map((chat) =>
            chat._id === selectedUser._id ? { ...chat, unreadCount: 0 } : chat
          ),
        }));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [selectedUser, messages, markMessagesAsRead, updateUnreadCount]);

  //AUTO SCROLL + SOUND
  useEffect(() => {
    if (!Array.isArray(messages)) return;

    const hasNewMessages = messages.length > prevMessagesLengthRef.current;

    if (hasNewMessages && !searchTerm) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    if (hasNewMessages && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      const isIncoming =
        latestMessage.senderId?.toString() !== authUser._id?.toString();

      if (isIncoming && isSoundEnabled) {
        playMessageReceivedSound
          ? playMessageReceivedSound()
          : playRandomKeyStrokeSound();
      }
    }

    prevMessagesLengthRef.current = messages.length;
  }, [
    messages,
    authUser._id,
    isSoundEnabled,
    playMessageReceivedSound,
    playRandomKeyStrokeSound,
    searchTerm,
  ]);

  //CLEAR SEARCH ON USER CHANGE
  useEffect(() => {
    clearSearch();
    return () => clearSearch();
  }, [selectedUser?._id, clearSearch]);

  // RENDER
  return (
    <>
      <ChatHeader>
        <MessageSearch />
      </ChatHeader>
      <div
        className="flex-1 p-4 md:p-6 overflow-y-auto ..."
        onClick={(e) => {
          if (
            !e.target.closest(".action-menu") &&
            !e.target.closest(".reactions-menu") &&
            !e.target.closest(".three-dot-button")
          ) {
            messageActions.closeAllMenus();
          }
        }}
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
          <div className="flex flex-col items-center justify-center h-full opacity-60">
            <p className="text-base-content/60">
              No messages found matching “{searchTerm}”
            </p>
          </div>
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
        )}
      </div>

      <ImageLightbox
        selectedImg={selectedImg}
        setSelectedImg={setSelectedImg}
      />

      <MessageInput
        replyTo={messageActions.replyTo}
        setReplyTo={messageActions.setReplyTo}
      />
    </>
  );
};

export default ChatContainer;
