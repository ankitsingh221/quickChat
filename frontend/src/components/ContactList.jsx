import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import UserCard from "./UserCard";
import { Users } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center mt-12 px-4">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3 border border-white/10">
          <Users className="w-8 h-8 text-white/30" />
        </div>
        <p className="text-white/40 text-sm text-center">
          No contacts found
        </p>
        <p className="text-white/20 text-xs text-center mt-1">
          Try searching for a different name
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 px-1">
      {/* Header with contact count */}
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-[10px] text-cyan-400/60 uppercase tracking-wider font-semibold">
          All Contacts
        </span>
        <span className="text-[10px] text-white/30">
          {filteredContacts.length} contacts
        </span>
      </div>
      
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