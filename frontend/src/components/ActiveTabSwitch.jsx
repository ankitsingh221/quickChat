import React from "react";
import { useChatStore } from "../store/useChatStore";
import { Search, Plus } from "lucide-react";

function ActiveTabSwitch({ onOpenCreateGroup }) {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery } =
    useChatStore();

  return (
    <div className="p-2 space-y-3">
      {/* Tabs Row */}
      <div className="flex items-center gap-2">
        <div className="tabs tabs-boxed bg-slate-800/40 p-1 flex-grow border border-slate-700/50">
          <button
            onClick={() => setActiveTab("chats")}
            className={`tab flex-1 transition-all duration-200 ${
              activeTab === "chats"
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Chats
          </button>

          <button
            onClick={() => setActiveTab("groups")}
            className={`tab flex-1 transition-all duration-200 ${
              activeTab === "groups"
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Groups
          </button>

          <button
            onClick={() => setActiveTab("contacts")}
            className={`tab flex-1 transition-all duration-200 ${
              activeTab === "contacts"
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Contacts
          </button>
        </div>

        {/* PLUS BUTTON TRIGGER */}
        {activeTab === "groups" && (
          <button
            onClick={onOpenCreateGroup}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl transition-all border border-slate-700 hover:border-cyan-500/50 group"
          >
            <Plus className="size-5 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-4" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/80 text-slate-200 placeholder:text-slate-500 border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/40 transition-all text-sm"
        />
      </div>
    </div>
  );
}

export default ActiveTabSwitch;
