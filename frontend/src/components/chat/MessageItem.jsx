import React from "react";
import MessageBubble from "./MessageBubble";
import MessageReactions from "./MessageReactions";
import MessageTimestamp from "./MessageTimestamp";
import MessageActionMenu from "./MessageActionMenu";
import ReactionPickerMenu from "./ReactionPickerMenu";

const MessageItem = ({ msg, isMe, authUser, selectedUser, messageActions, setSelectedImg }) => {
  const {
    canModify,
    activeMsgId,
    editingId,
    editText,
    showReactionsMenu,
    menuPosition,
    actionMenuRefs,
    reactionsMenuRefs,
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

  return (
    <div
      className={`chat ${isMe ? "chat-end" : "chat-start"} w-full flex flex-col ${
        isMe ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`relative flex flex-col ${
          isMe ? "items-end" : "items-start"
        } max-w-[85%] md:max-w-[75%] group`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Three Dot Menu Button - Visible only on Hover */}
        {!msg.isDeleted && (
          <button
            className={`absolute top-2 three-dot-button p-1 rounded-full hover:bg-slate-700/50 transition-all duration-200 z-10 
              opacity-0 group-hover:opacity-100 ${isMe ? "-left-8" : "-right-8"}`}
            onClick={(e) => handleThreeDotClick(msg._id, e, isMe)}
          >
            <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        )}

        {/* Message Bubble */}
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

        {/* Reactions List */}
        {msgReactions.length > 0 && (
          <MessageReactions
            msgReactions={msgReactions}
            isMe={isMe}
            authUser={authUser}
            handleExistingReactionClick={handleExistingReactionClick}
            msgId={msg._id}
          />
        )}

        {/* Timestamp & Read Status */}
        <MessageTimestamp msg={msg} isMe={isMe} />

        {/* Action Menu */}
        {activeMsgId === msg._id && menuPosition[msg._id] && (
          <MessageActionMenu
            msg={msg}
            isMe={isMe}
            canEdit={canEdit}
            menuPosition={menuPosition[msg._id]}
            actionMenuRef={(el) => (actionMenuRefs.current[msg._id] = el)}
            handleReply={handleReply}
            startEdit={startEdit}
            handleDelete={handleDelete}
            handleReactionButtonClick={handleReactionButtonClick}
          />
        )}

        {/* Emoji Picker */}
        {showReactionsMenu === msg._id && menuPosition[msg._id] && (
          <ReactionPickerMenu
            msgId={msg._id}
            menuPosition={menuPosition[msg._id]}
            reactionsMenuRef={(el) => (reactionsMenuRefs.current[msg._id] = el)}
            handleReactionClick={handleReactionClick}
          />
        )}
      </div>
    </div>
  );
};

export default MessageItem;