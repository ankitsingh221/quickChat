import React, { useMemo, useState } from "react";
import ReactionDetailModal from "./ReactionDetailModal";

const MessageReactions = ({
  msgReactions,
  isMe,
  authUser,
  handleExistingReactionClick,
  msgId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const groupedReactions = useMemo(() => {
    const map = new Map();
    msgReactions.forEach((r) => {
      if (!map.has(r.emoji)) {
        map.set(r.emoji, {
          emoji: r.emoji,
          count: 0,
          reactedByMe: false,
        });
      }
      const entry = map.get(r.emoji);
      entry.count += 1;
      
      const reactionUserId = r.userId?._id || r.userId;
      if (reactionUserId?.toString() === authUser?._id?.toString()) {
        entry.reactedByMe = true;
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [msgReactions, authUser?._id]);

  if (groupedReactions.length === 0) return null;
  const showSummary = groupedReactions.length > 2 || msgReactions.length > 5;

  return (
    <>
      <div
        className={`flex flex-wrap gap-1 mt-1 ${
          isMe ? "justify-end" : "justify-start"
        }`}
      >
        {showSummary ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border border-base-300 bg-base-200/50 backdrop-blur hover:bg-base-300 transition-all shadow-sm"
          >
            <div className="flex -space-x-1.5">
              {groupedReactions.slice(0, 3).map((r) => (
                <span key={r.emoji} className="text-sm scale-90 ring-1 ring-base-200 rounded-full bg-base-200">
                  {r.emoji}
                </span>
              ))}
            </div>
            <span className="font-bold text-[11px] ml-0.5">{msgReactions.length}</span>
          </button>
        ) : (
          groupedReactions.map(({ emoji, count, reactedByMe }) => (
            <button
              key={emoji}
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className={`
                flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs
                border backdrop-blur transition-all hover:scale-105
                ${
                  reactedByMe
                    ? "bg-primary/20 border-primary text-primary font-bold shadow-sm"
                    : "bg-base-200 border-base-300 text-base-content/80"
                }
              `}
            >
              <span className="text-sm  animate-emoji ">{emoji}</span>
              <span className="text-[11px]">{count}</span>
            </button>
          ))
        )}
      </div>

     {isModalOpen && (
  <ReactionDetailModal
    reactions={msgReactions}
    authUser={authUser}
    msgId={msgId}
    handleReactionClick={handleExistingReactionClick}
    onClose={() => setIsModalOpen(false)}
  />
)}
    </>
  );
};

export default MessageReactions;