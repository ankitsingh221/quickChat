import React, { useEffect, useState, useCallback, useRef } from "react";
import MessageItem from "./MessageItem";
import SystemMessage from "../groups/SystemMessage";

const MessageList = ({
  messages = [],
  authUser,
  selectedUser,
  selectedGroup,
  messageActions,
  setSelectedImg,
}) => {
  const [initialUnreadId, setInitialUnreadId] = useState(null);
  // Ref to track if we've already set the initial unread marker for this session
  const hasSetInitialRef = useRef(null);

  const formatHeaderDate = useCallback((date) => {
    if (!date) return "";
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-GB");
  }, []);

  // Only set the "New Message" marker when the chat FIRST loads
  useEffect(() => {
    const activeId = selectedGroup?._id || selectedUser?._id;

    // If we changed chats, reset the tracker
    if (hasSetInitialRef.current !== activeId) {
      const firstUnread = messages.find((msg) => {
        const sId = msg.senderId?._id || msg.senderId;
        if (sId?.toString() === authUser?._id?.toString()) return false;

        const isSeen = selectedGroup
          ? msg.seenBy?.includes(authUser?._id)
          : msg.seen;

        return !isSeen;
      });

      if (firstUnread) {
        setInitialUnreadId(firstUnread._id);
      } else {
        setInitialUnreadId(null);
      }
      hasSetInitialRef.current = activeId;
    }
  }, [selectedUser?._id, selectedGroup?._id, messages.length, authUser?._id]);

  // Logic to clear the "New Message" line after viewing
  useEffect(() => {
    if (!initialUnreadId) return;

    const targetMsg = messages.find((m) => m._id === initialUnreadId);
    if (targetMsg) {
      const isSeenNow = selectedGroup
        ? targetMsg.seenBy?.includes(authUser?._id)
        : targetMsg.seen;

      if (isSeenNow && !document.hidden) {
        const timer = setTimeout(() => {
          setInitialUnreadId(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, initialUnreadId, authUser?._id, selectedGroup]);

  return (
    <div className="flex flex-col space-y-3 md:space-y-4">
      {messages.map((msg, index) => {
        const isMe =
          (msg.senderId?._id || msg.senderId)?.toString() ===
          authUser?._id?.toString();

        const curDate = formatHeaderDate(msg.createdAt);
        const prevDate =
          index > 0 ? formatHeaderDate(messages[index - 1].createdAt) : null;

        return (
          <React.Fragment key={msg._id || index}>
            {/* DATE HEADER - Responsive */}
            {curDate !== prevDate && (
              <div className="flex items-center justify-center my-4 md:my-6">
                <span className="text-[10px] md:text-[11px] font-bold text-white/50 bg-white/10 backdrop-blur-sm px-2 md:px-3 py-1 rounded-md border border-white/20">
                  {curDate}
                </span>
              </div>
            )}

            {/* THE "NEW MESSAGES" LINE - Responsive */}
            {msg._id === initialUnreadId && (
              <div className="flex items-center justify-center my-3 md:my-4 animate-in fade-in zoom-in duration-500">
                <div className="h-[1px] bg-cyan-500/30 flex-grow"></div>
                <span className="mx-2 md:mx-4 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full border border-cyan-500/30 whitespace-nowrap">
                  New Messages Below
                </span>
                <div className="h-[1px] bg-cyan-500/30 flex-grow"></div>
              </div>
            )}

            {/* CONDITIONAL RENDERING: System Notification vs Regular Message Item */}
            {msg.isSystemMessage ? (
              <SystemMessage text={msg.text} />
            ) : (
              <MessageItem
                msg={msg}
                isMe={isMe}
                authUser={authUser}
                selectedUser={selectedUser}
                selectedGroup={selectedGroup}
                messageActions={messageActions}
                setSelectedImg={setSelectedImg}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default MessageList;
