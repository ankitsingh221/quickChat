import React from "react";
import { useChatStore } from "../../store/useChatStore"; 
import { Forward } from "lucide-react";

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

  // Helper to highlight search results
  const highlightText = (text, highlight) => {
    if (!highlight || !highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-yellow-400 text-black px-0.5 rounded-sm font-medium">
              {part}
            </mark>
          ) : part
        )}
      </span>
    );
  };

  // NEW: Function to scroll to the replied message
  const scrollToOriginalMessage = (replyId) => {
    const element = document.getElementById(`msg-${replyId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-cyan-400", "ring-offset-2");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-cyan-400", "ring-offset-2");
      }, 2000);
    }
  };

  // NEW: Improved Reply Name Logic for Groups
  const getReplyDisplayName = () => {
    const replySenderId = msg.replyTo?.senderId?.toString();
    if (replySenderId === authUser._id?.toString()) return "You";
    
    // In a group, we check the sender object directly from the replyTo data
    if (msg.replyTo?.senderId?.fullName) return msg.replyTo.senderId.fullName;
    
    // Fallback for private chats
    return selectedUser?.fullName || "Member";
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
          {/* FORWARDED LABEL */}
          {msg.isForwarded && (
            <div className={`flex items-center gap-1 mb-1 opacity-60 italic text-[11px] ${isMe ? "text-cyan-100" : "text-slate-400"}`}>
              <Forward size={12} strokeWidth={3} />
              <span>Forwarded</span>
            </div>
          )}

          {/* REPLY REFERENCE (Updated for Groups) */}
          {msg.replyTo && (
            <div
              onClick={() => scrollToOriginalMessage(msg.replyTo._id)}
              className={`mb-2 px-3 py-2 rounded-lg border-l-4 text-[13px] backdrop-blur-md cursor-pointer min-w-[120px] transition-all active:scale-[0.98] ${
                isMe
                  ? "border-white/50 bg-black/20 hover:bg-black/30"
                  : "border-cyan-500 bg-slate-900/50 hover:bg-slate-900/80"
              }`}
            >
              <p className={`font-bold text-[11px] uppercase tracking-wide ${isMe ? "text-cyan-100" : "text-cyan-400"}`}>
                {getReplyDisplayName()}
              </p>
              <p className="truncate opacity-80 mt-0.5 italic text-xs">
                {msg.replyTo.image ? "📷 Photo" : msg.replyTo.text}
              </p>
            </div>
          )}

          {/* EDITING STATE */}
          {editingId === msg._id ? (
            <div className="flex flex-col gap-2 min-w-[220px]">
              <textarea
                className="w-full p-2 rounded-lg bg-white/10 text-white text-sm outline-none border border-white/20 focus:border-white/40"
                value={editText}
                onChange={handleEditTextChange}
                autoFocus
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <button className="text-xs font-medium hover:underline" onClick={() => setEditingId(null)}>Cancel</button>
                <button
                  className="px-3 py-1 bg-white text-cyan-700 font-bold rounded-md text-xs hover:bg-slate-100 transition-colors"
                  onClick={() => submitEdit(msg._id)}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {msg.image && (
                <div className="mt-1 mb-2 rounded-xl overflow-hidden">
                  <img
                    src={msg.image}
                    onClick={() => setSelectedImg(msg.image)}
                    className="w-[180px] md:w-[220px] aspect-[4/5] object-cover cursor-zoom-in hover:scale-105 transition-transform duration-500"
                    alt="sent"
                  />
                </div>
              )}

              {msg.text && (
                <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">
                  {highlightText(msg.text, searchTerm)}
                </p>
              )}
            </div>
          )}

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