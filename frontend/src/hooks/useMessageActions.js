import { useState, useEffect, useRef } from "react";

const FIVE_MIN = 5 * 60 * 1000;

const useMessageActions = ({
  editMessage,
  deleteForMe,
  deleteForEveryone,
  toggleReaction,
  isSoundEnabled,
  playRandomKeyStrokeSound,
}) => {
  const actionMenuRefs = useRef({});
  const reactionsMenuRefs = useRef({});

  const [activeMsgId, setActiveMsgId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showReactionsMenu, setShowReactionsMenu] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [menuPosition, setMenuPosition] = useState({});
  const [reactionMenuWidth, setReactionMenuWidth] = useState(200);

  // Update time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate reaction menu width
  useEffect(() => {
    const itemsPerRow = 4;
    const calculatedWidth = Math.min(320, (48 + 8) * itemsPerRow + 16);
    setReactionMenuWidth(calculatedWidth);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        activeMsgId &&
        !e.target.closest(".action-menu") &&
        !e.target.closest(".three-dot-button")
      ) {
        setActiveMsgId(null);
      }
      if (
        showReactionsMenu &&
        !e.target.closest(".reactions-menu") &&
        !e.target.closest(".react-button")
      ) {
        setShowReactionsMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeMsgId, showReactionsMenu]);

  const canModify = (createdAt) => now - new Date(createdAt).getTime() < FIVE_MIN;

  const handleThreeDotClick = (msgId, e, isMe) => {
    e.preventDefault();
    e.stopPropagation();

    // Get button position relative to VIEWPORT (WhatsApp style)
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const menuWidth = 192;
    const menuHeight = 220;
    
    let left, right, top;

    // Horizontal positioning - keep menu close to button
    if (isMe) {
      // For right-side messages, place menu to the left
      right = viewportWidth - buttonRect.left + 8;
      left = "auto";
    } else {
      // For left-side messages, place menu to the right
      left = buttonRect.right + 8;
      right = "auto";
    }

    // Vertical positioning - align with button
    top = buttonRect.top;
    
    // Keep menu on screen vertically
    if (top + menuHeight > viewportHeight - 16) {
      top = Math.max(16, viewportHeight - menuHeight - 16);
    }
    
    if (top < 16) {
      top = 16;
    }

    setMenuPosition((prev) => ({
      ...prev,
      [msgId]: {
        left: left === "auto" ? "auto" : `${left}px`,
        right: right === "auto" ? "auto" : `${right}px`,
        top: `${top}px`,
      },
    }));

    setActiveMsgId(activeMsgId === msgId ? null : msgId);
    setShowReactionsMenu(null);
  };

  const handleReactionButtonClick = (msgId, e, isMe) => {
    e.preventDefault();
    e.stopPropagation();

    const actionMenuRect = actionMenuRefs.current[msgId]?.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left, right, top;

    if (actionMenuRect) {
      // Place reaction menu below action menu
      top = actionMenuRect.bottom + 8;

      // Align horizontally with action menu
      if (isMe) {
        right = viewportWidth - actionMenuRect.right;
        left = "auto";
      } else {
        left = actionMenuRect.left;
        right = "auto";
      }

      // If menu goes off bottom, place it above
      if (top + 120 > viewportHeight - 16) {
        top = actionMenuRect.top - 120 - 8;
      }
    }

    // Keep menu on screen horizontally
    const menuWidth = reactionMenuWidth;
    if (left !== "auto" && left + menuWidth > viewportWidth - 16) {
      left = viewportWidth - menuWidth - 16;
    }

    setMenuPosition((prev) => ({
      ...prev,
      [msgId]: {
        ...prev[msgId],
        reactionsLeft: typeof left === "number" ? `${left}px` : left,
        reactionsRight: typeof right === "number" ? `${right}px` : right,
        reactionsTop: `${top}px`,
      },
    }));

    setShowReactionsMenu(showReactionsMenu === msgId ? null : msgId);
  };

  const startEdit = (msg) => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
    setEditingId(msg._id);
    setEditText(msg.text || "");
    setActiveMsgId(null);
    setShowReactionsMenu(null);
  };

  const handleEditTextChange = (e) => {
    setEditText(e.target.value);
    if (isSoundEnabled) playRandomKeyStrokeSound();
  };

  const submitEdit = (id) => {
    if (!editText.trim()) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();
    editMessage(id, editText);
    setEditingId(null);
  };

  const handleDelete = (id, type) => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
    if (type === "me") deleteForMe(id);
    else if (type === "everyone") deleteForEveryone(id);
    setActiveMsgId(null);
    setShowReactionsMenu(null);
  };

  const handleReactionClick = (messageId, emoji) => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
    toggleReaction(messageId, emoji);
    setShowReactionsMenu(null);
  };

  const handleExistingReactionClick = (messageId, emoji, e) => {
    e.stopPropagation();
    if (isSoundEnabled) playRandomKeyStrokeSound();
    toggleReaction(messageId, emoji);
  };

  const handleReply = (msg) => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
    setReplyTo(msg);
    setActiveMsgId(null);
    setShowReactionsMenu(null);
  };

  const closeAllMenus = () => {
    setActiveMsgId(null);
    setShowReactionsMenu(null);
  };

  return {
    canModify,
    activeMsgId,
    editingId,
    editText,
    replyTo,
    showReactionsMenu,
    menuPosition,
    actionMenuRefs,
    reactionsMenuRefs,
    handleThreeDotClick,
    handleReactionButtonClick,
    startEdit,
    handleEditTextChange,
    submitEdit,
    handleDelete,
    handleReactionClick,
    handleExistingReactionClick,
    handleReply,
    closeAllMenus,
    setReplyTo,
    setEditingId,
  };
};

export default useMessageActions;