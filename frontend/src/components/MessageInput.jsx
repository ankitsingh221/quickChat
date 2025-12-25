import React, { useRef, useState, useEffect, useCallback } from "react";
import { XIcon, ImageIcon, SendIcon, LockIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import useKeyboardSound from "../hooks/useKeyboardSound";

const MessageInput = ({ replyTo, setReplyTo, isGroup: isGroupProp }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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

  //  Check if user is an Admin
  const isAdmin =
    isGroup &&
    selectedGroup?.admins?.some(
      (admin) => (admin._id || admin) === authUser?._id
    );

  //  Final decision: Creator bypasses all restrictions
  const canSend =
    !isGroup ||
    !selectedGroup?.settings?.onlyAdminsCanSend ||
    isAdmin ||
    isCreator;

  // typing logic both for group and one to one chat
  const emitTypingStatus = useCallback(
    (status) => {
      if (!socket || !activeChatId || !authUser) return;

      const event = status === "typing" ? "typing" : "stopTyping";

      console.log(
        `📤 Emitting ${isGroup ? "group" : "private"} typing:`,
        event,
        {
          chatId: activeChatId,
          isGroup,
        }
      );

      socket.emit(event, {
        chatId: activeChatId,
        isGroup: isGroup,
      });
    },
    [socket, activeChatId, isGroup, authUser]
  );

  const handleTyping = (e) => {
    const newValue = e.target.value;
    setText(newValue);

    if (isSoundEnabled) playRandomKeyStrokeSound();
    if (!canSend) return;

    // Emit typing for BOTH group and one-to-one chats
    if (newValue.length > 0) {
      emitTypingStatus("typing");

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        emitTypingStatus("stopTyping");
      }, 2000);
    } else {
      emitTypingStatus("stopTyping");
    }
  };

  useEffect(() => {
    return () => {
      if (socket && activeChatId) {
        console.log(
          `🧹 Cleanup: Stopping ${isGroup ? "group" : "private"} typing for`,
          activeChatId
        );
        socket.emit("stopTyping", {
          chatId: activeChatId,
          isGroup: isGroup,
        });
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [activeChatId, isGroup, socket]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();

    const trimmedText = text.trim();
    if (!trimmedText && !imagePreview) return;
    if (!canSend) return;

    // Stop typing immediately for both group and one-to-one
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
      if (isGroup) {
        await sendGroupMessage(messageData);
      } else {
        await sendMessage(messageData);
      }

      setText("");
      setImagePreview(null);
      setReplyTo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!canSend) {
    return (
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 py-3 px-4 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-500 text-sm italic">
          <LockIcon size={14} />
          Only admins can send messages to this group.
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSendMessage}
      className="p-4 border-t border-slate-700/50 relative bg-base-100"
    >
      {/* Reply UI */}
      {replyTo && (
        <div className="max-w-3xl mx-auto mb-2 p-2 rounded bg-slate-800 border-l-4 border-cyan-500 flex justify-between items-start animate-in slide-in-from-bottom-2">
          <div className="flex-1 text-sm overflow-hidden">
            <p className="text-xs font-semibold text-cyan-400">
              Replying to {replyTo.senderId?.fullName || "User"}
            </p>
            {replyTo.text && (
              <p className="truncate text-slate-300 italic">"{replyTo.text}"</p>
            )}
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

      {/* Image Preview UI */}
      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 animate-in zoom-in-95">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-slate-700"
            />
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 shadow-lg border border-slate-700"
            >
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto flex items-end space-x-3">
        <div className="flex-1 relative">
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
            className="w-full resize-none bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
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
          className="bg-cyan-500 text-slate-900 rounded-xl p-3 font-bold hover:bg-cyan-400 transition-all disabled:opacity-30 disabled:grayscale"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
