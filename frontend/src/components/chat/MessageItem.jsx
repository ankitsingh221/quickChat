import React, { useState } from "react";
import MessageBubble from "./MessageBubble";
import MessageReactions from "./MessageReactions";
import MessageTimestamp from "./MessageTimestamp";
import MessageActionMenu from "./MessageActionMenu";
import ReactionPickerMenu from "./ReactionPickerMenu";
import { MoreVertical, CheckCircle2 } from "lucide-react"; 
import { useChatStore } from "../../store/useChatStore";

const MessageItem = ({
  msg,
  isMe,
  authUser,
  selectedUser,
  messageActions,
  setSelectedImg,
}) => {
  // 1. Hook into Selection State from your store
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

  const canEdit = isMe && canModify(msg.createdAt);
  const msgReactions = msg.reactions || [];
  const [showFullPicker, setShowFullPicker] = useState(false);

  // 2. Click Handler for Selection
  const handleItemClick = (e) => {
    if (isSelectionMode) {
      e.stopPropagation();
      toggleMessageSelection(msg._id);
    }
  };

  return (
    <div
      onClick={handleItemClick} // Trigger selection on full row click if mode is active
      className={`w-full flex flex-col transition-colors duration-200 ${
        isMe ? "items-end" : "items-start"
      } ${isSelectionMode ? "cursor-pointer" : ""} ${
        isSelected ? "bg-primary/10" : "" // Highlight selected message
      } mb-4 px-2 md:px-4 py-1`}
    >
      <div
        className={`flex items-start gap-3 max-w-[90%] md:max-w-[80%] group ${
          isMe ? "flex-row-reverse" : "flex-row"
        }`}
        onClick={(e) => !isSelectionMode && e.stopPropagation()}
      >
        {/* 3. Checkbox for Selection Mode */}
        {isSelectionMode && (
          <div className="self-center flex-shrink-0">
            {isSelected ? (
              <CheckCircle2 size={22} className="text-primary fill-primary/20 animate-in zoom-in duration-200" />
            ) : (
              <div className="w-[22px] h-[22px] rounded-full border-2 border-base-300" />
            )}
          </div>
        )}

        {/* Bubble + reactions + Timestamp container */}
        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
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

        {/* 4. Action buttons - Hide them if in Selection Mode */}
        {!msg.isDeleted && !isSelectionMode && (
          <div className="relative self-center z-[60]">
            <button
              className={`p-2 rounded-full transition-all duration-200 
                ${activeMsgId === msg._id ? "bg-base-300 opacity-100" : "opacity-0 group-hover:opacity-100 hover:bg-base-200"}
                text-base-content/70 hover:text-base-content`}
              onClick={(e) => handleThreeDotClick(msg._id, e)}
            >
              <MoreVertical size={18} />
            </button>

            {activeMsgId === msg._id && (
              <div className="absolute bottom-full right-0 mb-2">
                 <MessageActionMenu
                    msg={msg}
                    isMe={isMe}
                    canEdit={canEdit}
                    handleReply={handleReply}
                    startEdit={startEdit}
                    handleDelete={handleDelete}
                    handleReactionButtonClick={handleReactionButtonClick}
                    enterSelectionMode={() => toggleMessageSelection(msg._id)} // Optional shortcut
                  />
              </div>
            )}

            {showReactionsMenu === msg._id && (
              <div className="reactions-menu absolute bottom-full right-0 mb-2 z-[70]">
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
    </div>
  );
};

export default MessageItem;