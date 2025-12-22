import React from "react";
import EmojiPicker from "emoji-picker-react";

const ReactionPickerMenu = ({
  msgId,
  isMe,
  handleReactionClick,
  showFullPicker,
  setShowFullPicker,
}) => {
  const quickEmojis = ["👍", "❤️", "😂", "😮", "👋", "🙏"];

  return (
    <>
      {/* Quick reactions */}
      <div
        className={`
          reactions-menu absolute z-[110]
          bg-slate-800 border border-slate-700
          shadow-xl rounded-full px-2 py-1
          flex items-center gap-1
          top-10
          ${isMe ? "right-0" : "left-0"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {quickEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReactionClick(msgId, emoji)}
            className="p-2 text-xl hover:bg-slate-700 rounded-full"
          >
            {emoji}
          </button>
        ))}

        <button
          className="p-2 text-lg text-slate-300 hover:text-white"
          onClick={() => setShowFullPicker(true)}
        >
          +
        </button>
      </div>

      {/* Full emoji picker (FIXED + CONSTRAINED) */}
      {showFullPicker && (
        <div
          className="fixed inset-0 z-[200] bg-black/40 flex items-end sm:items-center justify-center"
          onClick={() => setShowFullPicker(false)}
        >
          <div
            className="
              bg-slate-900 rounded-t-xl sm:rounded-xl
              w-full sm:w-[380px]
              max-h-[70vh]
              overflow-hidden
            "
            onClick={(e) => e.stopPropagation()}
          >
            <EmojiPicker
              theme="dark"
              height="60vh"
              width="100%"
              onEmojiClick={(emoji) => {
                handleReactionClick(msgId, emoji.emoji);
                setShowFullPicker(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ReactionPickerMenu;
