import React from "react";

const MessageTimestamp = ({ msg, isMe }) => {
  return (
    <div
      className={`flex items-center gap-1 mt-1 px-1 ${
        isMe ? "flex-row" : "flex-row-reverse"
      }`}
    >
      <p className="text-[10px] opacity-40">
        {new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      {/* ONLY show checkmarks for messages YOU sent */}
      {isMe && !msg.isDeleted && (
        <div className="flex items-center">
          {msg.seen ? (
            /* Double Tick (Seen) - Cyan Color */
            <span className="text-cyan-400 transition-all duration-300 animate-in fade-in zoom-in-75">
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
                <polyline points="22 10 13.5 18.5 11 16" />
              </svg>
            </span>
          ) : (
            /* Single Tick (Sent but not seen) - Gray Color */
            <span className="text-slate-500">
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