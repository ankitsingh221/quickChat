import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import ChatHeader from "../ChatHeader";
import MessageInput from "../MessageInput";
import MessagesLoadingSkeleton from "../MessagesLoadingSkeleton";
import NoChatHistoryPlaceholder from "../NoChatHistoryPlaceholder";
import useKeyboardSound from "../../hooks/useKeyboardSound";
import { REACTION_EMOJIS } from "../../constants/reactionEmojis";

const FIVE_MIN = 5 * 60 * 1000;

const ChatContainer = () => {
  const { authUser } = useAuthStore();
  const { playRandomKeyStrokeSound, playMessageReceivedSound } =
    useKeyboardSound();

  const {
    selectedUser,
    messages,
    isMessagesLoading,
    getMessagesByUserId,
    subscribeToMessages,
    unsubscribeFromMessages,
    editMessage,
    deleteForMe,
    deleteForEveryone,
    toggleReaction,
    isSoundEnabled,
    markMessagesAsRead,
  } = useChatStore();

  const prevMessagesLengthRef = useRef(messages.length);

  const messageEndRef = useRef(null);
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
  const [selectedImg, setSelectedImg] = useState(null);
  const isMarkingAsRead = useRef(false);
 

//  read recept logic
useEffect(() => {
  if (selectedUser?._id) {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
   
    isMarkingAsRead.current = false;
  }
  return () => unsubscribeFromMessages();
}, [selectedUser?._id, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

// EFFECT 2: The "Smart" Read Receipt Logic
useEffect(() => {
  if (!selectedUser?._id || messages.length === 0) return;

  const handleMarkAsRead = () => {
    const lastMsg = messages[messages.length - 1];

    const isWindowFocused = document.hasFocus();

    if (
      lastMsg.senderId === selectedUser._id && 
      !lastMsg.seen && 
      !isMarkingAsRead.current &&
      isWindowFocused 
    ) {
      isMarkingAsRead.current = true;

      markMessagesAsRead(selectedUser._id).finally(() => {
        setTimeout(() => {
          isMarkingAsRead.current = false;
        }, 500);
      });
    }
  };

  handleMarkAsRead();
  window.addEventListener("focus", handleMarkAsRead);
  
  return () => window.removeEventListener("focus", handleMarkAsRead);
}, [messages, selectedUser?._id, markMessagesAsRead]);


  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length > prevMessagesLengthRef.current) {
      const latestMessage = messages[messages.length - 1];
      const isIncomingMessage =
        latestMessage.senderId.toString() !== authUser._id.toString();

      if (isIncomingMessage && isSoundEnabled) {
        if (playMessageReceivedSound) {
          playMessageReceivedSound();
        } else {
          playRandomKeyStrokeSound();
        }
      }
    }

    prevMessagesLengthRef.current = messages.length;
  }, [
    messages,
    authUser._id,
    isSoundEnabled,
    playMessageReceivedSound,
    playRandomKeyStrokeSound,
  ]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const itemsPerRow = 4;
    const calculatedWidth = Math.min(320, (48 + 8) * itemsPerRow + 16);
    setReactionMenuWidth(calculatedWidth);
  }, []);

  const canModify = (createdAt) =>
    now - new Date(createdAt).getTime() < FIVE_MIN;

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

    const actionMenuRect =
      actionMenuRefs.current[msgId]?.getBoundingClientRect();
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
      const buttonRect = e.currentTarget
        .closest(".three-dot-button")
        ?.getBoundingClientRect();
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

  return (
    <>
      <ChatHeader />

      <div
        className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-900 relative custom-scrollbar"
        onClick={() => {
          setActiveMsgId(null);
          setShowReactionsMenu(null);
        }}
      >
        {!isMessagesLoading && messages.length ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isMe = msg.senderId.toString() === authUser._id.toString();
              const canEdit = isMe && canModify(msg.createdAt);
              const msgReactions = msg.reactions || [];

              return (
                <div
                  key={msg._id}
                  className={`chat ${
                    isMe ? "chat-end" : "chat-start"
                  } w-full flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`relative flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    } max-w-[85%] md:max-w-[75%] group`} /* 'group' placed here to fix hover area */
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Three Dot Menu Button - Visible only on Hover */}
                    {!msg.isDeleted && (
                      <button
                        className={`absolute top-2 three-dot-button p-1 rounded-full hover:bg-slate-700/50 transition-all duration-200 z-10 
                      opacity-0 group-hover:opacity-100 ${
                        isMe ? "-left-8" : "-right-8"
                      }`}
                        onClick={(e) => handleThreeDotClick(msg._id, e, isMe)}
                      >
                        <svg
                          className="w-5 h-5 text-slate-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`chat-bubble w-fit max-w-full px-4 py-2 shadow-md transition-all ${
                        isMe
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-800 text-slate-200"
                      }`}
                      style={{ minWidth: "fit-content" }}
                    >
                      {msg.isDeleted ? (
                        <p className="italic opacity-60 text-sm">
                          This message was deleted
                        </p>
                      ) : (
                        <>
                          {/* Reply Reference */}
                          {msg.replyTo && (
                            <div
                              className={`mb-2 px-2.5 py-1.5 rounded-lg border-l-4 text-xs backdrop-blur cursor-pointer min-w-[100px] ${
                                isMe
                                  ? "border-white/70 bg-black/20"
                                  : "border-cyan-500 bg-slate-700/50"
                              }`}
                            >
                              <p
                                className={`font-semibold ${
                                  isMe ? "text-white" : "text-cyan-400"
                                }`}
                              >
                                {msg.replyTo.senderId?.toString() ===
                                authUser._id?.toString()
                                  ? "You"
                                  : selectedUser?.fullName}
                              </p>
                              <p className="truncate opacity-80 mt-0.5">
                                {msg.replyTo.text}
                              </p>
                            </div>
                          )}

                          {/* Editing or Content */}
                          {editingId === msg._id ? (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              <input
                                className="w-full p-1 rounded text-black text-sm outline-none"
                                value={editText}
                                onChange={handleEditTextChange}
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  className="text-xs opacity-80"
                                  onClick={() => setEditingId(null)}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="px-2 py-0.5 bg-green-500 rounded text-white text-xs"
                                  onClick={() => submitEdit(msg._id)}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              {msg.text && (
                                <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">
                                  {msg.text}
                                </p>
                              )}

                              {/* CONSTRAINED IMAGE BOX */}
                              {msg.image && (
                                <div className="mt-1 relative overflow-hidden rounded-lg">
                                  <img
                                    src={msg.image}
                                    alt="Sent"
                                    onClick={() => setSelectedImg(msg.image)}
                                    className="max-w-[240px] md:max-w-[300px] max-h-[300px] w-auto h-auto object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                          {msg.isEdited && (
                            <span className="text-[10px] opacity-60 block text-right mt-1">
                              edited
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Reactions List */}
                    {msgReactions.length > 0 && (
                      <div
                        className={`flex gap-1 mt-1 flex-wrap ${
                          isMe ? "justify-end mr-1" : "justify-start ml-1"
                        }`}
                      >
                        {msgReactions.map((r, i) => {
                          const isMyReaction =
                            r.userId.toString() === authUser._id.toString();
                          return (
                            <button
                              key={i}
                              onClick={(e) =>
                                handleExistingReactionClick(msg._id, r.emoji, e)
                              }
                              className={`px-1.5 py-0.5 rounded-full text-[11px] flex items-center gap-1 backdrop-blur border transition-all hover:scale-110 ${
                                isMyReaction
                                  ? "bg-cyan-600/80 text-white border-cyan-400"
                                  : "bg-slate-700/60 text-slate-200 border-slate-600"
                              }`}
                            >
                              {r.emoji} {isMyReaction ? "You" : ""}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Timestamp & Read Status */}
                    {/* Timestamp & Read Status Section */}
                    <div
                      className={`flex items-center gap-1 mt-1 px-1 ${
                        isMe ? "flex-row" : "flex-row-reverse"
                      }`}
                    >
                      <p className="text-[10px] opacity-40">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      {/* ONLY show checkmarks for messages YOU sent */}
                      {isMe && !msg.isDeleted && (
                        <div className="flex items-center">
                          {msg.seen ? (
                            /* Double Tick (Seen) - Cyan Color */
                            <span className="text-cyan-400 transition-all duration-300 animate-in fade-in zoom-in-75">
                              <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                                <polyline points="22 10 13.5 18.5 11 16" />
                              </svg>
                            </span>
                          ) : (
                            /* Single Tick (Sent but not seen) - Gray Color */
                            <span className="text-slate-500">
                              <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Menu */}
                    {activeMsgId === msg._id && menuPosition[msg._id] && (
                      <div
                        ref={(el) => (actionMenuRefs.current[msg._id] = el)}
                        className="fixed z-[100] w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-1 overflow-hidden"
                        style={{
                          left: menuPosition[msg._id].left,
                          right: menuPosition[msg._id].right,
                          top: menuPosition[msg._id].top,
                        }}
                      >
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-700 w-full text-left"
                          onClick={() => handleReply(msg)}
                        >
                          ↩ Reply
                        </button>
                        {canEdit && (
                          <button
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-700 w-full text-left"
                            onClick={() => startEdit(msg)}
                          >
                            ✏️ Edit
                          </button>
                        )}
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-700 w-full text-left text-red-400"
                          onClick={() => handleDelete(msg._id, "me")}
                        >
                          🗑 Delete for me
                        </button>
                        {isMe && (
                          <button
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-700 w-full text-left text-red-400 font-bold"
                            onClick={() => handleDelete(msg._id, "everyone")}
                          >
                            🗑 Delete for everyone
                          </button>
                        )}
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-700 w-full text-left border-t border-slate-700"
                          onClick={(e) =>
                            handleReactionButtonClick(msg._id, e, isMe)
                          }
                        >
                          😀 React
                        </button>
                      </div>
                    )}

                    {/* Emoji Picker */}
                    {showReactionsMenu === msg._id && menuPosition[msg._id] && (
                      <div
                        ref={(el) => (reactionsMenuRefs.current[msg._id] = el)}
                        className="fixed z-[110] p-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl"
                        style={{
                          left: menuPosition[msg._id].reactionsLeft,
                          right: menuPosition[msg._id].reactionsRight,
                          top: menuPosition[msg._id].reactionsTop,
                        }}
                      >
                        <div
                          className="grid grid-cols-4 gap-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600"
                          style={{ maxHeight: "90px", width: "160px" }}
                        >
                          {REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() =>
                                handleReactionClick(msg._id, emoji)
                              }
                              className="w-10 h-10 flex items-center justify-center text-lg rounded-lg hover:bg-slate-700 transition-transform active:scale-90"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
        )}
      </div>

      {/* IMAGE LIGHTBOX MODAL */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 transition-opacity"
          onClick={() => setSelectedImg(null)}
        >
          <button className="absolute top-5 right-5 text-white hover:text-cyan-400 transition-colors">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            src={selectedImg}
            className="max-w-full max-h-full rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-200"
            alt="Zoomed"
          />
        </div>
      )}

      <MessageInput replyTo={replyTo} setReplyTo={setReplyTo} />
    </>
  );
};

export default ChatContainer;
