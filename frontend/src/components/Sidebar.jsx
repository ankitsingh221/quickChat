import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ProfileHeader from "./ProfileHeader";
import ActiveTabSwitch from "./ActiveTabSwitch";
import ChatList from "./ChatsList";
import ContactList from "./ContactList";
import GroupList from "./groups/GroupList";
import CreateGroupModal from "./groups/CreateGroupModal"; // Adjusted path

function Sidebar() {
  const {
    activeTab,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToGroupEvents,
    unsubscribeFromGroupEvents,
  } = useChatStore();
  
  const { socket } = useAuthStore();

  // THE KEY: Centralized Modal State
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

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
    <aside className="h-full w-full lg:w-80 border-r border-slate-800 flex flex-col transition-all duration-300 bg-slate-900/50 backdrop-blur-xl relative">
      
      {/* RENDER MODAL AT SIDEBAR LEVEL */}
      <CreateGroupModal 
        isOpen={isCreateGroupOpen} 
        onClose={() => setIsCreateGroupOpen(false)} 
      />

      <ProfileHeader />

      {/* PASS THE TRIGGER FUNCTION DOWN */}
      <ActiveTabSwitch onOpenCreateGroup={() => setIsCreateGroupOpen(true)} />

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
        <div className="mt-2">
          {activeTab === "chats" && <ChatList />}
          {activeTab === "groups" && <GroupList />}
          {activeTab === "contacts" && <ContactList />}
        </div>
      </div>

      <div className="p-3 border-t border-slate-800/50 hidden lg:block">
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          End-to-End Encrypted
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;