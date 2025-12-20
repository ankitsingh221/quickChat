import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleSound: () => {
    const newVal = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", newVal);
    set({ isSoundEnabled: newVal });
  },

  setActiveTab: (tab) => set({ activeTab: tab, searchQuery: "" }),

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({
        allContacts: Array.isArray(res.data?.users) ? res.data.users : [],
      });
    } catch (error) {
      console.error(error);
      set({ allContacts: [] });
      toast.error(error.response?.data?.message || "Failed to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    if (!userId) return;
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const messages = Array.isArray(res.data?.messages)
        ? res.data.messages
        : [];
      const normalized = messages.map((m) => ({
        ...m,
        reactions: m.reactions || [],
        replyTo: m.replyTo || null,
      }));
      set({ messages: normalized });
    } catch (error) {
      console.error(error);
      set({ messages: [] });
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/conversations");
      let chats = Array.isArray(res.data?.users) ? res.data.users : [];

      chats.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt
          ? new Date(a.lastMessage.createdAt).getTime()
          : 0;
        const bTime = b.lastMessage?.createdAt
          ? new Date(b.lastMessage.createdAt).getTime()
          : 0;
        return bTime - aTime;
      });

      set({ chats });
    } catch (error) {
      console.error(error);
      set({ chats: [] });
      toast.error(error.response?.data?.message || "Failed to load chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  updateChatWithNewMessage: (msg) => {
    const { chats } = get();
    const { authUser } = useAuthStore.getState();
    const partnerId =
      msg.senderId === authUser._id ? msg.receiverId : msg.senderId;

    const existingIndex = chats.findIndex((c) => c._id === partnerId);

    const updatedChat = {
      ...(chats[existingIndex] || {
        _id: partnerId,
        fullName: msg.senderName || "Unknown",
      }),
      lastMessage: msg,
    };

    let updatedChats = [...chats];
    if (existingIndex > -1) updatedChats.splice(existingIndex, 1);
    updatedChats.unshift(updatedChat);

    set({ chats: updatedChats });
  },

  sendMessage: async ({ text, image, replyTo }) => {
    const { selectedUser, messages, chats, updateChatWithNewMessage } = get();
    const { authUser } = useAuthStore.getState();
    if (!selectedUser?._id) return toast.error("No user selected.");

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text,
      image,
      replyTo: replyTo || null,
      reactions: [],
      createdAt: new Date().toISOString(),
    };

    set({ messages: [...messages, optimisticMessage] });

    const existingIndex = chats.findIndex((c) => c._id === selectedUser._id);
    const updatedChat = {
      ...(chats[existingIndex] || {
        _id: selectedUser._id,
        fullName: selectedUser.fullName,
      }),
      lastMessage: optimisticMessage,
    };
    let updatedChats = [...chats];
    if (existingIndex > -1) updatedChats.splice(existingIndex, 1);
    updatedChats.unshift(updatedChat);
    set({ chats: updatedChats });

    try {
      const payload = { text, image };

      if (replyTo) {
        payload.replyTo = {
          _id: replyTo._id,
          text: replyTo.text || null,
          image: replyTo.image || null,
          senderId: replyTo.senderId,
        };
      }

      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        payload
      );

      if (res.data?.data) {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === tempId
              ? {
                  ...res.data.data,
                  reactions: res.data.data.reactions || [],
                  replyTo: res.data.data.replyTo || null,
                }
              : msg
          ),
        }));

        updateChatWithNewMessage(res.data.data);
      }
    } catch (error) {
      console.error("Send message error:", error);

      set({ messages, chats });
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  editMessage: async (messageId, newText) => {
    try {
      const res = await axiosInstance.patch(`/messages/edit/${messageId}`, {
        text: newText,
      });
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId
            ? {
                ...res.data,
                reactions: msg.reactions || [],
                replyTo: msg.replyTo || null,
              }
            : msg
        ),
      }));
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to edit message");
    }
  },

  markMessagesAsRead: async (userId) => {
    if (!userId) return;

    const messages = get().messages;
    const hasUnread = messages.some((m) => m.senderId === userId && !m.seen);
    if (!hasUnread) return;

    try {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.senderId === userId ? { ...m, seen: true } : m
        ),
      }));

      await axiosInstance.put(`/messages/read/${userId}`);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },
  deleteForMe: async (messageId) => {
    const { messages, chats } = get();
    try {
      await axiosInstance.delete(`/messages/delete/forMe/${messageId}`);

      const updatedMessages = messages.filter((msg) => msg._id !== messageId);
      set({ messages: updatedMessages });

      const updatedChats = chats.map((chat) => {
        if (chat.lastMessage?._id === messageId) {
          // Find the new lastMessage for this chat
          const chatMessages = updatedMessages.filter(
            (m) => m.senderId === chat._id || m.receiverId === chat._id
          );
          return {
            ...chat,
            lastMessage: chatMessages.length
              ? chatMessages[chatMessages.length - 1]
              : null,
          };
        }
        return chat;
      });

      set({ chats: updatedChats });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  deleteForEveryone: async (messageId) => {
    const { messages, chats } = get();
    try {
      await axiosInstance.delete(`/messages/delete/forEveryone/${messageId}`);

      const updatedMessages = messages.map((msg) =>
        msg._id === messageId
          ? { ...msg, isDeleted: true, text: null, image: null }
          : msg
      );
      set({ messages: updatedMessages });

      const updatedChats = chats.map((chat) => {
        if (chat.lastMessage?._id === messageId) {
          const chatMessages = updatedMessages.filter(
            (m) => m.senderId === chat._id || m.receiverId === chat._id
          );
          return {
            ...chat,
            lastMessage: chatMessages.length
              ? chatMessages[chatMessages.length - 1]
              : null,
          };
        }
        return chat;
      });

      set({ chats: updatedChats });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  toggleReaction: async (messageId, emoji) => {
    const { messages } = get();
    const { authUser } = useAuthStore.getState();

    try {
      await axiosInstance.patch(`/messages/reaction/${messageId}`, { emoji });

      const updatedMessages = messages.map((msg) => {
        if (msg._id === messageId) {
          const existingReaction = msg.reactions?.find(
            (r) =>
              r.userId.toString() === authUser._id.toString() &&
              r.emoji === emoji
          );

          let newReactions;
          if (existingReaction) {
            newReactions = msg.reactions.filter(
              (r) =>
                !(
                  r.userId.toString() === authUser._id.toString() &&
                  r.emoji === emoji
                )
            );
          } else {
            newReactions = [
              ...(msg.reactions || []),
              { userId: authUser._id, emoji },
            ];
          }

          return { ...msg, reactions: newReactions };
        }
        return msg;
      });

      set({ messages: updatedMessages });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to toggle reaction");
    }
  },

  clearChat: async (userId) => {
    try {
      await axiosInstance.delete(`/messages/clear/${userId}`);
      set({ messages: [] });
      toast.success("Chat cleared successfully");
    } catch (error) {
      console.error("Clear chat error:", error);
      toast.error(error.response?.data?.message || "Failed to clear chat");
    }
  },

  subscribeToMessages: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.on("newMessage", (msg) => {
      const { selectedUser, messages } = get();
      const isCurrentChat =
        selectedUser?._id === msg.senderId ||
        selectedUser?._id === msg.receiverId;

      if (!messages.some((m) => m._id === msg._id)) {
        if (isCurrentChat) {
          set({
            messages: [
              ...messages,
              {
                ...msg,
                reactions: msg.reactions || [],
                replyTo: msg.replyTo || null,
              },
            ],
          });
        }
      }

      get().updateChatWithNewMessage(msg);
    });

    socket.on("messagesRead", ({ readBy }) => {
      const { selectedUser } = get();

      if (selectedUser?._id === readBy) {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.seen === false ? { ...m, seen: true } : m
          ),
        }));
      }
    });
    socket.on("message:edited", (msg) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === msg._id
            ? {
                ...msg,
                reactions: msg.reactions || [],
                replyTo: m.replyTo || null,
              }
            : m
        ),
      }));
    });

    socket.on("message:deleted", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, text: null, image: null }
            : m
        ),
      }));

      socket.on("chat:cleared", ({ userId }) => {
        const { selectedUser } = get();
        if (selectedUser?._id === userId) {
          set({ messages: [] });
        }
      });
    });

    socket.on("message:deletedForMe", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== messageId),
      }));
    });

    socket.on("message:reactionUpdated", ({ messageId, reactions }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId ? { ...m, reactions: reactions || [] } : m
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messagesRead");
    socket.off("message:edited");
    socket.off("message:deleted");
    socket.off("message:deletedForMe");
    socket.off("message:reactionUpdated");
    socket.off("chat:cleared");
  },
}));
