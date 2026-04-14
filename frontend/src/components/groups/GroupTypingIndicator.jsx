import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore"; 

function GroupTypingIndicator({ groupId }) {
  const { groupTypingUsers } = useChatStore();
  const { authUser } = useAuthStore(); 
  
  const typingUsers = groupTypingUsers[groupId] || [];
  
  // Filter out current user
  const otherTypingUsers = typingUsers.filter(u => u.userId !== authUser?._id);

  if (otherTypingUsers.length === 0) return null; 

  const getTypingText = () => {
    if (otherTypingUsers.length === 1) {
      return `${otherTypingUsers[0].userName} is typing`;
    } else if (otherTypingUsers.length === 2) {
      return `${otherTypingUsers[0].userName} and ${otherTypingUsers[1].userName} are typing`;
    } else {
      return `${otherTypingUsers[0].userName} and ${otherTypingUsers.length - 1} others are typing`;
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm text-cyan-400/80 px-4 py-2">
      <span>{getTypingText()}</span>
      <div className="flex gap-1">
        <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  );
}

export default GroupTypingIndicator;