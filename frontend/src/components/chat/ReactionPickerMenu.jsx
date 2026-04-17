import React, { useEffect } from "react";
import EmojiPicker from "emoji-picker-react";

const ReactionPickerMenu = ({
  msgId,
  isMe,
  handleReactionClick,
  showFullPicker,
  setShowFullPicker,
}) => {
  const quickEmojis = ["👍", "❤️", "😂", "😮", "👋", "🙏"];

  useEffect(() => {
    setShowFullPicker(false);
  }, [msgId, setShowFullPicker]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowFullPicker(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setShowFullPicker]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      {/* Quick Bar  */}
      <div className={`reactions-menu absolute z-[150] bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full px-2 py-1 flex items-center gap-1 bottom-full mb-2 ${isMe ? "right-0" : "left-0"}`}>
        {quickEmojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReactionClick(msgId, emoji);
            }}
            className="p-2 text-xl hover:bg-white/10 rounded-full transition-transform active:scale-125"
          >
            {emoji}
          </button>
        ))}
        <button
          type="button"
          className="p-2 text-lg text-white/40 hover:text-white font-bold hover:bg-white/10 rounded-full transition-all"
          onClick={(e) => {
            e.stopPropagation();
            setShowFullPicker(true);
          }}
        >
          +
        </button>
      </div>

      {/* Full Picker Modal */}
      {showFullPicker && (
        <div 
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            setShowFullPicker(false);
          }}
        >
          <div className="bg-black/80 backdrop-blur-xl rounded-t-xl sm:rounded-xl w-full sm:w-[350px] overflow-hidden shadow-2xl border border-white/20" onClick={(e) => e.stopPropagation()}>
            <EmojiPicker
              theme="dark"
              height="400px"
              width="100%"
              onEmojiClick={(emojiData, event) => {
                // Critical: Stop library event from triggering global mousedown
                if (event) {
                  event.stopPropagation();
                  if (event.nativeEvent) event.nativeEvent.stopImmediatePropagation();
                }
                handleReactionClick(msgId, emojiData.emoji);
                setShowFullPicker(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReactionPickerMenu;