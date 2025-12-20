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
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  const filteredContacts = allContacts
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
