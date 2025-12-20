// components/SearchBar.jsx
import { useChatStore } from "../store/useChatStore";
import { Search, X } from "lucide-react";

function SearchBar() {
  const { searchQuery, setSearchQuery } = useChatStore();
  
  const clearSearch = () => {
    setSearchQuery("");
  };
  
  return (
    <div className="p-3 border-b border-slate-700">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className="size-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search chats and contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 text-slate-200 placeholder:text-slate-500 text-sm"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-slate-700/50 p-1 rounded"
          >
            <X className="size-4 text-slate-400" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;