import React from "react";
import { useChatStore } from "../../store/useChatStore"; // Adjust path as needed

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
 
  const { searchTerm } = useChatStore();

 
  const highlightText = (text, highlight) => {
    if (!highlight || !highlight.trim()) return text;

    const parts = text.split(new RegExp(`(${highlight})`, "gi"));

    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark
              key={i}
              className="bg-yellow-400 text-black px-0.5 rounded-sm font-medium"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div
    id={`msg-${msg._id}`}
      className={`relative w-fit max-w-full px-4 py-2 shadow-lg transition-all duration-300 ${
        isMe
          ? "bg-cyan-600 text-white rounded-2xl rounded-br-none shadow-cyan-900/20"
          : "bg-slate-800 text-slate-100 rounded-2xl rounded-bl-none shadow-black/40"
      }`}
      style={{ minWidth: "fit-content" }}
    >
      {/* TAIL LOGIC */}
      <div
        className={`absolute bottom-0 w-3 h-3 ${isMe ? "-right-1 bg-cyan-600" : "-left-1 bg-slate-800"}`}
        style={{
          clipPath: isMe
            ? "polygon(0 0, 0% 100%, 100% 100%)"
            : "polygon(100% 0, 0% 100%, 100% 100%)",
        }}
      ></div>

      {msg.isDeleted ? (
        <p className="italic opacity-60 text-sm flex items-center gap-2">
          <span className="text-xs">🚫</span> This message was deleted
        </p>
      ) : (
        <>
          {/* Reply Reference */}
          {msg.replyTo && (
            <div
              className={`mb-2 px-3 py-2 rounded-lg border-l-4 text-[13px] backdrop-blur-md cursor-pointer min-w-[120px] transition-colors ${
                isMe
                  ? "border-white/50 bg-black/20 hover:bg-black/30"
                  : "border-cyan-500 bg-slate-900/50 hover:bg-slate-900/80"
              }`}
            >
              <p className={`font-bold text-[11px] uppercase tracking-wide ${isMe ? "text-cyan-100" : "text-cyan-400"}`}>
                {msg.replyTo.senderId?.toString() === authUser._id?.toString()
                  ? "You"
                  : selectedUser?.fullName}
              </p>
              {/* Highlight text inside the reply preview as well */}
              <p className="truncate opacity-90 mt-0.5 italic">
                {msg.replyTo.image ? "📷 Photo" : highlightText(msg.replyTo.text, searchTerm)}
              </p>
            </div>
          )}

          {/* Editing State */}
          {editingId === msg._id ? (
            <div className="flex flex-col gap-2 min-w-[220px]">
              <textarea
                className="w-full p-2 rounded-lg bg-white/10 text-white text-sm outline-none border border-white/20"
                value={editText}
                onChange={handleEditTextChange}
                autoFocus
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <button className="text-xs font-medium" onClick={() => setEditingId(null)}>Cancel</button>
                <button
                  className="px-3 py-1 bg-white text-cyan-700 font-bold rounded-md text-xs"
                  onClick={() => submitEdit(msg._id)}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Image Content */}
             {msg.image && (
  <div className="mt-1 mb-2 rounded-xl overflow-hidden">
    <img
      src={msg.image}
      onClick={() => setSelectedImg(msg.image)}
      className="
        w-[180px] md:w-[220px]
        aspect-[4/5]
        object-cover
        cursor-zoom-in
        hover:opacity-90
        transition
      "
      alt="sent"
    />
  </div>
)}


              {/* Text Content with Highlighting */}
              {msg.text && (
                <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">
                  {highlightText(msg.text, searchTerm)}
                </p>
              )}
            </div>
          )}

          {/* Edited Tag */}
          {msg.isEdited && !msg.isDeleted && (
            <span className="text-[9px] font-bold uppercase opacity-50 block text-right mt-1">
              Edited
            </span>
          )}
          
        </>
      )}
    </div>
  );
};

export default MessageBubble;