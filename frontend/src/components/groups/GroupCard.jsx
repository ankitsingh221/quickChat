import dayjs from "dayjs";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";

function GroupCard({ group, onClick, isActive }) {
  const { authUser } = useAuthStore();
  const { groupUnreadCounts } = useChatStore();
  
  // return for missing group
  if (!group) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
        <div className="text-white/40 text-sm">Invalid group data</div>
      </div>
    );
  }
  

  const gName = group?.groupName || "Unnamed Group";
  const lastMessage = group?.lastMessage; 
  
  const unreadCount = groupUnreadCounts?.[group._id] !== undefined 
    ? groupUnreadCounts[group._id] 
    : (group?.unreadCount || 0);
  
  const senderId = lastMessage?.senderId?._id || lastMessage?.senderId;
  const isSentByMe = senderId === authUser?._id;
  
  const senderName = isSentByMe 
    ? "You" 
    : (lastMessage?.senderId?.fullName?.split(' ')[0] || 
       lastMessage?.senderName?.split(' ')[0] || 
       "Member");

  const displayMessage = lastMessage 
    ? `${senderName}: ${lastMessage?.text || (lastMessage?.image ? "📷 Photo" : "sent a message")}`
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
        flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
        transition-all duration-200 relative
        ${isActive 
          ? "bg-white/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]" 
          : "hover:bg-white/5 border border-transparent"}
        bg-transparent backdrop-blur-sm
        mb-1
      `}
    >
      <div className="relative">
        <div className={`size-12 rounded-full overflow-hidden border transition-colors
          ${isActive ? "border-cyan-500" : "border-white/20"} 
          bg-white/5 flex items-center justify-center`}
        >
          {group?.groupPic ? (
            <img src={group.groupPic} alt={gName} className="size-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-cyan-400">
              {gName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start">
          <h4 className={`truncate text-sm font-medium mb-0.5 ${isActive ? "text-cyan-400" : "text-white/80"}`}>
            {gName}
          </h4>
          
          {time && (
            <span className={`text-[10px] font-medium ${unreadCount > 0 ? "text-cyan-400" : "text-white/30"}`}>
              {time}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center gap-2">
          <p className={`text-xs truncate flex-1 ${unreadCount > 0 ? "text-white/70 font-medium" : "text-white/40"}`}>
            {displayMessage}
          </p>

          {unreadCount > 0 && (
            <div className="min-w-[18px] h-[18px] bg-gradient-to-r from-cyan-500 to-cyan-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(0,255,255,0.5)]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupCard;