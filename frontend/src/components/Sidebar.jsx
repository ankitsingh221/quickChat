import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ProfileHeader from "./ProfileHeader";
import ActiveTabSwitch from "./ActiveTabSwitch";
import ChatList from "./ChatsList";
import ContactList from "./ContactList";
import GroupList from "./groups/GroupList";
import { Lock } from "lucide-react";

function Sidebar({ onOpenCreateGroup }) { 
  const {
    activeTab,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToGroupEvents,
    unsubscribeFromGroupEvents,
  } = useChatStore();
  
  const { socket } = useAuthStore();

  useEffect(() => {
    if (socket) {
      subscribeToMessages();
      subscribeToGroupEvents();
    }
    return () => {
      unsubscribeFromMessages();
      unsubscribeFromGroupEvents();
    };
  }, [socket, subscribeToMessages, unsubscribeFromMessages, subscribeToGroupEvents, unsubscribeFromGroupEvents]);

  return (
    <aside className="h-full w-full lg:w-80 border-r border-white/10 flex flex-col bg-transparent">
      <ProfileHeader />

      <ActiveTabSwitch onOpenCreateGroup={onOpenCreateGroup} />  {/* Pass to child */}

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
        {activeTab === "chats" && <ChatList />}
        {activeTab === "groups" && <GroupList />}
        {activeTab === "contacts" && <ContactList />}
      </div>

    </aside>
  );
}

export default Sidebar;