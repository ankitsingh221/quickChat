import { useState, useEffect } from "react";

const FIVE_MIN = 5 * 60 * 1000;

const useMessageActions = ({
  editMessage,
  deleteForMe,
  deleteForEveryone,
  toggleReaction,
  isSoundEnabled,
  playRandomKeyStrokeSound,
}) => {
  const [activeMsgId, setActiveMsgId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showReactionsMenu, setShowReactionsMenu] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Update time for edit window logic
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);


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

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMsgId, showReactionsMenu]);

  const canModify = (createdAt) =>
    now - new Date(createdAt).getTime() < FIVE_MIN;

  //Actions

  const handleThreeDotClick = (msgId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMsgId((prev) => (prev === msgId ? null : msgId));
    setShowReactionsMenu(null);
  };

  const handleReactionButtonClick = (msgId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReactionsMenu((prev) => (prev === msgId ? null : msgId));
    setActiveMsgId(null);
  };

  const startEdit = (msg) => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
    setEditingId(msg._id);
    setEditText(msg.text || "");
    closeAllMenus();
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
    else deleteForEveryone(id);
    closeAllMenus();
  };

  const handleReactionClick = (messageId, emoji) => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
    toggleReaction(messageId, emoji);
    closeAllMenus();
  };

  const handleExistingReactionClick = (messageId, emoji, e) => {
    e.stopPropagation();
    if (isSoundEnabled) playRandomKeyStrokeSound();
    toggleReaction(messageId, emoji);
  };

  const handleReply = (msg) => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
    setReplyTo(msg);
    closeAllMenus();
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
