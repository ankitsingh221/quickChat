import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  XIcon,
  SendIcon,
  LockIcon,
  SmileIcon,
  PlusIcon,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import useKeyboardSound from "../hooks/useKeyboardSound";

const MessageInput = ({
  replyTo,
  setReplyTo,
  isGroup: isGroupProp,
}) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const textareaRef = useRef(null);

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
      (admin) => (admin._id || admin) === authUser?._id,
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
    [socket, activeChatId, isGroup, authUser],
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
        2000,
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
    emitTypingStatus("typing");
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [text]);

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

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!canSend) {
    return (
      <div className="flex-shrink-0 p-3 md:p-4 border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 py-2 md:py-3 px-3 md:px-4 bg-black/40 rounded-xl border border-cyan-500/20 text-white/40 text-xs md:text-sm italic">
          <LockIcon size={12} className="text-cyan-400 flex-shrink-0" />
          <span>Only admins can send messages to this group.</span>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSendMessage}
      className="flex-shrink-0 p-2 md:p-4 border-t border-white/10 bg-black/40 backdrop-blur-sm relative"
    >
      {/* Emoji Picker Container */}
      {showEmojiPicker && (
        <div
          className="absolute bottom-16 left-2 md:left-4 z-50 shadow-2xl animate-in fade-in slide-in-from-bottom-2"
          ref={emojiPickerRef}
        >
          <EmojiPicker
            theme="dark"
            onEmojiClick={onEmojiClick}
            autoFocusSearch={false}
            width={typeof window !== 'undefined' && window.innerWidth < 400 ? 280 : 320}
            height={400}
          />
        </div>
      )}

      {/* Reply UI  */}
      {replyTo && (
        <div className="max-w-3xl mx-auto mb-2 p-2 rounded-xl bg-cyan-500/10 border-l-4 border-cyan-500 flex justify-between items-start backdrop-blur-sm">
          <div className="flex-1 text-xs md:text-sm overflow-hidden">
            <p className="text-[10px] md:text-xs font-semibold text-cyan-400">
              Replying to {replyTo.senderId?.fullName?.split(" ")[0] || "User"}
            </p>
            <p className="truncate text-white/60 text-[10px] md:text-xs italic">
              "{replyTo.text?.substring(0, 50)}"
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <XIcon className="w-3 h-3 text-white/40 hover:text-white" />
          </button>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-2 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-xl border border-cyan-500/30 shadow-lg"
          />
          <button
            type="button"
            onClick={() => setImagePreview(null)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center text-white border border-white/20 hover:bg-red-500/80 transition-colors"
          >
            <XIcon className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Input Container  */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-1 md:gap-2">
          {/* Input Wrapper */}
          <div className="flex-1 relative flex items-center bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all overflow-hidden">
            {/* Attach Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 md:p-2 text-white/40 hover:text-cyan-400 transition-colors flex-shrink-0"
              title="Attach file"
            >
              <PlusIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Emoji Toggle Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-1.5 md:p-2 transition-colors flex-shrink-0 ${
                showEmojiPicker
                  ? "text-cyan-400"
                  : "text-white/40 hover:text-cyan-400"
              }`}
              title="Add emoji"
            >
              <SmileIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTyping}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              rows={1}
              placeholder="Message..."
              className="flex-1 resize-none bg-transparent py-2 md:py-3 px-1 focus:outline-none text-white text-sm md:text-base max-h-28 overflow-y-auto placeholder:text-white/30"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-black rounded-2xl p-2.5 md:p-3 font-bold hover:from-cyan-400 hover:to-cyan-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex-shrink-0"
          >
            <SendIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
          }
        }}
        className="hidden"
      />
    </form>
  );
};

export default MessageInput;