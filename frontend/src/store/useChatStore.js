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
  searchTerm: "",
  searchIndex: 0,
  isSearchIconOpen: false,
  typingUsers: {},
  unreadCounts: {},

  selectedMessages: [],
  isSelectionMode: false,

  forwardingMessages: null,
  isForwardModalOpen: false,

  setTypingStatus: (userId, isTyping) => {
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping },
    }));
  },

  setSearchTerm: (term) => set({ searchTerm: term, searchIndex: 0 }),
  setIsSearchIconOpen: (isOpen) => set({ isSearchIconOpen: isOpen }),

  getFilteredMessages: () => {
    return get().messages;
  },
  clearSearch: () =>
    set({ searchTerm: "", searchIndex: 0, isSearchIconOpen: false }),

  nextSearchResult: (matchCount) => {
    set((state) => ({ searchIndex: (state.searchIndex + 1) % matchCount }));
  },
  prevSearchResult: (matchCount) => {
    set((state) => ({
      searchIndex: (state.searchIndex - 1 + matchCount) % matchCount,
    }));
  },

  setActiveTab: (tab) => set({ activeTab: tab, searchQuery: "" }),

  setSelectedUser: (selectedUser) => set({ selectedUser }),

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

  deleteSelectedMessages: async () => {
    const { selectedMessages, messages } = get();
    try {
      await axiosInstance.post("/messages/delete-bulk", {
        messageIds: selectedMessages,
      });
      set({
        messages: messages.filter((msg) => !selectedMessages.includes(msg._id)),
        selectedMessages: [],
        isSelectionMode: false,
      });
      toast.success("Messages deleted");
    } catch (error) {
      toast.error("Failed to delete messages", error);
    }
  },

  setForwardingMessages: (msgs) =>
    set({ forwardingMessages: Array.isArray(msgs) ? msgs : [msgs] }),

  closeForwardModal: () => set({ forwardingMessages: [] }),

  forwardMessages: async (targetUserId) => {
    const {
      forwardingMessages,
      updateChatWithNewMessage,
      chats,
      getMyChatPartners,
    } = get();

    if (!forwardingMessages || forwardingMessages.length === 0) return false;

    try {
      // Send all messages to the target user
      const promises = forwardingMessages.map((msg) =>
        axiosInstance.post(`/messages/send/${targetUserId}`, {
          text: msg.text,
          image: msg.image,
          isForwarded: true,
        })
      );

      const responses = await Promise.all(promises);

      // Process the update if we got a valid response
      if (responses.length > 0 && responses[responses.length - 1].data?.data) {
        const lastSentMsg = responses[responses.length - 1].data.data;

        // Update the main chat window if the target user is currently open
        updateChatWithNewMessage(lastSentMsg);

        // Update the ChatList
        const existingChat = chats.find(
          (c) => String(c._id) === String(targetUserId)
        );

        if (!existingChat) {
          // if  Forwarding to someone NEW.
          // We need to fetch their profile pic and name from the server.
          await getMyChatPartners();
        } else {
          // if Forwarding to someone ALREADY in the list.
          // We MUST spread (...chat) to keep fullName and profilePic
          const updatedChats = chats.map((chat) => {
            if (String(chat._id) === String(targetUserId)) {
              return {
                ...chat, // this keeps name and proifle pic
                lastMessage: lastSentMsg,
              };
            }
            return chat;
          });
          set({ chats: updatedChats });
        }
      }

      set({ selectedMessages: [], isSelectionMode: false });
      return true;
    } catch (error) {
      console.error("Forwarding error:", error);
      return false;
    }
  },
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

  updateChatWithNewMessage: (msg) => {
    const { chats, allContacts } = get();
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

    // Update allContacts too
    const updatedContacts = allContacts.map((contact) =>
      contact._id === partnerId ? { ...contact, lastMessage: msg } : contact
    );

    set({ chats: updatedChats, allContacts: updatedContacts });
  },

  sendMessage: async ({ text, image, replyTo }) => {
    const {
      selectedUser,
      messages,
      chats,
      allContacts,
      updateChatWithNewMessage,
    } = get();
    const { authUser } = useAuthStore.getState();
    if (!selectedUser?._id) return toast.error("No user selected.");

    const tempId = `temp-${Date.now()}-${Math.random()}`;
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

    // Update allContacts
    const updatedContacts = allContacts.map((contact) =>
      contact._id === selectedUser._id
        ? { ...contact, lastMessage: optimisticMessage }
        : contact
    );

    set({ chats: updatedChats, allContacts: updatedContacts });

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
          allContacts: state.allContacts.map((contact) =>
            contact._id === selectedUser._id
              ? { ...contact, lastMessage: res.data.data }
              : contact
          ),
        }));

        updateChatWithNewMessage(res.data.data);
      }
    } catch (error) {
      console.error("Send message error:", error);

      set({ messages, chats, allContacts });
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
    const hasSidebarUnread = (get().unreadCounts[userId] || 0) > 0;
    if (!hasUnread && !hasSidebarUnread) return;

    try {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.senderId === userId ? { ...m, seen: true } : m
        ),
        unreadCounts: {
          ...state.unreadCounts,
          [userId]: 0,
        },
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
          const userExistingReaction = msg.reactions?.find(
            (r) =>
              (r.userId?._id || r.userId).toString() === authUser._id.toString()
          );

          let newReactions;

          const newReactionEntry = {
            userId: {
              _id: authUser._id,
              fullName: authUser.fullName,
              profilePic: authUser.profilePic,
            },
            emoji,
            displayName: authUser.fullName,
            profilePic: authUser.profilePic,
          };

          if (userExistingReaction) {
            if (userExistingReaction.emoji === emoji) {
              newReactions = msg.reactions.filter(
                (r) =>
                  (r.userId?._id || r.userId).toString() !==
                  authUser._id.toString()
              );
            } else {
              const filtered = msg.reactions.filter(
                (r) =>
                  (r.userId?._id || r.userId).toString() !==
                  authUser._id.toString()
              );
              newReactions = [...filtered, newReactionEntry];
            }
          } else {
            newReactions = [...(msg.reactions || []), newReactionEntry];
          }

          return { ...msg, reactions: newReactions };
        }
        return msg;
      });

      set({ messages: updatedMessages });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update reaction");
    }
  },

  clearChat: async (userId) => {
    try {
      await axiosInstance.delete(`/messages/clear/${userId}`);

      // Clear the chat window
      set({ messages: [] });

      // Update the chatlist instantly
      const { chats } = get();
      const updatedChats = chats.map((chat) => {
        if (String(chat._id) === String(userId)) {
          // We set lastMessage to null so UserCard shows "No messages yet"
          return { ...chat, lastMessage: null };
        }
        return chat;
      });

      set({ chats: updatedChats });
      toast.success("Chat cleared successfully");
    } catch (error) {
      console.error("Clear chat error:", error);
      toast.error("Failed to clear chat");
    }
  },
  updateUnreadCount: (userId, count) => {
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [userId]: count,
      },
      chats: state.chats.map((chat) =>
        chat._id === userId ? { ...chat, unreadCount: count } : chat
      ),
    }));
  },

  subscribeToMessages: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messagesRead");
    socket.off("message:edited");
    socket.off("message:deleted");
    socket.off("message:deletedForMe");
    socket.off("message:reactionUpdated");
    socket.off("chat:cleared");
    socket.off("userTyping");
    socket.off("userStopTyping");

    socket.on("newMessage", (msg) => {
      const { selectedUser, messages, authUser } = get();

      if (msg.senderId === authUser?._id) {
        return;
      }

      const messageExists = messages.some((m) => m._id === msg._id);
      if (messageExists) {
        return;
      }

      const isMessageFromSelectedUser = selectedUser?._id === msg.senderId;
      const isMessageForCurrentChat =
        isMessageFromSelectedUser || selectedUser?._id === msg.receiverId;

      if (isMessageForCurrentChat) {
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

        if (isMessageFromSelectedUser) {
          const isPageVisible = !document.hidden;

          if (isPageVisible) {
            get().markMessagesAsRead(selectedUser._id);
            get().updateUnreadCount(msg.senderId, 0);
          } else {
            const currentCount = get().unreadCounts[msg.senderId] || 0;
            get().updateUnreadCount(msg.senderId, currentCount + 1);
          }
        }
      } else {
        const currentCount = get().unreadCounts[msg.senderId] || 0;
        get().updateUnreadCount(msg.senderId, currentCount + 1);
      }

      get().updateChatWithNewMessage(msg);
    });

    socket.on("messagesRead", ({ messageIds, readBy }) => {
      const { selectedUser } = get();

      if (!selectedUser) return;

      if (selectedUser._id.toString() !== readBy.toString()) return;

      set((state) => ({
        messages: state.messages.map((m) =>
          messageIds.includes(m._id.toString()) ? { ...m, seen: true } : m
        ),
      }));
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
    });

    socket.on("chat:cleared", ({ userId }) => {
      const { selectedUser } = get();
      if (selectedUser?._id === userId) {
        set({ messages: [] });
      }
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

    socket.on("userTyping", ({ userId }) => {
      get().setTypingStatus(userId, true);
    });

    socket.on("userStopTyping", ({ userId }) => {
      get().setTypingStatus(userId, false);
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
    socket.off("userTyping");
    socket.off("userStopTyping");
  },
}));
