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

  // 1. Timer to keep logic accurate
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  // 2. Reset state on chat switch
  useEffect(() => {
    setActiveMsgId(null);
    setEditingId(null);
    setReplyTo(null);
    setShowReactionsMenu(null);
  }, [activeChatId]);

  // 3. Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
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

  // 4. FIXED LOGIC HELPERS: Handling Clock Drift
  const canModify = useCallback((createdAt) => {
    const messageTime = new Date(createdAt).getTime();
    const currentTime = now;
    const diff = currentTime - messageTime;

    // If diff is negative, it means the server clock is ahead of the client.
    // We treat messages from the "future" as brand new (0ms old).
    const adjustedAge = diff < 0 ? 0 : diff;

    return adjustedAge < FIVE_MIN;
  }, [now]);

  const closeAllMenus = useCallback(() => {
    setActiveMsgId(null);
    setShowReactionsMenu(null);
  }, []);

  // 5. Action Handlers
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
    handleExistingReactionClick: (messageId, emoji) => {
      // Logic for removing/toggling from the badge directly
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