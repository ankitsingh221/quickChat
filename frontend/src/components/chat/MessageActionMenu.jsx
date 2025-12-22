import React from "react";

const MessageActionMenu = ({
  msg,
  isMe,
  canEdit,
  menuPosition,
  actionMenuRef,
  handleReply,
  startEdit,
  handleDelete,
  handleReactionButtonClick,
}) => {
  return (
    <div
      ref={actionMenuRef}
      className="action-menu fixed z-[100] w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-1 overflow-hidden"
      style={{
        left: menuPosition.left,
        right: menuPosition.right,
        top: menuPosition.top,
      }}
    >
      <button
        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-700 w-full text-left"
        onClick={() => handleReply(msg)}
      >
        ↩ Reply
      </button>
      {canEdit && (
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-700 w-full text-left"
          onClick={() => startEdit(msg)}
        >
          ✏️ Edit
        </button>
      )}
      <button
        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-700 w-full text-left text-red-400"
        onClick={() => handleDelete(msg._id, "me")}
      >
        🗑 Delete for me
      </button>
      {isMe && (
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-700 w-full text-left text-red-400 font-bold"
          onClick={() => handleDelete(msg._id, "everyone")}
        >
          🗑 Delete for everyone
        </button>
      )}
      <button
        className="react-button flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-700 w-full text-left border-t border-slate-700"
        onClick={(e) => handleReactionButtonClick(msg._id, e, isMe)}
      >
        😀 React
      </button>
    </div>
  );
};

export default MessageActionMenu;