import React from "react";
import { REACTION_EMOJIS } from "../../constants/reactionEmojis";

const ReactionPickerMenu = ({ msgId, menuPosition, reactionsMenuRef, handleReactionClick }) => {
  return (
    <div
      ref={reactionsMenuRef}
      className="fixed z-[110] p-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl"
      style={{
        left: menuPosition.reactionsLeft,
        right: menuPosition.reactionsRight,
        top: menuPosition.reactionsTop,
      }}
    >
      <div
        className="grid grid-cols-4 gap-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600"
        style={{ maxHeight: "90px", width: "160px" }}
      >
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReactionClick(msgId, emoji)}
            className="w-10 h-10 flex items-center justify-center text-lg rounded-lg hover:bg-slate-700 transition-transform active:scale-90"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReactionPickerMenu;