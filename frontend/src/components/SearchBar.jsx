// components/SearchBar.jsx
import { useChatStore } from "../store/useChatStore";
import { Search, X, Mic } from "lucide-react";

function SearchBar() {
  const { searchQuery, setSearchQuery } = useChatStore();
  
  const clearSearch = () => {
    setSearchQuery("");
  };
  
  return (
    <div className="p-3 border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="relative group">
        {/* Animated gradient border on focus */}
        <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-purple-500/0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
        
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className="size-4 text-white/40 group-focus-within:text-cyan-400 transition-colors duration-200" />
        </div>
        
        <input
          type="text"
          placeholder="Search messages or users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-16 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 text-white/90 placeholder:text-white/30 text-sm backdrop-blur-sm transition-all duration-200"
        />
        
        {/* Voice search button (futuristic touch) */}
        <button
          className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-white/10 p-1 rounded-lg transition-all duration-200 group/voice"
          title="Voice search"
        >
          <Mic className="size-3.5 text-white/30 group-hover/voice:text-cyan-400 transition-colors" />
        </button>
        
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 hover:bg-white/10 p-1 rounded-lg transition-all duration-200"
          >
            <X className="size-3.5 text-white/40 hover:text-cyan-400 transition-colors" />
          </button>
        )}
      </div>
      
      {/* Search hint */}
      {!searchQuery && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-[9px] text-white/20 uppercase tracking-wider">⌘K</span>
          <span className="text-[9px] text-white/20">to search</span>
        </div>
      )}
    </div>
  );
}

export default SearchBar;