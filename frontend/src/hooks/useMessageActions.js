import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

const FIVE_MIN = 5 * 60 * 1000;

const useMessageActions = ({
  editMessage,
  deleteForMe,
  deleteForEveryone,
  toggleReaction,
  isSoundEnabled,
  playRandomKeyStrokeSound,
  activeChatId,
}) => {
  const [activeMsgId, setActiveMsgId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showReactionsMenu, setShowReactionsMenu] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Timer to keep canModify logic accurate
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  // Reset state on chat switch
  useEffect(() => {
    setActiveMsgId(null);
    setEditingId(null);
    setReplyTo(null);
    setShowReactionsMenu(null);
  }, [activeChatId]);

  // Click outside handler  Emoji Picker
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeMsgId && !e.target.closest(".action-menu") && !e.target.closest(".three-dot-button")) {
        setActiveMsgId(null);
      }
      
      const isPickerClick = e.target.closest(".EmojiPickerReact") || e.target.closest(".epr-main");
      
      if (showReactionsMenu && 
          !e.target.closest(".reactions-menu") && 
          !e.target.closest(".react-button") && 
          !isPickerClick) {
        setShowReactionsMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMsgId, showReactionsMenu]);

  const canModify = useCallback((createdAt) => {
    const diff = now - new Date(createdAt).getTime();
    return (diff < 0 ? 0 : diff) < FIVE_MIN;
  }, [now]);

  const closeAllMenus = useCallback(() => {
    setActiveMsgId(null);
    setShowReactionsMenu(null);
  }, []);

  // Action Handlers
  const startEdit = (msg) => {
    if (!canModify(msg.createdAt)) {
      toast.error("Editing window (5m) has passed");
      return;
    }
    if (isSoundEnabled && playRandomKeyStrokeSound) playRandomKeyStrokeSound();
    setEditingId(msg._id);
    setEditText(msg.text || "");
    closeAllMenus();
  };

  const handleReactionClick = useCallback((messageId, emoji) => {
    if (isSoundEnabled && playRandomKeyStrokeSound) playRandomKeyStrokeSound();
    toggleReaction(messageId, emoji);
    closeAllMenus();
  }, [toggleReaction, closeAllMenus, isSoundEnabled, playRandomKeyStrokeSound]);

  return {
    canModify,
    activeMsgId,
    editingId,
    editText,
    replyTo,
    showReactionsMenu,
    handleThreeDotClick: (msgId, e) => {
      e?.stopPropagation();
      if (isSoundEnabled && playRandomKeyStrokeSound) playRandomKeyStrokeSound();
      setActiveMsgId(prev => prev === msgId ? null : msgId);
      setShowReactionsMenu(null);
    },

    handleReactionButtonClick: (msgId, e) => {
      e?.stopPropagation();
      if (isSoundEnabled && playRandomKeyStrokeSound) playRandomKeyStrokeSound();
      setShowReactionsMenu(prev => prev === msgId ? null : msgId);
      setActiveMsgId(null);
    },

    startEdit,

    handleEditTextChange: (e) => {
      setEditText(e.target.value);
      if (isSoundEnabled && playRandomKeyStrokeSound) playRandomKeyStrokeSound();
    },

    submitEdit: (id, createdAt) => {
      if (!editText.trim() || !canModify(createdAt)) return;
      if (isSoundEnabled && playRandomKeyStrokeSound) playRandomKeyStrokeSound();
      editMessage(id, editText);
      setEditingId(null);
    },

    handleDelete: (id, type, createdAt) => {
      if (isSoundEnabled && playRandomKeyStrokeSound) playRandomKeyStrokeSound();
      if (type === "everyone" && !canModify(createdAt)) {
        toast.error("Too late to delete for everyone");
        return;
      }
      type === "me" ? deleteForMe(id) : deleteForEveryone(id);
      closeAllMenus();
    },

    handleReactionClick,

    handleExistingReactionClick: (messageId, emoji) => {
      if (isSoundEnabled && playRandomKeyStrokeSound) playRandomKeyStrokeSound();
      toggleReaction(messageId, emoji);
    },

    handleReply: (msg) => {
      if (isSoundEnabled && playRandomKeyStrokeSound) playRandomKeyStrokeSound();
      setReplyTo(msg);
      closeAllMenus();
    },
    
    closeAllMenus,
    setReplyTo,
    setEditingId,
  };
};

export default useMessageActions;