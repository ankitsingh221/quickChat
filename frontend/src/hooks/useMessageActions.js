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

  // Timer to keep "Delete for Everyone" logic accurate
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  // reset on refresh on switch
  useEffect(() => {
    setActiveMsgId(null);
    setEditingId(null);
    setReplyTo(null);
    setShowReactionsMenu(null);
  }, [activeChatId]);

  //click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Check if click is outside menus
      if (activeMsgId && !e.target.closest(".action-menu") && !e.target.closest(".three-dot-button")) {
        setActiveMsgId(null);
      }
      if (showReactionsMenu && !e.target.closest(".reactions-menu") && !e.target.closest(".react-button")) {
        setShowReactionsMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMsgId, showReactionsMenu]);

  //  logic helpers
  const canModify = useCallback((createdAt) => {
    return now - new Date(createdAt).getTime() < FIVE_MIN;
  }, [now]);

  const closeAllMenus = () => {
    setActiveMsgId(null);
    setShowReactionsMenu(null);
  };

  // action handlers
  const startEdit = (msg) => {
    if (!canModify(msg.createdAt)) {
      toast.error("Editing time limit (5m) expired");
      return;
    }
    if (isSoundEnabled && playRandomKeyStrokeSound) playRandomKeyStrokeSound();
    setEditingId(msg._id);
    setEditText(msg.text || "");
    closeAllMenus();
  };

  const submitEdit = (id, createdAt) => {
    if (!editText.trim()) return;
    if (!canModify(createdAt)) {
      toast.error("Too late to edit!");
      setEditingId(null);
      return;
    }
    
    try {
      editMessage(id, editText);
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  const handleDelete = (id, type, createdAt) => {
    try {
      if (type === "me") {
        deleteForMe(id);
      } else {
        if (!canModify(createdAt)) {
          toast.error("Too late to delete for everyone");
          return;
        }
        deleteForEveryone(id);
      }
      closeAllMenus();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return {
    canModify,
    activeMsgId,
    editingId,
    editText,
    replyTo,
    showReactionsMenu,
    handleThreeDotClick: (msgId, e) => {
      e?.preventDefault();
      e?.stopPropagation();
      setActiveMsgId(prev => prev === msgId ? null : msgId);
      setShowReactionsMenu(null);
    },
    handleReactionButtonClick: (msgId, e) => {
      e?.preventDefault();
      e?.stopPropagation();
      setShowReactionsMenu(prev => prev === msgId ? null : msgId);
      setActiveMsgId(null);
    },
    startEdit,
    handleEditTextChange: (e) => {
      setEditText(e.target.value);
      if (isSoundEnabled && playRandomKeyStrokeSound) playRandomKeyStrokeSound();
    },
    submitEdit,
    handleDelete,
    handleReactionClick: (messageId, emoji) => {
      toggleReaction(messageId, emoji);
      closeAllMenus();
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