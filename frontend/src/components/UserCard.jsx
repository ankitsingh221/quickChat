import dayjs from "dayjs";
import { useChatStore } from "../store/useChatStore";

function UserCard({ user, isOnline, onClick, isActive, isTyping }) {
  const { unreadCounts } = useChatStore();
  
  //  unreadCounts state, Fallback: user.unreadCount from backend
  const unreadCount = unreadCounts[user._id] ?? user.unreadCount ?? 0;
  
  const lastMessage = user.lastMessage;

  const messageText = lastMessage?.text
    ? lastMessage.text
    : lastMessage?.image
    ? "📷 Photo"
    : "No messages yet";

  const formatMessageTime = (date) => {
    if (!date) return "";
    const now = dayjs();
    const messageDate = dayjs(date);
    const diffDays = now.diff(messageDate, "day");

    if (diffDays === 0) return messageDate.format("HH:mm"); 
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return messageDate.format("ddd");
    return messageDate.format("DD/MM/YYYY");
  };

  const time = formatMessageTime(lastMessage?.createdAt);

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer
        transition-all duration-300 relative
        ${isActive
          ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/10 ring-1 ring-cyan-400/40"
          : "hover:bg-base-200/60"}
        bg-base-200/40 backdrop-blur
      `}
    >
      <div className={`avatar ${isOnline ? "online" : "offline"}`}>
        <div className="size-14 rounded-full">
          <img src={user.profilePic || "/avatar.png"} alt={user.fullName} />
        </div>
      </div>

      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-center mb-0.5">
          <h4 className={`truncate text-[15px] ${unreadCount > 0 ? "text-white font-bold" : "text-base-content font-semibold"}`}>
            {user.fullName}
          </h4>
          
          <div className="flex flex-col items-end gap-1">
            {time && (
              <span className={`text-[10px] ${unreadCount > 0 ? "text-cyan-400 font-bold" : "text-base-content/50"}`}>
                {time}
              </span>
            )}
            
            {unreadCount > 0 && (
              <div className="bg-cyan-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
        </div>

        <div className="text-sm truncate">
          {isTyping ? (
            <span className="text-green-500 font-medium animate-pulse flex items-center gap-1">
              typing...
            </span>
          ) : (
            <span className={`truncate ${unreadCount > 0 ? "text-slate-100 font-medium" : "text-slate-400"}`}>
              {messageText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserCard;