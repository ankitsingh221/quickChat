import React, { useRef, useState, useEffect } from "react";
import { XIcon, ImageIcon, SendIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import useKeyboardSound from "../hooks/useKeyboardSound";

const MessageInput = ({ replyTo, setReplyTo }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { sendMessage, isSoundEnabled, selectedUser } = useChatStore();
  const { authUser, socket } = useAuthStore(); 
  const { playRandomKeyStrokeSound, playMessageSentSound } = useKeyboardSound();

  // Stop typing indicator if component unmounts or user changes
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (socket && selectedUser) {
        socket.emit("stopTyping", { receiverId: selectedUser._id });
      }
    };
  }, [selectedUser?._id, socket,selectedUser]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!text.trim() && !imagePreview) return;

    // Stop typing indicator immediately on send
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("stopTyping", { receiverId: selectedUser._id });

    if (isSoundEnabled && playMessageSentSound) {
      playMessageSentSound();
    } else if (isSoundEnabled) {
      playRandomKeyStrokeSound();
    }

    sendMessage({
      text: text.trim(),
      image: imagePreview,
      replyTo: replyTo
        ? {
            _id: replyTo._id,
            text: replyTo.text,
            image: replyTo.image,
            senderId: replyTo.senderId,
          }
        : null,
    });

    setText("");
    setImagePreview(null);
    setReplyTo(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (isSoundEnabled) playRandomKeyStrokeSound();

   
    if (!socket || !selectedUser) return;

    // 1. Emit typing event
    socket.emit("typing", { receiverId: selectedUser._id });

    // 2. Clear existing stop-typing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // 3. Set a new timeout to stop the indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }, 2000);
  };

  return (
    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700/50">
      {/* Reply Preview */}
      {replyTo && (
        <div className="max-w-3xl mx-auto mb-2 p-2 rounded bg-slate-800 border-l-4 border-cyan-500 flex justify-between items-start">
          <div className="flex-1 text-sm">
            <p className="text-xs font-semibold text-cyan-400">
              Replying to{" "}
              {replyTo.senderId?.toString() === authUser?._id?.toString()
                ? "yourself"
                : selectedUser?.fullName || "User"}
            </p>
            {replyTo.text && <p className="truncate text-slate-300">{replyTo.text}</p>}
            {replyTo.image && !replyTo.text && <p className="italic text-slate-400">📷 Photo</p>}
          </div>
          <button type="button" onClick={() => setReplyTo(null)}>
            <XIcon className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-slate-700" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto flex items-end space-x-4">
        <textarea
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          rows={1}
          placeholder="Type your message..."
          className="flex-1 resize-none bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-4 focus:outline-none"
        />

        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`bg-slate-800/50 rounded-lg px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors ${
            imagePreview ? "text-cyan-500" : ""
          }`}
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;