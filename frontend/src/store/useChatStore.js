import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");

    
      if (res.data && Array.isArray(res?.data?.users)) {
        set({ allContacts: res.data.users });
      } else {
        console.error("Invalid contacts response:", res.data);
        set({ allContacts: [] });
      }
    } catch (error) {
      console.error(error);
      set({ allContacts: [] });

      if (error.response?.data?.message) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error("Failed to load contacts");
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/conversations");

      if (res.data && Array.isArray(res?.data?.users)) {
        set({ chats: res.data.users });
      } else {
        console.error("Invalid chats response:", res.data);
        set({ chats: [] });
      }
    } catch (error) {
      console.error(error);
      set({ chats: [] });

      if (error.response?.data?.message) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error("Failed to load chats");
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    if (!userId) return;

    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);

      if (Array.isArray(res.data?.messages)) {
        set({ messages: res.data.messages });
      } else {
        console.error("Invalid messages response:", res.data);
        set({ messages: [] });
      }

    } catch (error) {
      console.error(error);
      set({ messages: [] });
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (userId, payload) => {
    if (!userId) return;

    try {
      const res = await axiosInstance.post(`/messages/send/${userId}`, payload);

      if (res.data?.data) {
        set((state) => ({
          messages: [...state.messages, res.data.data],
        }));
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },


}));
