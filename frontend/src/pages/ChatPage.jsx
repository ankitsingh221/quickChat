import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import GroupList from "../components/groups/GroupList";
import CreateGroupModal from "../components/groups/CreateGroupModal";
import ChatContainer from "../components/chat/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser, selectedGroup } = useChatStore();
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  return (
    /* Changed: h-screen (100vh) and w-full without max-width constraints */
    <div className="fixed inset-0 w-screen h-screen bg-slate-950 overflow-hidden">
      
      <CreateGroupModal 
        isOpen={isCreateGroupOpen} 
        onClose={() => setIsCreateGroupOpen(false)} 
      />

      {/* Note: If BorderAnimatedContainer has internal padding/margins, 
         you might need to adjust its props to allow it to fill the screen.
      */}
      <BorderAnimatedContainer className="h-full w-full border-none rounded-none">
        
        {/* LEFT SIDEBAR */}
        <div
          className={`
            w-full md:w-96
            h-full
            border-r border-slate-700/50
            bg-slate-800/50 backdrop-blur-sm
            flex flex-col
            ${(selectedUser || selectedGroup) ? "hidden md:flex" : "flex"}
          `}
        >
          <ProfileHeader />
          
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