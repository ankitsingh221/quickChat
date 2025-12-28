import { useState } from "react";

import { useAuthStore } from "../../store/useAuthStore";
import MessageTimestamp from "../chat/MessageTimestamp";
import MessageReactions from "../chat/MessageReactions";
import MessageActionMenu from "../chat/MessageActionMenu";
import ReactionPickerMenu from "../chat/ReactionPickerMenu";
import ImageLightbox from "../chat/ImageLightbox";
import { Check, CheckCheck } from "lucide-react";

function GroupMessageItem({ message, isOwnMessage, showAvatar }) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const { authUser } = useAuthStore();

  const senderName = message.senderId?.fullName || "Unknown";
  const senderAvatar = message.senderId?.profilePic || "/avatar.png";

  // Check if message is seen by anyone
  const isSeenByOthers = message.seenBy?.some(
    (userId) => userId !== authUser._id
  );

  return (
    <div
      className={`flex items-end gap-2 ${
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      } group`}
    >
      {/* Avatar (for other users' messages) */}
      {!isOwnMessage && (
        <div className="flex-shrink-0 w-8">
          {showAvatar ? (
            <div className="avatar">
              <div className="size-8 rounded-full">
                <img src={senderAvatar} alt={senderName} />
              </div>
            </div>
          ) : (
            <div className="w-8" /> 
          )}
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`flex flex-col max-w-[70%] ${
          isOwnMessage ? "items-end" : "items-start"
        }`}
      >
        {/* Sender Name (only for others' messages and if showing avatar) */}
        {!isOwnMessage && showAvatar && (
          <span className="text-xs text-base-content/60 mb-1 ml-3">
            {senderName}
          </span>
        )}

        {/* Reply Preview (if replying to a message) */}
        {message.replyTo && (
          <div
            className={`text-xs p-2 rounded-lg mb-1 border-l-4 ${
              isOwnMessage
                ? "bg-primary/10 border-primary"
                : "bg-base-200 border-base-300"
            }`}
          >
            <p className="font-semibold text-base-content/70">
              {message.replyTo.senderId === authUser._id
                ? "You"
                : "Group Member"}
            </p>
            <p className="text-base-content/60 truncate">
              {message.replyTo.text || "📷 Photo"}
            </p>
          </div>
        )}

        <div
          className={`relative px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? "bg-primary text-primary-content"
              : "bg-base-200 text-base-content"
          } ${message.isDeleted ? "italic opacity-60" : ""}`}
        >
          {/* Message Content */}
          {message.isDeleted ? (
            <p className="text-sm">This message was deleted</p>
          ) : (
            <>
              {/* Image */}
              {message.image && (
                <img
                  src={message.image}
                  alt="attachment"
                  className="max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition"
                  onClick={() => setShowImageLightbox(true)}
                />
              )}

              {/* Text */}
              {message.text && (
                <p className="text-sm break-words whitespace-pre-wrap">
                  {message.text}
                </p>
              )}

              {/* Forwarded Label */}
              {message.isForwarded && (
                <p className="text-xs opacity-70 mt-1">Forwarded</p>
              )}

              {/* Edited Label */}
              {message.isEdited && (
                <p className="text-xs opacity-70 mt-1">Edited</p>
              )}
            </>
          )}

          {/* Timestamp & Status */}
          <div className="flex items-center gap-1 mt-1">
            <MessageTimestamp timestamp={message.createdAt} />

            {/* Delivery Status (for own messages) */}
            {isOwnMessage && !message.isDeleted && (
              <span className="text-xs opacity-70">
                {isSeenByOthers ? (
                  <CheckCheck size={14} className="text-blue-400" />
                ) : (
                  <Check size={14} />
                )}
              </span>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <MessageReactions
              reactions={message.reactions}
              messageId={message._id}
            />
          )}

          {/* Action Menu (appears on hover) */}
          {!message.isDeleted && (
            <div className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <MessageActionMenu
                message={message}
                isOwnMessage={isOwnMessage}
                onReact={() => setShowReactionPicker(!showReactionPicker)}
              />
            </div>
          )}
        </div>

        {/* Reaction Picker */}
        {showReactionPicker && (
          <ReactionPickerMenu
            messageId={message._id}
            onClose={() => setShowReactionPicker(false)}
          />
        )}
      </div>

      {/* Image Lightbox */}
      {showImageLightbox && message.image && (
        <ImageLightBox
          imageUrl={message.image}
          onClose={() => setShowImageLightbox(false)}
        />
      )}
    </div>
  );
}

export default GroupMessageItem;