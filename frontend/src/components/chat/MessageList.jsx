import React, { useEffect, useState, useCallback } from "react";
import MessageItem from "./MessageItem";

const MessageList = ({
  messages = [],
  authUser,
  selectedUser,
  selectedGroup,
  messageActions,
  setSelectedImg,
}) => {
  const [initialUnreadId, setInitialUnreadId] = useState(null);

  // 1. Memoized date formatter to prevent re-creation
  const formatHeaderDate = useCallback((date) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) return "Today";
    if (messageDate.toDateString() === yesterday.toDateString())
      return "Yesterday";
    return messageDate.toLocaleDateString("en-GB");
  }, []);

  // 2. Identify the unread message
  useEffect(() => {
    if (messages.length > 0) {
      const firstUnread = messages.find((msg) => {
        const senderId = msg.senderId?._id || msg.senderId;
        if (senderId?.toString() === authUser?._id?.toString()) return false;

        const isSeen = selectedGroup
          ? msg.seenBy?.includes(authUser?._id)
          : msg.seen;

        return !isSeen;
      });

      if (firstUnread) {
        setInitialUnreadId(firstUnread._id);
      }
    }
    // Reset when the chat target changes
  }, [
    selectedUser?._id,
    selectedGroup?._id,
    authUser?._id,
    messages,
    selectedGroup,
  ]);

  // 3. Logic to make the line disappear after the message is marked 'seen'
  useEffect(() => {
    if (!initialUnreadId) return;

    const targetMsg = messages.find((m) => m._id === initialUnreadId);

    if (targetMsg) {
      const isSeenNow = selectedGroup
        ? targetMsg.seenBy?.includes(authUser?._id)
        : targetMsg.seen;

      if (isSeenNow) {
        const timer = setTimeout(() => {
          setInitialUnreadId(null);
        }, 10000);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, initialUnreadId, authUser?._id, selectedGroup]);

  if (!messages || messages.length === 0) return null;

  return (
    <div className="flex flex-col">
      {messages.map((msg, index) => {
        const senderIdStr = msg.senderId?._id || msg.senderId;
        const isMe = senderIdStr?.toString() === authUser?._id?.toString();

        // Date Logic
        const currentDateLabel = formatHeaderDate(msg.createdAt);
        const previousMessage = messages[index - 1];
        const previousDateLabel = previousMessage
          ? formatHeaderDate(previousMessage.createdAt)
          : null;
        const showDateSeparator = currentDateLabel !== previousDateLabel;

        return (
          <React.Fragment key={msg._id || index}>
            {showDateSeparator && (
              <div className="flex items-center justify-center my-6 w-full opacity-60">
                <div className="h-[1px] bg-slate-700/30 flex-grow"></div>
                <span className="mx-4 text-[11px] font-bold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700">
                  {currentDateLabel}
                </span>
                <div className="h-[1px] bg-slate-700/30 flex-grow"></div>
              </div>
            )}

            {msg._id === initialUnreadId && (
              <div className="flex items-center justify-center my-4 w-full animate-in fade-in zoom-in duration-500">
                <div className="h-[1px] bg-error/30 flex-grow"></div>
                <span className="mx-4 text-[10px] font-black uppercase tracking-widest text-error bg-error/10 px-3 py-1 rounded-full border border-error/20">
                  New Messages
                </span>
                <div className="h-[1px] bg-error/30 flex-grow"></div>
              </div>
            )}

            <MessageItem
              key={msg._id}
              msg={msg}
              isMe={isMe}
              authUser={authUser}
              selectedUser={selectedUser}
              selectedGroup={selectedGroup}
              messageActions={messageActions} // Ensure this is passed!
              setSelectedImg={setSelectedImg}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default MessageList;
