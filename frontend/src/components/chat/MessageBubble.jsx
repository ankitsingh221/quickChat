import React, { useState, useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { Forward, Reply, Edit2, Trash2, Copy } from "lucide-react";
import useLongPress from "../../hooks/useLongPress";

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
  onDelete,
  onReply,
}) => {
  const { searchTerm } = useChatStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLongPress = () => {
    if (!msg.isDeleted) setShowMenu(true);
  };

  // Destructure isPressing and handlers from hook
  const { isPressing, handlers } = useLongPress(handleLongPress, () => {}, {
    delay: 500,
  });

  const handleAction = (action) => {
    setShowMenu(false);
    if (action === "reply") onReply(msg);
    if (action === "edit") setEditingId(msg._id);
    if (action === "delete") onDelete(msg._id);
    if (action === "copy") navigator.clipboard.writeText(msg.text);
  };

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

  const scrollToOriginalMessage = (replyId) => {
    const element = document.getElementById(`msg-${replyId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-cyan-400", "ring-offset-2");
      setTimeout(
        () =>
          element.classList.remove("ring-2", "ring-cyan-400", "ring-offset-2"),
        2000
      );
    }
  };

  const getReplyDisplayName = () => {
    const replySenderId = msg.replyTo?.senderId?.toString();
    if (replySenderId === authUser._id?.toString()) return "You";
    if (msg.replyTo?.senderId?.fullName) return msg.replyTo.senderId.fullName;
    return selectedUser?.fullName || "Member";
  };

  return (
    <div className="relative group">
      {/* CONTEXT MENU */}
      {showMenu && (
        <div
          ref={menuRef}
          className={`absolute z-[100] bottom-full mb-2 flex gap-1 bg-slate-900 border border-slate-700 p-1 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200 ${
            isMe ? "right-0" : "left-0"
          }`}
        >
          <button
            onClick={() => handleAction("reply")}
            className="p-2 hover:bg-slate-800 rounded-lg text-cyan-400"
          >
            <Reply size={18} />
          </button>
          <button
            onClick={() => handleAction("copy")}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-300"
          >
            <Copy size={18} />
          </button>
          {isMe && (
            <>
              <button
                onClick={() => handleAction("edit")}
                className="p-2 hover:bg-slate-800 rounded-lg text-amber-400"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleAction("delete")}
                className="p-2 hover:bg-slate-800 rounded-lg text-red-400"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      )}

      <div
        id={`msg-${msg._id}`}
        {...handlers}
        className={`relative w-fit max-w-full px-4 py-2 shadow-lg transition-all duration-300 select-none cursor-pointer overflow-hidden ${
          showMenu || isPressing ? "scale-[0.96] brightness-90" : "scale-100"
        } ${
          isMe
            ? "bg-cyan-600 text-white rounded-2xl rounded-br-none shadow-cyan-900/20"
            : "bg-slate-800 text-slate-100 rounded-2xl rounded-bl-none shadow-black/40"
        }`}
      >
        {/* PROGRESS BAR - Only shows while pressing */}
        {isPressing && (
          <div
            className="absolute top-0 left-0 h-1 bg-white/40 z-10"
            style={{
              animation: "progress-load 0.5s linear forwards",
              width: "0%",
            }}
          />
        )}

        {/* TAIL */}
        <div
          className={`absolute bottom-0 w-3 h-3 ${
            isMe ? "-right-1 bg-cyan-600" : "-left-1 bg-slate-800"
          }`}
          style={{
            clipPath: isMe
              ? "polygon(0 0, 0% 100%, 100% 100%)"
              : "polygon(100% 0, 0% 100%, 100% 100%)",
          }}
        ></div>

        {msg.isDeleted ? (
          <p className="italic opacity-60 text-sm flex items-center gap-2">
            🚫 This message was deleted
          </p>
        ) : (
          <>
            {msg.isForwarded && (
              <div
                className={`flex items-center gap-1 mb-1 opacity-60 italic text-[11px] ${
                  isMe ? "text-cyan-100" : "text-slate-400"
                }`}
              >
                <Forward size={12} strokeWidth={3} />
                <span>Forwarded</span>
              </div>
            )}

            {msg.replyTo && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToOriginalMessage(msg.replyTo._id);
                }}
                className={`mb-2 px-3 py-2 rounded-lg border-l-4 text-[13px] backdrop-blur-md cursor-pointer min-w-[120px] transition-all active:scale-[0.98] ${
                  isMe
                    ? "border-white/50 bg-black/20"
                    : "border-cyan-500 bg-slate-900/50"
                }`}
              >
                <p
                  className={`font-bold text-[11px] uppercase tracking-wide ${
                    isMe ? "text-cyan-100" : "text-cyan-400"
                  }`}
                >
                  {getReplyDisplayName()}
                </p>
                <p className="truncate opacity-80 mt-0.5 italic text-xs">
                  {msg.replyTo.image ? "📷 Photo" : msg.replyTo.text}
                </p>
              </div>
            )}

            {editingId === msg._id ? (
              <div
                className="flex flex-col gap-2 min-w-[220px]"
                onClick={(e) => e.stopPropagation()}
              >
                <textarea
                  className="w-full p-2 rounded-lg bg-white/10 text-white text-sm outline-none border border-white/20"
                  value={editText}
                  onChange={handleEditTextChange}
                  autoFocus
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="text-xs font-medium"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 bg-white text-cyan-700 font-bold rounded-md text-xs"
                    onClick={() => submitEdit(msg._id, msg.createdAt)}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImg(msg.image);
                      }}
                      className="w-[180px] md:w-[220px] aspect-[4/5] object-cover"
                      alt="sent"
                    />
                  </div>
                )}
                {msg.text && (
                  <p className="whitespace-pre-wrap break-words text-[15px]">
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
    </div>
  );
};

export default MessageBubble;
