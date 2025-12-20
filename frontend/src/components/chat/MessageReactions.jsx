import React from "react";

const MessageReactions = ({ msgReactions, isMe, authUser, handleExistingReactionClick, msgId }) => {
  return (
    <div
      className={`flex gap-1 mt-1 flex-wrap ${
        isMe ? "justify-end mr-1" : "justify-start ml-1"
      }`}
    >
      {msgReactions.map((r, i) => {
        const isMyReaction = r.userId.toString() === authUser._id.toString();
        return (
          <button
            key={i}
            onClick={(e) => handleExistingReactionClick(msgId, r.emoji, e)}
            className={`px-1.5 py-0.5 rounded-full text-[11px] flex items-center gap-1 backdrop-blur border transition-all hover:scale-110 ${
              isMyReaction
                ? "bg-cyan-600/80 text-white border-cyan-400"
                : "bg-slate-700/60 text-slate-200 border-slate-600"
            }`}
          >
            {r.emoji} {isMyReaction ? "You" : ""}
          </button>
        );
      })}
    </div>
  );
};

export default MessageReactions;