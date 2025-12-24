import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import GroupMessageItem from "./GroupMessageItem";
import MessagesLoadingSkeleton from "../MessagesLoadingSkeleton";
import GroupTypingIndicator from "./GroupTypingIndicator";

function GroupMessageList() {
  const { groupMessages, isGroupMessagesLoading, selectedGroup } =
    useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [groupMessages]);

  if (isGroupMessagesLoading) {
    return <MessagesLoadingSkeleton />;
  }

  if (groupMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl">💬</div>
          <p className="text-base-content/60">
            No messages yet. Start the conversation!
          </p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    groupMessages.forEach((msg) => {
      const date = new Date(msg.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100">
      {Object.entries(messageGroups).map(([date, messages]) => (
        <div key={date}>
          {/* Date Separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-base-200 text-base-content/60 text-xs px-3 py-1 rounded-full">
              {formatDateLabel(date)}
            </div>
          </div>

          {/* Messages for this date */}
          {messages.map((message, index) => {
            const isOwnMessage =
              message.senderId?._id === authUser?._id ||
              message.senderId === authUser?._id;
            const prevMessage = messages[index - 1];
            const showAvatar =
              !prevMessage ||
              prevMessage.senderId?._id !== message.senderId?._id;

            return (
              <GroupMessageItem
                key={message._id}
                message={message}
                isOwnMessage={isOwnMessage}
                showAvatar={showAvatar}
              />
            );
          })}
        </div>
      ))}

      {/* Typing Indicator */}
      <GroupTypingIndicator groupId={selectedGroup?._id} />

      <div ref={messagesEndRef} />
    </div>
  );
}

export default GroupMessageList;