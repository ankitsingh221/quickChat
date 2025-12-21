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
    isSearchIconOpen, // Using store state
    setIsSearchIconOpen, // Using store action
    clearSearch // Added clearSearch to handle resetting everything
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
      // WhatsApp logic: Index 0 is the most recent match (bottom of chat)
      const activeId = matches[matches.length - 1 - searchIndex];
      const element = document.getElementById(`msg-${activeId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [searchIndex, searchTerm, matches.length]);

  return (
    <div className="flex items-center gap-2">
      {isSearchIconOpen ? (
        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-full px-3 py-1 shadow-lg animate-in fade-in slide-in-from-right-4">
          <input
            autoFocus
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-white w-32 md:w-48"
          />
          
          {searchTerm && searchTerm.trim() !== "" && (
            <div className="flex items-center gap-1 border-l border-slate-700 ml-2 pl-2">
              <span className="text-[10px] text-slate-500 font-mono">
                {matches.length > 0 ? `${searchIndex + 1}/${matches.length}` : "0/0"}
              </span>
              <button 
                onClick={() => prevSearchResult(matches.length)} 
                disabled={matches.length === 0}
                className="hover:text-cyan-400 text-slate-400 disabled:opacity-20"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button 
                onClick={() => nextSearchResult(matches.length)}
                disabled={matches.length === 0}
                className="hover:text-cyan-400 text-slate-400 disabled:opacity-20"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Close button now clears store text AND closes the bar */}
          <button 
            onClick={() => clearSearch()} 
            className="ml-1"
          >
            <X className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setIsSearchIconOpen(true)}
          className="p-2 hover:bg-slate-700/50 rounded-full transition-colors"
        >
          <Search className="w-5 h-5 text-slate-400" />
        </button>
      )}
    </div>
  );
};

export default MessageSearch;