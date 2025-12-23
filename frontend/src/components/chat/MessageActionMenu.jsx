import React from "react";
import { Reply, Pencil, Smile, Trash2, Forward, CheckSquare } from "lucide-react";
import { useChatStore } from "../../store/useChatStore"; // Import store to trigger forwarding

const MenuItem = ({ children, onClick, danger, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`
      flex w-full items-center gap-3 px-4 py-2 text-sm text-left
      transition-colors duration-150
      ${
        danger
          ? "text-error hover:bg-error/10"
          : "text-base-content hover:bg-base-content/10"
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
}) => {
  // Get forwarding and selection actions from store
  const { setForwardingMessages, toggleMessageSelection, toggleSelectionMode } = useChatStore();

  return (
    <div
      className={`
        action-menu absolute z-[100] min-w-[190px]
        rounded-xl border border-base-300 bg-base-300 shadow-2xl
        bottom-full mb-2 ${isMe ? "right-0" : "left-0"}
        overflow-hidden animate-in fade-in zoom-in duration-100
      `}
    >
      <div className="flex flex-col py-1">
        <MenuItem icon={Reply} onClick={() => handleReply(msg)}>
          Reply
        </MenuItem>

        {/* --- NEW: FORWARD OPTION --- */}
        <MenuItem 
          icon={Forward} 
          onClick={() => setForwardingMessages(msg)}
        >
          Forward
        </MenuItem>

        {canEdit && (
          <MenuItem icon={Pencil} onClick={() => startEdit(msg)}>
            Edit
          </MenuItem>
        )}

        <div className="border-t border-base-content/5 my-1" />

        {/* --- NEW: SELECT OPTION (Linked to your selection mode) --- */}
        <MenuItem 
          icon={CheckSquare} 
          onClick={() => {
            toggleSelectionMode(true);
            toggleMessageSelection(msg._id);
          }}
        >
          Select
        </MenuItem>

        <div className="border-t border-base-content/5 my-1" />

        <MenuItem 
          icon={Trash2} 
          danger 
          onClick={() => handleDelete(msg._id, "me")}
        >
          Delete for me
        </MenuItem>

        {isMe && (
          <MenuItem 
            icon={Trash2} 
            danger 
            onClick={() => handleDelete(msg._id, "everyone")}
          >
            Delete for everyone
          </MenuItem>
        )}

        <div className="border-t border-base-content/5 my-1" />

        <MenuItem
          icon={Smile}
          onClick={(e) => handleReactionButtonClick(msg._id, e)}
        >
          React
        </MenuItem>
      </div>
    </div>
  );
};

export default MessageActionMenu;