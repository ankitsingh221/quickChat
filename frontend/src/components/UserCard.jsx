import dayjs from "dayjs";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users } from "lucide-react";

function UserCard({ user, isOnline, onClick, isActive, isTyping }) {
  const { unreadCounts, groupUnreadCounts, groupTypingUsers } = useChatStore();
  const { authUser } = useAuthStore();
  
  const isGroup = !!user.groupName;
  
  // unread logic (Check correct slice based on chat type)
  const unreadCount = isGroup 
    ? (groupUnreadCounts[user._id] ?? 0) 
    : (unreadCounts[user._id] ?? user.unreadCount ?? 0);

  const lastMessage = user.lastMessage;
  const displayName = user.groupName || user.fullName;
  const displayPic = isGroup ? user.groupPic : user.profilePic;

  const senderId = lastMessage?.senderId?._id || lastMessage?.senderId;
  const isSentByMe = senderId === authUser?._id;

  // 2. TYPER NAME (For Groups)
  const getTyperText = () => {
    if (!isGroup) return "typing";
    const typers = groupTypingUsers[user._id] || [];
    const otherTypers = typers.filter(t => t.userId !== authUser?._id);
    if (otherTypers.length > 1) return "Multiple people typing";
    if (otherTypers.length === 1) return `${otherTypers[0].userName.split(" ")[0]} is typing`;
    return "typing";
  };

  const getMessagePreview = () => {
    if (!lastMessage) return "No messages yet";
    if (lastMessage.isDeleted) return "Message was deleted";

    let text = lastMessage.text || (lastMessage.image ? "📷 Photo" : "");
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
        flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer
        transition-all duration-300 relative mx-2 mb-1
        ${isActive
          ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 ring-1 ring-cyan-400/30 shadow-lg shadow-cyan-500/5"
          : "hover:bg-slate-800/40"}
        bg-slate-900/20 backdrop-blur
      `}
    >
      {/* AVATAR SECTION */}
      <div className={`avatar ${!isGroup && isOnline ? "online" : ""}`}>
        <div className="size-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700/50">
          {displayPic ? (
            <img src={displayPic} alt={displayName} className="object-cover w-full h-full" />
          ) : isGroup ? (
            <div className="bg-cyan-500/10 w-full h-full flex items-center justify-center">
                <Users className="size-6 text-cyan-500" />
            </div>
          ) : (
            <img src="/avatar.png" alt="avatar" />
          )}
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-center mb-0.5">
          <h4 className={`truncate text-[15px] ${unreadCount > 0 ? "text-white font-bold" : "text-slate-200 font-semibold"}`}>
            {displayName}
          </h4>
          
          <div className="flex flex-col items-end gap-1">
            {time && (
              <span className={`text-[10px] ${unreadCount > 0 ? "text-cyan-400 font-bold" : "text-slate-500"}`}>
                {time}
              </span>
            )}
            
            {unreadCount > 0 && (
              <div className="bg-cyan-500 text-slate-900 text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center animate-in zoom-in">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
        </div>

        {/* TYPING / MESSAGE PREVIEW */}
        <div className="text-sm truncate h-5">
          {isTyping ? (
            <span className="text-cyan-400 font-medium flex items-center gap-1 italic text-[11px]">
              {getTyperText()}
              <span className="flex gap-0.5 mt-1">
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce"></span>
              </span>
            </span>
          ) : (
            <span className={`truncate text-xs ${unreadCount > 0 ? "text-slate-300 font-medium" : "text-slate-500"}`}>
              {displayMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserCard;