import dayjs from "dayjs";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users } from "lucide-react";

function UserCard({ user, isOnline, onClick, isActive, isTyping }) {
  const { unreadCounts, groupUnreadCounts, groupTypingUsers } = useChatStore();
  const { authUser } = useAuthStore();

  const isGroup = !!user.groupName;

  // unread logic
  const unreadCount = isGroup
    ? (groupUnreadCounts[user._id] ?? 0)
    : (unreadCounts[user._id] ?? user.unreadCount ?? 0);

  const lastMessage = user.lastMessage;
  const displayName = user.groupName || user.fullName;
  const displayPic = isGroup ? user.groupPic : user.profilePic;

  const senderId = lastMessage?.senderId?._id || lastMessage?.senderId;
  const isSentByMe = senderId?.toString() === authUser?._id?.toString();

  // TYPER NAME (For Groups)
  const getTyperText = () => {
    if (!isGroup) return "typing";
    const typers = groupTypingUsers[user._id] || [];
    const otherTypers = typers.filter((t) => t.userId !== authUser?._id);
    if (otherTypers.length > 1) return "Multiple people typing";
    if (otherTypers.length === 1)
      return `${otherTypers[0].userName?.split(" ")[0] || "Someone"} is typing`;
    return "typing";
  };

  const getMessagePreview = () => {
    if (!lastMessage) return "No messages yet";
    if (lastMessage.isDeleted) return "Message was deleted";

    let text = "";
    if (lastMessage.text) text = lastMessage.text;
    else if (lastMessage.image) text = "📷 Photo";
    else if (lastMessage.video) text = "🎥 Video";
    else if (lastMessage.file) text = "📎 File";
    else if (lastMessage.gif) text = "🎬 GIF";
    else text = "No messages yet";

    if (isSentByMe) return `You: ${text}`;

    if (isGroup && lastMessage.senderId?.fullName) {
      return `${lastMessage.senderId.fullName.split(" ")[0]}: ${text}`;
    }
    return text;
  };

  const displayMessage = getMessagePreview();

  const formatMessageTime = (date) => {
    if (!date) return "";
    const now = dayjs();
    const messageDate = dayjs(date);
    const diffDays = now.diff(messageDate, "day");
    if (diffDays === 0) return messageDate.format("HH:mm");
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return messageDate.format("ddd");
    return messageDate.format("DD/MM/YY");
  };

  const time = formatMessageTime(lastMessage?.createdAt);

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
        transition-all duration-200 relative
        ${
          isActive
            ? "bg-white/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]"
            : "hover:bg-white/5 border border-transparent"
        }
        bg-transparent backdrop-blur-sm
      `}
    >
      {/* AVATAR SECTION */}
      <div className={`relative ${!isGroup && isOnline ? "online" : ""}`}>
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
          {displayPic ? (
            <img
              src={displayPic}
              alt={displayName}
              className="object-cover w-full h-full"
            />
          ) : isGroup ? (
            <div className="bg-white/10 w-full h-full flex items-center justify-center">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
          ) : (
            <img
              src="/avatar.png"
              alt="avatar"
              className="object-cover w-full h-full"
            />
          )}
        </div>
        {/* Online indicator */}
        {!isGroup && isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full ring-1 ring-black shadow-[0_0_5px_#00ffff]"></div>
        )}
      </div>

      {/* CONTENT SECTION */}
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-center mb-0.5">
          <h4
            className={`truncate text-sm ${unreadCount > 0 ? "text-cyan-400 font-bold" : "text-white/90 font-medium"}`}
          >
            {displayName}
          </h4>

          <div className="flex flex-col items-end gap-0.5">
            {time && (
              <span
                className={`text-[9px] ${unreadCount > 0 ? "text-cyan-400 font-medium" : "text-white/40"}`}
              >
                {time}
              </span>
            )}

            {unreadCount > 0 && (
              <div className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-black text-[9px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-[0_0_8px_rgba(0,255,255,0.5)]">
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            )}
          </div>
        </div>

        {/* TYPING / MESSAGE PREVIEW */}
        <div className="text-xs truncate h-4">
          {isTyping ? (
            <span className="text-cyan-400 font-medium flex items-center gap-1">
              {getTyperText()}
              <span className="flex gap-0.5">
                <span
                  className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
                <span
                  className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce"
                  style={{ animationDelay: "600ms" }}
                ></span>
              </span>
            </span>
          ) : (
            <span
              className={`truncate text-[11px] ${unreadCount > 0 ? "text-white/80 font-medium" : "text-white/40"}`}
            >
              {displayMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserCard;
