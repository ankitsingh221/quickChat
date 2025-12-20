import React from "react";

const MessageBubble = ({
  msg,
  isMe,
  authUser,
  selectedUser,
  editingId,
  editText,
  handleEditTextChange,
  submitEdit,
  setEditingId,
  setSelectedImg,
}) => {
  return (
    <div
      className={`chat-bubble w-fit max-w-full px-4 py-2 shadow-md transition-all ${
        isMe ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"
      }`}
      style={{ minWidth: "fit-content" }}
    >
      {msg.isDeleted ? (
        <p className="italic opacity-60 text-sm">This message was deleted</p>
      ) : (
        <>
          {/* Reply Reference */}
          {msg.replyTo && (
            <div
              className={`mb-2 px-2.5 py-1.5 rounded-lg border-l-4 text-xs backdrop-blur cursor-pointer min-w-[100px] ${
                isMe ? "border-white/70 bg-black/20" : "border-cyan-500 bg-slate-700/50"
              }`}
            >
              <p className={`font-semibold ${isMe ? "text-white" : "text-cyan-400"}`}>
                {msg.replyTo.senderId?.toString() === authUser._id?.toString()
                  ? "You"
                  : selectedUser?.fullName}
              </p>
              <p className="truncate opacity-80 mt-0.5">{msg.replyTo.text}</p>
            </div>
          )}

          {/* Editing or Content */}
          {editingId === msg._id ? (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <input
                className="w-full p-1 rounded text-black text-sm outline-none"
                value={editText}
                onChange={handleEditTextChange}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button className="text-xs opacity-80" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
                <button
                  className="px-2 py-0.5 bg-green-500 rounded text-white text-xs"
                  onClick={() => submitEdit(msg._id)}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Image */}
              {msg.image && (
                <div className="mb-2 relative overflow-hidden rounded-lg">
                  <img
                    src={msg.image}
                    alt="Sent"
                    onClick={() => setSelectedImg(msg.image)}
                    className="max-w-[240px] md:max-w-[300px] max-h-[300px] w-auto h-auto object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {msg.text && (
                <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">
                  {msg.text}
                </p>
              )}
            </div>
          )}
          {msg.isEdited && (
            <span className="text-[10px] opacity-60 block text-right mt-1">edited</span>
          )}
        </>
      )}
    </div>
  );
};

export default MessageBubble;