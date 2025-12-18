import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "../components/MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

const ChatContainer = () => {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser && authUser) {
      getMessagesByUserId(selectedUser._id);
    }
    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [
    selectedUser,
    getMessagesByUserId,
    authUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isMe = msg.senderId === authUser._id;

              return (
                <div
                  key={msg._id}
                  className={`chat ${isMe ? "chat-end" : "chat-start"}`}
                >
                  {/* IMAGE MESSAGE */}
                  {msg.image && (
                    <div className="max-w-xs rounded-xl overflow-hidden">
                      <img
                        src={msg.image}
                        alt="Shared"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}

                  {/* TEXT MESSAGE */}
                  {msg.text && (
                    <div
                      className={`chat-bubble mt-1 ${
                        isMe
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-800 text-slate-200"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* scroll to bottom */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>
      <MessageInput />
    </>
  );
};

export default ChatContainer;
