import React, { useEffect } from "react";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";

const MessageSearch = () => {
  const { 
    searchTerm = "", 
    setSearchTerm, 
    messages = [], 
    searchIndex, 
    nextSearchResult, 
    prevSearchResult,
    isSearchIconOpen, 
    setIsSearchIconOpen, 
    clearSearch 
  } = useChatStore();
  
  // Error-proofed matches calculation
  const matches = (searchTerm && searchTerm.trim()) 
    ? messages
        .filter(m => 
            !m.isDeleted && 
            m.text && 
            m.text.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(m => m._id)
    : [];

  // Scroll logic
  useEffect(() => {
    if (matches.length > 0) {
      // Index 0 is the most recent match (bottom of chat)
      const activeId = matches[matches.length - 1 - searchIndex];
      const element = document.getElementById(`msg-${activeId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add highlight effect
        element.classList.add('bg-cyan-500/20', 'transition-all', 'duration-300');
        setTimeout(() => {
          element.classList.remove('bg-cyan-500/20');
        }, 2000);
      }
    }
  }, [searchIndex, searchTerm, matches.length]);

  return (
    <div className="flex items-center gap-2">
      {isSearchIconOpen ? (
        <div className="flex items-center bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 shadow-lg animate-in fade-in slide-in-from-right-4">
          <input
            autoFocus
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-white w-32 md:w-48 placeholder-white/30"
          />
          
          {searchTerm && searchTerm.trim() !== "" && (
            <div className="flex items-center gap-1 border-l border-white/10 ml-2 pl-2">
              <span className="text-[10px] text-cyan-400 font-mono">
                {matches.length > 0 ? `${searchIndex + 1}/${matches.length}` : "0/0"}
              </span>
              <button 
                onClick={() => prevSearchResult(matches.length)} 
                disabled={matches.length === 0}
                className="hover:text-cyan-400 text-white/40 disabled:opacity-20 transition-colors"
                title="Previous result"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button 
                onClick={() => nextSearchResult(matches.length)}
                disabled={matches.length === 0}
                className="hover:text-cyan-400 text-white/40 disabled:opacity-20 transition-colors"
                title="Next result"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Close button now clears store text AND closes the bar */}
          <button 
            onClick={() => clearSearch()} 
            className="ml-1 p-1 hover:bg-white/10 rounded-full transition-colors"
            title="Close search"
          >
            <X className="w-4 h-4 text-white/40 hover:text-white" />
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setIsSearchIconOpen(true)}
          className="group relative p-2 rounded-full transition-all duration-200 text-white/40 hover:bg-white/10 hover:text-cyan-400"
          title="Search messages"
        >
          <Search className="w-5 h-5" />
          {/* Tooltip text */}
          <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            Search
          </span>
        </button>
      )}
    </div>
  );
};

export default MessageSearch;