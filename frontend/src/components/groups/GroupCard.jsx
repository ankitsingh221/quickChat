import dayjs from "dayjs";
import { useAuthStore } from "../../store/useAuthStore";

function GroupCard({ group, onClick, isActive }) {
  const { authUser } = useAuthStore();
  
  // 1. DATA FIX: Use groupName instead of name to match your backend/DB
  const gName = group.groupName || "Unnamed Group";
  const lastMessage = group.lastMessage;
  
  const senderId = lastMessage?.senderId?._id || lastMessage?.senderId;
  const isSentByMe = senderId === authUser?._id;
  
  const getSenderName = () => {
    if (isSentByMe) return "You";
    if (lastMessage?.senderId?.fullName) return lastMessage.senderId.fullName.split(' ')[0];
    if (lastMessage?.senderName) return lastMessage.senderName.split(' ')[0];
    return "Member";
  };

  const senderName = getSenderName();
  
  const messageText = lastMessage?.text
    ? lastMessage.text
    : lastMessage?.image
    ? "📷 Photo"
    : null;

  const displayMessage = lastMessage 
    ? `${senderName}: ${messageText || "sent a message"}`
    : "No messages yet";

  const formatMessageTime = (date) => {
    if (!date) return "";
    const now = dayjs();
    const messageDate = dayjs(date);
    const diffDays = now.diff(messageDate, "day");

    if (diffDays === 0) return messageDate.format("HH:mm"); 
    if (diffDays === 1) return "Yesterday";
    return messageDate.format("DD/MM/YY");
  };

  const time = formatMessageTime(lastMessage?.createdAt);

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer
        transition-all duration-300 relative group
        ${isActive
          ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/10 ring-1 ring-cyan-400/40"
          : "hover:bg-slate-800/40"}
        bg-slate-800/20 backdrop-blur mb-1
      `}
    >
      {/* Group Avatar */}
      <div className="relative">
        <div className={`size-14 rounded-2xl overflow-hidden border transition-colors
          ${isActive ? "border-cyan-500/50" : "border-slate-700"} 
          bg-slate-800 flex items-center justify-center`}
        >
          {group.groupPic ? (
            <img src={group.groupPic} alt={gName} className="size-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-cyan-500">
              {/* Using corrected variable gName */}
              {gName.charAt(0)}
            </span>
          )}
        </div>
        
        {/* Member Count Badge */}
        <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded-md flex items-center gap-1">
          <span className="text-[10px] font-bold text-slate-300">{group.members?.length || 0}</span>
        </div>
      </div>

      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-center mb-0.5">
          <h4 className={`truncate text-[15px] font-semibold transition-colors
            ${isActive ? "text-cyan-400" : "text-white"}`}>
            {/* Using corrected variable gName */}
            {gName}
          </h4>
          
          {time && (
            <span className="text-[10px] text-slate-500">
              {time}
            </span>
          )}
        </div>

        <div className="text-sm truncate">
          <span className={`truncate ${isActive ? "text-slate-300" : "text-slate-400"}`}>
            {displayMessage}
          </span>
        </div>
      </div>
    </div>
  );
}

export default GroupCard;