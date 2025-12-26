import dayjs from "dayjs";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";

function GroupCard({ group, onClick, isActive }) {
  const { authUser } = useAuthStore();
  const { groupUnreadCounts } = useChatStore(); 
  
  const gName = group.groupName || "Unnamed Group";
  const lastMessage = group.lastMessage;

  // Prioritize real-time unread count from store
  const unreadCount = groupUnreadCounts[group._id] !== undefined 
    ? groupUnreadCounts[group._id] 
    : (group.unreadCount || 0);
  
  const senderId = lastMessage?.senderId?._id || lastMessage?.senderId;
  const isSentByMe = senderId === authUser?._id;
  
  const senderName = isSentByMe 
    ? "You" 
    : (lastMessage?.senderId?.fullName?.split(' ')[0] || lastMessage?.senderName?.split(' ')[0] || "Member");

  const displayMessage = lastMessage 
    ? `${senderName}: ${lastMessage.text || (lastMessage.image ? "📷 Photo" : "sent a message")}`
    : "No messages yet";

  const time = lastMessage?.createdAt 
    ? dayjs(lastMessage.createdAt).format(
        dayjs().isSame(dayjs(lastMessage.createdAt), 'day') ? "HH:mm" : "DD/MM/YY"
      ) 
    : "";

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer
        transition-all duration-300 relative
        ${isActive ? "bg-slate-700/40" : "hover:bg-slate-800/40"}
        mb-1
      `}
    >
      <div className="relative">
        <div className={`size-14 rounded-2xl overflow-hidden border transition-colors
          ${isActive ? "border-[#5bc0de]" : "border-slate-700"} 
          bg-slate-800 flex items-center justify-center`}
        >
          {group.groupPic ? (
            <img src={group.groupPic} alt={gName} className="size-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-[#5bc0de]">
              {gName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start">
          <h4 className={`truncate text-[15px] font-semibold mb-1 ${isActive ? "text-white" : "text-slate-200"}`}>
            {gName}
          </h4>
          
          {time && (
            <span className={`text-[12px] font-bold ${unreadCount > 0 ? "text-[#5bc0de]" : "text-slate-500"}`}>
              {time}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center gap-2">
          <p className={`text-sm truncate flex-1 ${unreadCount > 0 ? "text-slate-200 font-medium" : "text-slate-400"}`}>
            {displayMessage}
          </p>

          {unreadCount > 0 && (
            <div className="size-6 bg-[#5bc0de] text-[#0f172a] text-[12px] font-black rounded-full flex items-center justify-center shadow-lg transform translate-y-1">
              {unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupCard;