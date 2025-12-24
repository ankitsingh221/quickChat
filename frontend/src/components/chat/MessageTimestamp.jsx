import React from "react";
import { useChatStore } from "../../store/useChatStore";

const MessageTimestamp = ({ msg, isMe }) => {
  const { selectedGroup } = useChatStore();
  const isGroup = !!selectedGroup;

  const timeString = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase();

  // Logic for Read Receipts in Groups
  // In many systems, we show double ticks only if everyone has seen it, 
  // or we just show a single tick to represent "sent to server".
  const isRead = isGroup 
    ? (msg.seenBy?.length >= selectedGroup.members?.length - 1) // Everyone else saw it
    : msg.seen;

  return (
    <div
      className={`flex items-center gap-1.5 mt-1 px-1 transition-opacity duration-500 ${
        isMe ? "flex-row justify-end" : "flex-row-reverse justify-end"
      }`}
    >
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-tighter">
        {timeString}
      </p>

      {/* Status Icons for Sent Messages */}
      {isMe && !msg.isDeleted && (
        <div className="flex items-center">
          {isRead ? (
            /* Double Tick (Read) - Cyan Glow */
            <span className="text-cyan-400 drop-shadow-[0_0_3px_rgba(34,211,238,0.4)]">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
                <polyline points="22 10 13.5 18.5 11 16" />
              </svg>
            </span>
          ) : (
            /* Single Tick (Sent) */
            <span className="text-slate-600">
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageTimestamp;