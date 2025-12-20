import { useChatStore } from "../store/useChatStore";
import { Search } from "lucide-react";

function ActiveTabSwitch() {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
  } = useChatStore();

  return (
    <div className="p-2">
      {/* Tabs */}
      <div className="tabs tabs-boxed bg-transparent mb-2 ">
        <button
          onClick={() => setActiveTab("chats")}
          className={`tab ${
            activeTab === "chats"
              ? "bg-cyan-500/20 text-cyan-300"
              : "text-slate-400"
          }`}
        >
          Chats
        </button>

        <button
          onClick={() => setActiveTab("contacts")}
          className={`tab ${
            activeTab === "contacts"
              ? "bg-cyan-500/20 text-cyan-300"
              : "text-slate-400"
          }`}
        >
          Contacts
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="
            w-full
            pl-9 pr-3 py-2
            rounded-lg
            bg-slate-800
            text-slate-200
            placeholder:text-slate-400
            focus:outline-none
            focus:ring-1 focus:ring-cyan-500/40
          "
        />
      </div>
    </div>
  );
}

export default ActiveTabSwitch;
