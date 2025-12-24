import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

export const createContactSlice = (set, get) => ({
  allContacts: [],
  chats: [],
  selectedUser: null,
  isUsersLoading: false,
  unreadCounts: {},

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      const contacts = Array.isArray(res.data?.users) ? res.data.users : [];

      // Merge with existing chats to preserve lastMessage
      const { chats } = get();
      const mergedContacts = contacts.map((contact) => {
        const existingChat = chats.find((chat) => chat._id === contact._id);
        return existingChat
          ? { ...contact, lastMessage: existingChat.lastMessage }
          : contact;
      });

      set({ allContacts: mergedContacts });
    } catch (error) {
      console.error(error);
      set({ allContacts: [] });
      toast.error(error.response?.data?.message || "Failed to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/conversations");

      let chats = Array.isArray(res.data?.users) ? res.data.users : [];

      const initialUnreadCounts = {};
      chats.forEach((chat) => {
        initialUnreadCounts[chat._id] = chat.unreadCount || 0;
      });

      chats.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt
          ? new Date(a.lastMessage.createdAt).getTime()
          : 0;
        const bTime = b.lastMessage?.createdAt
          ? new Date(b.lastMessage.createdAt).getTime()
          : 0;
        return bTime - aTime;
      });

      set({
        chats,
        unreadCounts: initialUnreadCounts,
      });
    } catch (error) {
      console.error(error);
      set({ chats: [], unreadCounts: {} });
      toast.error(error.response?.data?.message || "Failed to load chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  updateUnreadCount: (userId, count) => {
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [userId]: count },
      chats: state.chats.map((chat) =>
        chat._id === userId ? { ...chat, unreadCount: count } : chat
      ),
    }));
  },
});
