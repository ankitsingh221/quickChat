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
    e.stopPropagation();

    const buttonRect = e.currentTarget.getBoundingClientRect();
    const chatContainer = e.currentTarget.closest(".flex-1");
    const containerRect = chatContainer.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    const buttonLeft = buttonRect.left - containerRect.left;
    const buttonRight = containerRect.right - buttonRect.right;
    const buttonTop = buttonRect.top - containerRect.top;

    let left, right;

    if (isMe) {
      if (buttonLeft > 250) {
        right = buttonRight + 24;
        left = "auto";
      } else {
        left = buttonLeft + 24;
        right = "auto";
      }
    } else {
      if (buttonRight > 250) {
        left = buttonLeft + 24;
        right = "auto";
      } else {
        right = buttonRight + 24;
        left = "auto";
      }
    }

    if (left && left + 176 > viewportWidth - 16) {
      left = Math.max(16, viewportWidth - buttonRect.right - 24);
      right = "auto";
    }

    setMenuPosition((prev) => ({
      ...prev,
      [msgId]: {
        left: left ? `${left}px` : "auto",
        right: right ? `${right}px` : "auto",
        top: `${buttonTop + buttonRect.height}px`,
      },
    }));

    setActiveMsgId(activeMsgId === msgId ? null : msgId);
    setShowReactionsMenu(null);
  };

  const handleReactionButtonClick = (msgId, e, isMe) => {
    e.stopPropagation();

    const actionMenuRect = actionMenuRefs.current[msgId]?.getBoundingClientRect();
    const chatContainer = e.currentTarget.closest(".flex-1");
    const containerRect = chatContainer?.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left, right, top;

    if (actionMenuRect) {
      top = actionMenuRect.bottom - containerRect.top;

      if (isMe) {
        if (actionMenuRect.left < viewportWidth / 2) {
          left = actionMenuRect.left - containerRect.left;
          right = "auto";
        } else {
          right = viewportWidth - actionMenuRect.right;
          left = "auto";
        }
      } else {
        if (actionMenuRect.right > viewportWidth / 2) {
          right = viewportWidth - actionMenuRect.right;
          left = "auto";
        } else {
          left = actionMenuRect.left - containerRect.left;
          right = "auto";
        }
      }
    } else {
      const buttonRect = e.currentTarget.closest(".three-dot-button")?.getBoundingClientRect();
      if (buttonRect) {
        top = buttonRect.bottom - containerRect.top;
        if (isMe) {
          right = viewportWidth - buttonRect.right;
          left = "auto";
        } else {
          left = buttonRect.left - containerRect.left;
          right = "auto";
        }
      }
    }

    if (top + 120 > viewportHeight - containerRect.top) {
      top = (actionMenuRect?.top || 0) - containerRect.top - 120;
    }

    const menuWidth = reactionMenuWidth;
    if (left && left + menuWidth > viewportWidth - 16) {
      left = viewportWidth - menuWidth - 16;
      right = "auto";
    }

    setMenuPosition((prev) => ({
      ...prev,
      [msgId]: {
        ...prev[msgId],
        reactionsLeft: left ? `${left}px` : "auto",
        reactionsRight: right ? `${right}px` : "auto",
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