import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useSocketSetup } from "../hooks/useSocketSetup";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/chat/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import CreateGroupModal from "../components/groups/CreateGroupModal";

function ChatPage() {
  const { selectedUser, selectedGroup } = useChatStore();
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  useSocketSetup();

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-transparent flex">
      
      {/* LEFT SIDEBAR */}
      <div className={`
        w-full md:w-80
        h-full
        border-r border-white/10
        flex flex-col
        bg-transparent
        ${(selectedUser || selectedGroup) ? "hidden md:flex" : "flex"}
      `}>
        <Sidebar onOpenCreateGroup={() => setIsCreateGroupOpen(true)} />
      </div>

      {/* RIGHT CHAT AREA */}
      <div className={`
        flex-1 h-full
        flex flex-col
        bg-transparent backdrop-blur-sm
        ${(selectedUser || selectedGroup) ? "flex" : "hidden md:flex"}
      `}>
        {(selectedUser || selectedGroup) ? (
          <ChatContainer />
        ) : (
          <NoConversationPlaceholder />
        )}
      </div>

      {/* CREATE GROUP MODAL - At root level, outside sidebar */}
      <CreateGroupModal 
        isOpen={isCreateGroupOpen} 
        onClose={() => setIsCreateGroupOpen(false)} 
      />
    </div>
  );
}

export default ChatPage;