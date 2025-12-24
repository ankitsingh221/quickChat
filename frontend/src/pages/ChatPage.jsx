import { useState } from "react"; // Added useState
import { useChatStore } from "../store/useChatStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import GroupList from "../components/groups/GroupList"; // Added GroupList
import CreateGroupModal from "../components/groups/CreateGroupModal"; // Added Modal
import ChatContainer from "../components/chat/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser, selectedGroup } = useChatStore();
  
  // 1. MODAL STATE AT TOP LEVEL
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  return (
    <div className="relative w-full max-w-6xl h-[calc(100vh-4rem)] mx-auto px-2 md:px-0">
      
      {/* 2. RENDER MODAL HERE (Outside the flex layout to avoid clipping) */}
      <CreateGroupModal 
        isOpen={isCreateGroupOpen} 
        onClose={() => setIsCreateGroupOpen(false)} 
      />

      <BorderAnimatedContainer>
        {/* LEFT SIDEBAR */}
        <div
          className={`
            w-full md:w-80
            h-full
            bg-slate-800/50 backdrop-blur-sm
            flex flex-col
            ${(selectedUser || selectedGroup) ? "hidden md:flex" : "flex"}
          `}
        >
          <ProfileHeader />
          
          {/* 3. PASS THE TRIGGER TO ACTIVE TAB SWITCH */}
          <ActiveTabSwitch onOpenCreateGroup={() => setIsCreateGroupOpen(true)} />

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {activeTab === "chats" && <ChatsList />}
            {activeTab === "contacts" && <ContactList />}
            {activeTab === "groups" && <GroupList />}
          </div>
        </div>

        {/* RIGHT CHAT AREA */}
        <div
          className={`
            flex-1 h-full
            flex flex-col
            bg-slate-900/50 backdrop-blur-sm
            ${(selectedUser || selectedGroup) ? "flex" : "hidden md:flex"}
          `}
        >
          {/* Show ChatContainer if either a user OR a group is selected */}
          {(selectedUser || selectedGroup) ? (
            <ChatContainer />
          ) : (
            <NoConversationPlaceholder />
          )}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}

export default ChatPage;