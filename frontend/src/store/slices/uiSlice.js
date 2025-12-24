export const createUISlice = (set, get) => ({
  activeTab: "chats",
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  searchQuery: "",
  searchTerm: "",
  searchIndex: 0,
  isSearchIconOpen: false,
  typingUsers: {},

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchTerm: (term) => set({ searchTerm: term, searchIndex: 0 }),
  setIsSearchIconOpen: (isOpen) => set({ isSearchIconOpen: isOpen }),
  setActiveTab: (tab) => set({ activeTab: tab, searchQuery: "" }),

  clearSearch: () =>
    set({ searchTerm: "", searchIndex: 0, isSearchIconOpen: false }),

  setTypingStatus: (userId, isTyping) => {
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping },
    }));
  },

  toggleSound: () => {
    const newVal = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", newVal);
    set({ isSoundEnabled: newVal });
  },

  toggleSelectionMode: (value) =>
    set({
      isSelectionMode: value,
      selectedMessages: [],
    }),
    
  toggleMessageSelection: (messageId) => {
    const { selectedMessages } = get();
    if (selectedMessages.includes(messageId)) {
      set({
        selectedMessages: selectedMessages.filter((id) => id !== messageId),
      });
    } else {
      set({ selectedMessages: [...selectedMessages, messageId] });
    }
  },

  nextSearchResult: (matchCount) => {
    set((state) => ({ searchIndex: (state.searchIndex + 1) % matchCount }));
  },
  prevSearchResult: (matchCount) => {
    set((state) => ({
      searchIndex: (state.searchIndex - 1 + matchCount) % matchCount,
    }));
  },
});
