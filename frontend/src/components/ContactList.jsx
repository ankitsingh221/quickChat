import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import UserCard from "./UserCard";

function ContactList() {
  const {
    getAllContacts,
    allContacts,
    setSelectedUser,
    selectedUser,
    isUsersLoading,
    searchQuery,
    chats,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  // Merge contacts with chats to get lastMessage
  const mergedContacts = allContacts.map(contact => {
    const chat = chats.find(c => c._id === contact._id);
    return chat 
      ? { ...contact, lastMessage: chat.lastMessage }
      : contact;
  });

  const filteredContacts = mergedContacts
    .filter((contact) =>
      contact.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) =>
      a.fullName.localeCompare(b.fullName, undefined, {
        sensitivity: "base",
      })
    );

  if (filteredContacts.length === 0) {
    return (
      <p className="text-center text-base-content/50 mt-6">
        No contacts found
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {filteredContacts.map((contact) => (
        <UserCard
          key={contact._id}
          user={contact}
          isOnline={onlineUsers.includes(contact._id)}
          isActive={selectedUser?._id === contact._id}
          onClick={() => setSelectedUser(contact)}
        />
      ))}
    </div>
  );
}

export default ContactList;