import React from "react";
import { Reply, Pencil, Smile, Trash2, Forward, CheckSquare, Info } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";

const MenuItem = ({ children, onClick, danger, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`
      flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left
      transition-all duration-150
      ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-white/80 hover:bg-white/10"
      }
    `}
  >
    {Icon && <Icon size={16} className="shrink-0" />}
    <span className="truncate">{children}</span>
  </button>
);

const MessageActionMenu = ({
  msg,
  isMe,
  canEdit,
  handleReply,
  startEdit,
  handleDelete,
  handleReactionButtonClick,
  isGroup,
  onInfoClick, 
}) => {
  const { setForwardingMessages, toggleMessageSelection, toggleSelectionMode } = useChatStore();

  return (
    <div
      className={`
        action-menu absolute z-[100] min-w-[210px]
        rounded-xl border border-white/20 bg-black/80 backdrop-blur-xl shadow-2xl
        bottom-full mb-2 ${isMe ? "right-0" : "left-0"}
        overflow-hidden animate-in fade-in zoom-in duration-100
      `}
    >
      <div className="flex flex-col py-1">
        {/* Only show "Info" if I am the sender and it's a group message */}
        {isMe && isGroup && (
          <>
            <MenuItem 
              icon={Info} 
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick();
              }}
            >
              Message Info
            </MenuItem>
            <div className="border-t border-white/10 my-1" />
          </>
        )}

        {/* Contextual Reply Label */}
        <MenuItem icon={Reply} onClick={() => handleReply(msg)}>
          {isGroup ? "Reply to Group" : "Reply"}
        </MenuItem>

        <MenuItem 
          icon={Forward} 
          onClick={() => setForwardingMessages(msg)}
        >
          Forward
        </MenuItem>

        {isMe && canEdit && (
          <MenuItem icon={Pencil} onClick={() => startEdit(msg)}>
            Edit Message
          </MenuItem>
        )}

        <div className="border-t border-white/10 my-1" />

        <MenuItem 
          icon={CheckSquare} 
          onClick={() => {
            toggleSelectionMode(true);
            toggleMessageSelection(msg._id);
          }}
        >
          Select Message
        </MenuItem>

        <div className="border-t border-white/10 my-1" />

        <MenuItem 
          icon={Trash2} 
          danger 
          onClick={() => handleDelete(msg._id, "me")}
        >
          Delete for Me
        </MenuItem>

        {isMe && canEdit && (
          <MenuItem 
            icon={Trash2} 
            danger 
            onClick={() => handleDelete(msg._id, "everyone")}
          >
            {isGroup ? "Delete for Everyone in Group" : "Delete for Everyone"}
          </MenuItem>
        )}

        <div className="border-t border-white/10 my-1" />

        <MenuItem
          icon={Smile}
          onClick={(e) => handleReactionButtonClick(msg._id, e)}
        >
          Add Reaction
        </MenuItem>
      </div>
    </div>
  );
};

export default MessageActionMenu;