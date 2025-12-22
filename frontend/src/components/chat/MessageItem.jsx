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
      className={`w-full flex flex-col ${
        isMe ? "items-end" : "items-start"
      } mb-4 px-2 md:px-4`}
    >
      <div
        className={`relative flex items-start gap-2 max-w-[85%] md:max-w-[75%] group ${
          isMe ? "flex-row-reverse" : "flex-row"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Inner Container for Bubble and Reactions */}
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

          {/* Reactions - Placed immediately below bubble */}
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
          
          {/* Timestamp - Integrated below bubble/reactions */}
          <MessageTimestamp msg={msg} isMe={isMe} />
        </div>

        {/* Three Dot Menu Button - with required class for click-outside detection */}
        {!msg.isDeleted && (
          <button
            className={`three-dot-button p-1.5 rounded-full hover:bg-slate-700/40 transition-all duration-200 mt-1
              opacity-0 group-hover:opacity-100 flex-shrink-0 text-slate-500`}
            onClick={(e) => handleThreeDotClick(msg._id, e, isMe)}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        )}

        {/* Action Menu */}
        {activeMsgId === msg._id && menuPosition[msg._id] && (
          <MessageActionMenu
            msg={msg}
            isMe={isMe}
            canEdit={canEdit}
            menuPosition={menuPosition[msg._id]}
            actionMenuRef={(el) => {
              if (actionMenuRefs && actionMenuRefs.current) {
                actionMenuRefs.current[msg._id] = el;
              }
            }}
            handleReply={handleReply}
            startEdit={startEdit}
            handleDelete={handleDelete}
            handleReactionButtonClick={handleReactionButtonClick}
          />
        )}

        {/* Reaction Picker Menu */}
        {showReactionsMenu === msg._id && menuPosition[msg._id] && (
          <ReactionPickerMenu
            msgId={msg._id}
            menuPosition={menuPosition[msg._id]}
            reactionsMenuRef={(el) => {
              if (reactionsMenuRefs && reactionsMenuRefs.current) {
                reactionsMenuRefs.current[msg._id] = el;
              }
            }}
            handleReactionClick={handleReactionClick}
          />
        )}
      </div>
    </div>
  );
};

export default MessageItem;