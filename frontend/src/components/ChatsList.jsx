import { useEffect, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import UserCard from "./UserCard";

function ChatList() {
  const chats = useChatStore((s) => s.chats);
  const isUserLoading = useChatStore((s) => s.isUserLoading);
  const searchQuery = useChatStore((s) => s.searchQuery);
  const getMyChatPartners = useChatStore((s) => s.getMyChatPartners);

  const selectedUser = useChatStore((s) => s.selectedUser);
  const selectedGroup = useChatStore((s) => s.selectedGroup);

  const setSelectedUser = useChatStore((s) => s.setSelectedUser);
  const setSelectedGroup = useChatStore((s) => s.setSelectedGroup);

  const typingUsers = useChatStore((s) => s.typingUsers);
  const groupTypingUsers = useChatStore((s) => s.groupTypingUsers);

  const { onlineUsers, authUser } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  //  Memoize filtered chats with proper dependencies
  const filteredChats = useMemo(() => {
    const chatArray = Array.isArray(chats) ? chats : [];

    return chatArray
      .filter((chat) => {
        const chatName = chat.fullName || chat.groupName || "";
        const matchesSearch = chatName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const hasMessages = !!chat.lastMessage;
        const isSelected =
          selectedGroup?._id === chat._id || selectedUser?._id === chat._id;

        return matchesSearch && (hasMessages || isSelected);
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
  }, [chats, searchQuery, selectedGroup?._id, selectedUser?._id]);

  //  Separate function to calculate typing status (not memoized so it updates reactively)
  const getTypingStatus = (chat) => {
    const stringId = chat._id.toString();
    const isGroup = !!chat.groupName;

    if (isGroup) {
      const groupTypers = groupTypingUsers[stringId] || [];
      // Filter out current user and check if anyone else is typing
      return groupTypers.some((u) => u.userId !== authUser?._id);
    } else {
      return !!typingUsers[stringId];
    }
  };

  if (isUserLoading) return <UsersLoadingSkeleton />;
  if (filteredChats.length === 0) return <NoChatsFound />;

  return (
    <div className="flex flex-col gap-1 overflow-y-auto max-h-full custom-scrollbar py-2">
      {filteredChats.map((chat) => {
        const isGroup = !!chat.groupName;

        //  Calculate typing status for each render (reactive to state changes)
        const isTyping = getTypingStatus(chat);

        const handleChatClick = () => {
          if (isGroup) {
            setSelectedGroup(chat);
          } else {
            setSelectedUser(chat);
          }
        };

        const isActive = isGroup
          ? selectedGroup?._id === chat._id
          : selectedUser?._id === chat._id;

        return (
          <UserCard
            key={chat._id}
            user={chat}
            isOnline={!isGroup && onlineUsers.includes(chat._id)}
            isActive={isActive}
            isTyping={isTyping}
            onClick={handleChatClick}
          />
        );
      })}
    </div>
  );
}

export default ChatList;
