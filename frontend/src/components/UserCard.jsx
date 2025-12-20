import dayjs from "dayjs";

function UserCard({ user, isOnline, onClick, isActive }) {
  const lastMessage = user.lastMessage;

  // Decide what text to show for the last message
  const messageText = lastMessage?.text
    ? lastMessage.text
    : lastMessage?.image
    ? "📷 Photo"
    : "";

 
  const formatMessageTime = (date) => {
    if (!date) return "";

    const now = dayjs();
    const messageDate = dayjs(date);

    const diffDays = now.diff(messageDate, "day");

    if (diffDays === 0) {
     
      return messageDate.format("HH:mm"); 
    } else if (diffDays === 1) {
     
      return "Yesterday";
    } else if (diffDays < 7) {
      
      return messageDate.format("ddd");
    } else {
      
      return messageDate.format("DD/MM/YYYY");
    }
  };

  const time = formatMessageTime(lastMessage?.createdAt);

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer
        transition-all duration-300
        ${isActive
          ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/10 ring-1 ring-cyan-400/40"
          : "hover:bg-base-200/60"}
        bg-base-200/40 backdrop-blur
      `}
    >
      {/* AVATAR (DaisyUI handles indicator) */}
      <div className={`avatar ${isOnline ? "online" : "offline"}`}>
        <div className="size-14 rounded-full">
          <img src={user.profilePic || "/avatar.png"} alt={user.fullName} />
        </div>
      </div>

      {/* TEXT */}
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-center">
          <h4 className="text-base-content font-semibold truncate text-[15px]">
            {user.fullName}
          </h4>
          {time && (
            <span className="text-[10px] text-base-content/50 ml-2">
              {time}
            </span>
          )}
        </div>
        <p className="text-xs text-base-content/60 truncate">
          {messageText || (isOnline ? "Online now" : "Offline")}
        </p>
      </div>
    </div>
  );
}

export default UserCard;
