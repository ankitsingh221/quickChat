import React, { useRef, useState, useEffect, useCallback } from "react";
import { XIcon, ImageIcon, SendIcon, LockIcon, SmileIcon } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import useKeyboardSound from "../hooks/useKeyboardSound";

const MessageInput = ({ replyTo, setReplyTo, isGroup: isGroupProp }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const {
    sendMessage,
    sendGroupMessage,
    isSoundEnabled,
    selectedUser,
    selectedGroup,
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const { playRandomKeyStrokeSound, playMessageSentSound } = useKeyboardSound();

  const isGroup = isGroupProp ?? !!selectedGroup;
  const activeChatId = isGroup ? selectedGroup?._id : selectedUser?._id;

  const isCreator =
    isGroup &&
    (selectedGroup?.createdBy?._id || selectedGroup?.createdBy) ===
      authUser?._id;
  const isAdmin =
    isGroup &&
    selectedGroup?.admins?.some(
      (admin) => (admin._id || admin) === authUser?._id
    );

  const canSend =
    !isGroup ||
    !selectedGroup?.settings?.onlyAdminsCanSend ||
    isAdmin ||
    isCreator;

  // Typing logic
  const emitTypingStatus = useCallback(
    (status) => {
      if (!socket || !activeChatId || !authUser) return;
      const event = status === "typing" ? "typing" : "stopTyping";
      socket.emit(event, { chatId: activeChatId, isGroup: isGroup });
    },
    [socket, activeChatId, isGroup, authUser]
  );

  const handleTyping = (e) => {
    const newValue = e.target.value;
    setText(newValue);
    if (isSoundEnabled) playRandomKeyStrokeSound();
    if (!canSend) return;

    if (newValue.length > 0) {
      emitTypingStatus("typing");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(
        () => emitTypingStatus("stopTyping"),
        2000
      );
    } else {
      emitTypingStatus("stopTyping");
    }
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
    if (isSoundEnabled) playRandomKeyStrokeSound();
    // Re-trigger typing status for emoji insertion
    emitTypingStatus("typing");
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText && !imagePreview) return;
    if (!canSend) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTypingStatus("stopTyping");

    if (isSoundEnabled) {
      playMessageSentSound
        ? playMessageSentSound()
        : playRandomKeyStrokeSound();
    }

    const messageData = {
      text: trimmedText,
      image: imagePreview,
      replyTo: replyTo
        ? {
            _id: replyTo._id,
            text: replyTo.text,
            image: replyTo.image,
            senderId: replyTo.senderId,
          }
        : null,
    };

    try {
      if (isGroup) await sendGroupMessage(messageData);
      else await sendMessage(messageData);

      setText("");
      setImagePreview(null);
      setReplyTo(null);
      setShowEmojiPicker(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!canSend) {
    return (
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 py-3 px-4 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-500 text-sm italic">
          <LockIcon size={14} /> Only admins can send messages to this group.
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSendMessage}
      className="p-4 border-t border-slate-700/50 relative bg-base-100"
    >
      {/* Emoji Picker Container */}
      {showEmojiPicker && (
        <div
          className="absolute bottom-20 left-4 z-50 shadow-2xl animate-in fade-in slide-in-from-bottom-2"
          ref={emojiPickerRef}
        >
          <EmojiPicker
            theme="dark"
            onEmojiClick={onEmojiClick}
            autoFocusSearch={false}
            width={320}
            height={400}
          />
        </div>
      )}

      {/* Reply UI */}
      {replyTo && (
        <div className="max-w-3xl mx-auto mb-2 p-2 rounded bg-slate-800 border-l-4 border-cyan-500 flex justify-between items-start">
          <div className="flex-1 text-sm overflow-hidden text-slate-300">
            <p className="text-xs font-semibold text-cyan-400">
              Replying to {replyTo.senderId?.fullName}
            </p>
            <p className="truncate  text-slate-300 italic">"{replyTo.text}"</p>
          </div>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="ml-2"
          >
            <XIcon className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-lg border border-slate-700"
          />
          <button
            type="button"
            onClick={() => setImagePreview(null)}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 border border-slate-700"
          >
            <XIcon className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="max-w-3xl mx-auto flex items-end space-x-2">
        <div className="flex-1 relative flex items-center bg-slate-800/50 border border-slate-700/50 rounded-xl">
          {/* Emoji Toggle Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-3 transition-colors ${
              showEmojiPicker
                ? "text-cyan-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <SmileIcon className="w-5 h-5" />
          </button>

          <textarea
            value={text}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows={1}
            placeholder="Type your message..."
            className="w-full resize-none bg-transparent py-3 px-2 focus:outline-none text-sm max-h-32 overflow-y-auto"
          />
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setImagePreview(reader.result);
              reader.readAsDataURL(file);
            }
          }}
          className="hidden"
        />

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-slate-800/50 rounded-xl text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className="bg-cyan-500 text-slate-900 rounded-xl p-3 font-bold hover:bg-cyan-400 transition-all disabled:opacity-30"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
