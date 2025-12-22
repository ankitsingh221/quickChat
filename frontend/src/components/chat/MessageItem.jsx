import React, { useState } from "react";
import MessageBubble from "./MessageBubble";
import MessageReactions from "./MessageReactions";
import MessageTimestamp from "./MessageTimestamp";
import MessageActionMenu from "./MessageActionMenu";
import ReactionPickerMenu from "./ReactionPickerMenu";
import { MoreVertical } from "lucide-react";

const MessageItem = ({
  msg,
  isMe,
  authUser,
  selectedUser,
  messageActions,
  setSelectedImg,
}) => {
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

  return (
    <div
      className={`w-full flex flex-col ${
        isMe ? "items-end" : "items-start"
      } mb-4 px-2 md:px-4`}
    >
      <div
        className={`flex items-start gap-2 max-w-[85%] md:max-w-[75%] group ${
          isMe ? "flex-row-reverse" : "flex-row"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bubble + reactions + Timestamp container */}
        <div
          className={`flex flex-col ${
            isMe ? "items-end" : "items-start"
          }`}
        >
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

        {/* Action buttons (Three dots and Menus) */}
        {!msg.isDeleted && (
          <div className="relative self-center z-[60]">
            {/* Lucide Three-dot Icon Button */}
            <button
              className={`p-2 rounded-full transition-all duration-200 
                ${activeMsgId === msg._id ? "bg-base-300 opacity-100" : "opacity-0 group-hover:opacity-100 hover:bg-base-200"}
                text-base-content/70 hover:text-base-content`}
              onClick={(e) => handleThreeDotClick(msg._id, e)}
            >
              <MoreVertical size={18} />
            </button>

            {/* Action menu - positioned to avoid breaking UI */}
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
                  />
              </div>
            )}

            {/* Reaction picker - also positioned upwards */}
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