import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
  Reply,
  Pencil,
  Smile,
  Trash2,
  Forward,
  CheckSquare,
  Info,
} from "lucide-react";
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
  triggerRef, // Passing  a ref to the trigger button from MessageItem
}) => {
  const { setForwardingMessages, toggleMessageSelection, toggleSelectionMode } =
    useChatStore();

  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({
    position: "fixed",
    top: -9999,
    left: -9999,
    opacity: 0,
    pointerEvents: "none",
    visibility: "hidden",
  });

  useEffect(() => {
    if (!triggerRef?.current || !menuRef?.current) return;

    const MENU_WIDTH = 220;
    const MENU_HEIGHT = menuRef.current.offsetHeight || 300; // estimated
    const PADDING = 8;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Vertical: prefer above the trigger, fall back to below
    let top = triggerRect.top - MENU_HEIGHT - PADDING;
    if (top < PADDING) {
      top = triggerRect.bottom + PADDING;
    }
    // Clamp to viewport
    top = Math.max(
      PADDING,
      Math.min(top, viewportHeight - MENU_HEIGHT - PADDING),
    );

    // Horizontal: align to trigger side, clamp to viewport
    let left;
    if (isMe) {
      // Right-align to trigger
      left = triggerRect.right - MENU_WIDTH;
    } else {
      // Left-align to trigger
      left = triggerRect.left;
    }
    left = Math.max(
      PADDING,
      Math.min(left, viewportWidth - MENU_WIDTH - PADDING),
    );

    setMenuStyle({
      position: "fixed",
      top,
      left,
      width: MENU_WIDTH,
      opacity: 1,
      visibility: "visible",
      pointerEvents: "auto",
      zIndex: 9999,
      transition: "opacity 100ms ease", // fade in only, no slide
    });
  }, [isMe, triggerRef]);

  const menu = (
    <div
      ref={menuRef}
      style={menuStyle}
      className="
        action-menu rounded-xl border border-white/20
        bg-black/80 backdrop-blur-xl shadow-2xl
        overflow-hidden animate-in fade-in zoom-in duration-100
      "
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col py-1">
        {isMe && isGroup && (
          <>
            <MenuItem
              icon={Info}
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick?.();
              }}
            >
              Message Info
            </MenuItem>
            <div className="border-t border-white/10 my-1" />
          </>
        )}

        <MenuItem icon={Reply} onClick={() => handleReply(msg)}>
          {isGroup ? "Reply to Group" : "Reply"}
        </MenuItem>

        <MenuItem icon={Forward} onClick={() => setForwardingMessages(msg)}>
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

  // Render into document.body via portal to escape any overflow:hidden parents
  return ReactDOM.createPortal(menu, document.body);
};

export default MessageActionMenu;
