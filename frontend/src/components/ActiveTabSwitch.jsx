import React from "react";
import { useChatStore } from "../store/useChatStore";
import { Search, Plus, MessageCircle, Users, Group} from "lucide-react";

function ActiveTabSwitch({ onOpenCreateGroup }) {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery } =
    useChatStore();

  return (
   <div className="p-3 space-y-3">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-transparent rounded-xl p-1 border border-white/10">
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-sm ${
            activeTab === "chats"
              ? "bg-white/10 text-cyan-400"
              : "text-white/50 hover:text-white/80 hover:bg-white/5"
          }`}
        >
          <MessageCircle size="14" />
          <span>Chats</span>
        </button>

        <button
          onClick={() => setActiveTab("groups")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-sm ${
            activeTab === "groups"
              ? "bg-white/10 text-cyan-400"
              : "text-white/50 hover:text-white/80 hover:bg-white/5"
          }`}
        >
          <Group size="14" />
          <span>Groups</span>
        </button>

        <button
          onClick={() => setActiveTab("contacts")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-sm ${
            activeTab === "contacts"
              ? "bg-white/10 text-cyan-400"
              : "text-white/50 hover:text-white/80 hover:bg-white/5"
          }`}
        >
          <Users size="14" />
          <span>Contacts</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 size-4" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 text-white placeholder:text-white/30 border border-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all text-sm"
        />
      </div>

      {/* Create Group Button - ONLY in Groups tab */}
      {activeTab === "groups" && (
        <button
          onClick={onOpenCreateGroup}  
          className="w-full py-2 bg-white/5 hover:bg-white/10 text-cyan-400 rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Plus size="14" />
          <span>Create Group</span>
        </button>
      )}
    </div>
  );
}

export default ActiveTabSwitch;
