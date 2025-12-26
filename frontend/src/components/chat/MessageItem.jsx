import React, { useState } from "react";
import MessageBubble from "./MessageBubble";
import MessageReactions from "./MessageReactions";
import MessageTimestamp from "./MessageTimestamp";
import MessageActionMenu from "./MessageActionMenu";
import ReactionPickerMenu from "./ReactionPickerMenu";
import { MoreVertical, CheckCircle2 } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import MessageInfoDrawer from "../groups/MessageInfoDrawer";

const MessageItem = ({
  msg,
  isMe,
  authUser,
  selectedUser,
  selectedGroup,
  messageActions,
  setSelectedImg,
}) => {
  const { isSelectionMode, selectedMessages, toggleMessageSelection } = useChatStore();
  const isSelected = selectedMessages.includes(msg._id);

  const {
    canModify,
    activeMsgId,
    editingId,
    editText,
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
    setEditingId,
  } = messageActions;

  const isGroup = !!selectedGroup;
  const canEdit = isMe && canModify(msg.createdAt);
  const msgReactions = msg.reactions || [];
  const [showFullPicker, setShowFullPicker] = useState(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);

  // Helper to generate unique colors for group members
  const getSenderColor = (name = "") => {
    const colors = [
      "text-blue-400", "text-emerald-400", "text-amber-400", 
      "text-rose-400", "text-violet-400", "text-cyan-400", "text-orange-400"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const senderName = isMe
    ? "You"
    : msg.senderId?.fullName || selectedUser?.fullName || "Unknown";
    
  const senderPic = isMe
    ? authUser?.profilePic
    : msg.senderId?.profilePic || selectedUser?.profilePic || "/avatar.png";

  const handleItemClick = (e) => {
    if (isSelectionMode) {
      e.stopPropagation();
      toggleMessageSelection(msg._id);
    }
  };

  return (
    <div
      onClick={handleItemClick}
      className={`w-full flex transition-colors duration-200 ${
        isMe ? "justify-end" : "justify-start"
      } ${isSelectionMode ? "cursor-pointer" : ""} ${
        isSelected ? "bg-cyan-500/10" : ""
      } mb-2 px-2 md:px-6 py-0.5 relative`}
    >
      <div
        className={`flex items-end gap-2 max-w-[85%] md:max-w-[75%] group ${
          isMe ? "flex-row-reverse" : "flex-row"
        }`}
        onClick={(e) => !isSelectionMode && e.stopPropagation()}
      >
        {/* 1. SELECTION CHECKBOX */}
        {isSelectionMode && (
          <div className="self-center flex-shrink-0 px-2">
            {isSelected ? (
              <CheckCircle2
                size={22}
                className="text-cyan-500 fill-cyan-500/20 animate-in zoom-in duration-200"
              />
            ) : (
              <div className="size-[22px] rounded-full border-2 border-slate-700" />
            )}
          </div>
        )}

        {/* 2. AVATAR */}
        {!isSelectionMode && (
          <div className="flex-shrink-0 mb-3 hidden sm:block">
            <img
              src={senderPic}
              alt={senderName}
              className="size-8 rounded-full object-cover border border-slate-800 shadow-sm"
            />
          </div>
        )}

        {/* 3. BUBBLE CONTENT */}
        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} min-w-0`}>
          
          {/* SENDER NAME (Groups Only) */}
          {!isMe && isGroup && (
            <span className={`text-[11px] font-bold ml-3 mb-0.5 uppercase tracking-wide ${getSenderColor(senderName)}`}>
              {senderName}
            </span>
          )}

          <div className="relative">
            <MessageBubble
              msg={msg}
              isMe={isMe}
              authUser={authUser}
              selectedUser={selectedUser}
              editingId={editingId}
              editText={editText}
              handleEditTextChange={handleEditTextChange}
              submitEdit={submitEdit}
              setEditingId={setEditingId}
              setSelectedImg={setSelectedImg}
            />
          </div>

          {/* REACTIONS ROW */}
          {msgReactions.length > 0 && (
            <div className={`-mt-3 z-10 ${isMe ? "mr-2" : "ml-2"}`}>
              <MessageReactions
                msgReactions={msgReactions}
                isMe={isMe}
                authUser={authUser}
                handleExistingReactionClick={handleExistingReactionClick}
                msgId={msg._id}
              />
            </div>
          )}

          <MessageTimestamp msg={msg} isMe={isMe} />
        </div>

        {/* 4. ACTION BUTTONS (THREE DOTS) */}
        {!msg.isDeleted && !isSelectionMode && (
          <div className={`relative self-center z-20 ${isMe ? "mr-1" : "ml-1"}`}>
            <button
              className={`p-2 rounded-full transition-all duration-200 
                ${activeMsgId === msg._id
                  ? "bg-slate-800 opacity-100"
                  : "opacity-0 group-hover:opacity-100 hover:bg-slate-800/50"
                } text-slate-500 hover:text-white`}
              onClick={(e) => handleThreeDotClick(msg._id, e)}
            >
              <MoreVertical size={16} />
            </button>

            {/* ACTION MENU */}
            {activeMsgId === msg._id && (
              <div className={`absolute bottom-full mb-2 z-[100] ${isMe ? "right-0" : "left-0"}`}>
                <MessageActionMenu
                  msg={msg}
                  isMe={isMe}
                  canEdit={canEdit}
                  handleReply={handleReply}
                  startEdit={startEdit}
                  isGroup={isGroup}
                  handleDelete={(id, type) => handleDelete(id, type, msg.createdAt)}
                  handleReactionButtonClick={handleReactionButtonClick}
                  enterSelectionMode={() => toggleMessageSelection(msg._id)}
                  onInfoClick={() => {
                    setShowInfoDrawer(true);
                    handleThreeDotClick(null);
                  }}
                />
              </div>
            )}

            {/* REACTION PICKER */}
            {showReactionsMenu === msg._id && (
              <div className={`absolute bottom-full mb-2 z-[110] ${isMe ? "right-0" : "left-0"}`}>
                <ReactionPickerMenu
                  msgId={msg._id}
                  isMe={isMe}
                  handleReactionClick={handleReactionClick}
                  showFullPicker={showFullPicker}
                  setShowFullPicker={setShowFullPicker}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. GROUP MESSAGE INFO DRAWER (READ BY / DELIVERED TO) */}
      {showInfoDrawer && (
        <MessageInfoDrawer 
          msg={msg} 
          onClose={() => setShowInfoDrawer(false)} 
          isGroup={isGroup}
          selectedGroup={selectedGroup}
        />
      )}
    </div>
  );
};

export default MessageItem;