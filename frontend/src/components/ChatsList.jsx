import { useEffect, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import UserCard from "./UserCard";

function ChatList() {
  const {
    getMyChatPartners,
    chats,
    isUserLoading,
    setSelectedUser,
    selectedUser,
    searchQuery,
    typingUsers,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  const filteredChats = useMemo(() => {
    const chatArray = Array.isArray(chats) ? chats : [];

    return chatArray
      .filter((chat) => {
        // Search filter
        const matchesSearch = chat.fullName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

        // hide if lastMessage is null or cleared
        const hasMessages = !!chat.lastMessage;

        return matchesSearch && hasMessages;
      })
      .sort((a, b) => {
        const aTime = a.lastMessage?.createdAt
          ? new Date(a.lastMessage.createdAt).getTime()
          : 0;
        const bTime = b.lastMessage?.createdAt
          ? new Date(b.lastMessage.createdAt).getTime()
          : 0;
        return bTime - aTime;
      });
  }, [chats, searchQuery]);

  if (isUserLoading) return <UsersLoadingSkeleton />;
  if (filteredChats.length === 0) return <NoChatsFound />;

  return (
    <div className="flex flex-col gap-1 overflow-y-auto max-h-full custom-scrollbar">
      {filteredChats.map((chat) => (
        <UserCard
          key={chat._id}
          user={chat}
          isOnline={onlineUsers.includes(chat._id)}
          isActive={selectedUser?._id === chat._id}
          isTyping={!!typingUsers?.[chat._id]}
          onClick={() => setSelectedUser(chat)}
        />
      ))}
    </div>
  );
}

export default ChatList;
