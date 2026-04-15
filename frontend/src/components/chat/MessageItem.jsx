import React, { useState, useRef } from "react";
import MessageBubble from "./MessageBubble";
import MessageReactions from "./MessageReactions";
import MessageTimestamp from "./MessageTimestamp";
import MessageActionMenu from "./MessageActionMenu";
import ReactionPickerMenu from "./ReactionPickerMenu";
import { MoreVertical, CheckCircle2 } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import MessageInfoDrawer from "../groups/MessageInfoDrawer";
import AvatarModal from "../AvatarModal";

const MessageItem = ({
  msg,
  isMe,
  authUser,
  selectedUser,
  selectedGroup,
  messageActions,
  setSelectedImg,
}) => {
  const { isSelectionMode, selectedMessages, toggleMessageSelection } =
    useChatStore();
  const isSelected = selectedMessages.includes(msg._id);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Ref for the three-dot trigger button — passed to the portal menu for positioning
  const triggerButtonRef = useRef(null);

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

  const getSenderColor = (name = "") => {
    const colors = [
      "text-blue-400",
      "text-emerald-400",
      "text-amber-400",
      "text-rose-400",
      "text-violet-400",
      "text-cyan-400",
      "text-orange-400",
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

  const handleAvatarClick = () => {
    if (senderPic && senderPic !== "/avatar.png") {
      setShowAvatarModal(true);
    }
  };

  return (
    <>
      <div
        onClick={handleItemClick}
        className={`w-full flex transition-colors duration-200 ${
          isMe ? "justify-end" : "justify-start"
        } ${isSelectionMode ? "cursor-pointer" : ""} ${
          isSelected ? "bg-cyan-500/10" : ""
        } mb-2 md:mb-3 px-2 py-0.5 relative`}
      >
        <div
          className={`flex items-end gap-2 md:gap-3 max-w-[90%] md:max-w-[75%] group ${
            isMe ? "flex-row-reverse" : "flex-row"
          }`}
          onClick={(e) => !isSelectionMode && e.stopPropagation()}
        >
          {/* SELECTION CHECKBOX */}
          {isSelectionMode && (
            <div className="self-center flex-shrink-0 px-1 md:px-2">
              {isSelected ? (
                <CheckCircle2
                  size={20}
                  className="text-cyan-500 fill-cyan-500/20 animate-in zoom-in duration-200"
                />
              ) : (
                <div className="size-5 rounded-full border-2 border-white/30" />
              )}
            </div>
          )}

          {/* AVATAR */}
          {!isSelectionMode && (
            <div className="flex-shrink-0 self-end mb-3">
              <div
                className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/20 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                onClick={handleAvatarClick}
                title="Click to view profile picture"
              >
                <img
                  src={senderPic}
                  alt={senderName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/avatar.png";
                  }}
                />
              </div>
            </div>
          )}

          {/* BUBBLE CONTENT */}
          <div
            className={`flex flex-col ${
              isMe ? "items-end" : "items-start"
            } min-w-0 flex-1`}
          >
            {!isMe && isGroup && (
              <span
                className={`text-[10px] md:text-[11px] font-bold ml-1 md:ml-2 mb-0.5 uppercase tracking-wide ${getSenderColor(
                  senderName
                )}`}
              >
                {senderName}
              </span>
            )}

            <div className="relative w-full">
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
                onDelete={handleDelete}
                onReply={handleReply}
              />
            </div>

            {/* REACTIONS ROW */}
            {msgReactions.length > 0 && (
              <div className={`-mt-3 z-10 ${isMe ? "mr-1" : "ml-1"}`}>
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

          {/* ACTION BUTTON (THREE DOTS) */}
          {!msg.isDeleted && !isSelectionMode && (
            <div className="relative self-center flex-shrink-0 z-20">
              {/* The ref is attached here so the portal menu knows where to anchor */}
              <button
                ref={triggerButtonRef}
                className={`p-1.5 md:p-2 rounded-full transition-all duration-200 
                  ${
                    activeMsgId === msg._id
                      ? "bg-white/10 opacity-100"
                      : "opacity-0 group-hover:opacity-100 hover:bg-white/10"
                  } 
                  text-white/40 hover:text-white`}
                onClick={(e) => handleThreeDotClick(msg._id, e)}
              >
                <MoreVertical size={16} />
              </button>

              {/* ACTION MENU — now a portal, positioned via triggerRef */}
              {activeMsgId === msg._id && (
                <MessageActionMenu
                  msg={msg}
                  isMe={isMe}
                  canEdit={canEdit}
                  handleReply={handleReply}
                  startEdit={startEdit}
                  isGroup={isGroup}
                  handleDelete={(id, type) =>
                    handleDelete(id, type, msg.createdAt)
                  }
                  handleReactionButtonClick={handleReactionButtonClick}
                  enterSelectionMode={() => toggleMessageSelection(msg._id)}
                  onInfoClick={() => {
                    setShowInfoDrawer(true);
                    handleThreeDotClick(null);
                  }}
                  triggerRef={triggerButtonRef}
                />
              )}

              {/* REACTION PICKER  */}
              {showReactionsMenu === msg._id && (
                <div
                  className={`absolute bottom-full mb-2 z-[150] pointer-events-auto ${
                    isMe ? "right-0" : "left-0"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
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

        {/* GROUP MESSAGE INFO DRAWER */}
        {showInfoDrawer && (
          <MessageInfoDrawer
            msg={msg}
            onClose={() => setShowInfoDrawer(false)}
            isGroup={isGroup}
            selectedGroup={selectedGroup}
          />
        )}
      </div>

      {/* AVATAR MODAL */}
      {showAvatarModal && (
        <AvatarModal
          image={senderPic}
          name={senderName}
          onClose={() => setShowAvatarModal(false)}
        />
      )}
    </>
  );
};

export default MessageItem;