import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../useAuthStore";

export const createMessageSlice = (set, get) => ({
  messages: [],
  isMessagesLoading: false,
  selectedMessages: [],
  isSelectionMode: false,
  forwardingMessages: null,
  isForwardModalOpen: false,
  typingUsers: {},

  setForwardingMessages: (msgs) =>
    set({ forwardingMessages: Array.isArray(msgs) ? msgs : [msgs] }),

  closeForwardModal: () => set({ forwardingMessages: [] }),

  getFilteredMessages: () => {
    const { messages, groupMessages, selectedGroup, searchTerm } = get();

    const source = selectedGroup ? groupMessages || [] : messages || [];

    if (!searchTerm) return source;

    // If searching, filter safely
    return source.filter((msg) =>
      msg.text?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
  getMessagesByUserId: async (userId) => {
    if (!userId) return;
    set({ isMessagesLoading: true, groupMessages: [] });
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

  sendMessage: async ({ text, image, replyTo, overrideId = null }) => {
    const {
      selectedUser,
      messages,
      chats,
      allContacts,
      updateChatWithNewMessage,
    } = get();
    const { authUser } = useAuthStore.getState();

    const targetId = overrideId || selectedUser?._id;
    if (targetId) return toast.error("No user selected.");

    const isForwarding = !!overrideId;
    let tempId = null;
    if (!isForwarding) {
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
    }

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
      const updatedData = res.data?.data || res.data;

      set((state) => {
        const updateMsg = (msg) =>
          msg._id === messageId
            ? {
                ...msg,
                ...updatedData,
                reactions: msg.reactions || [],
                replyTo: msg.replyTo || null,
              }
            : msg;

        return {
          messages: state.messages.map(updateMsg),
          groupMessages: (state.groupMessages || []).map(updateMsg),
        };
      });
    } catch (error) {
      toast.error("Failed to edit message", error);
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
    try {
      await axiosInstance.delete(`/messages/delete/forMe/${messageId}`);

      set((state) => {
        const filteredPrivate = state.messages.filter(
          (msg) => msg._id !== messageId
        );
        const filteredGroup = (state.groupMessages || []).filter(
          (msg) => msg._id !== messageId
        );

        const updatedChats = state.chats.map((chat) => {
          if (chat.lastMessage?._id === messageId) {
            const remaining = filteredPrivate.filter(
              (m) => m.senderId === chat._id || m.receiverId === chat._id
            );
            return {
              ...chat,
              lastMessage: remaining.length
                ? remaining[remaining.length - 1]
                : null,
            };
          }
          return chat;
        });

        return {
          messages: filteredPrivate,
          groupMessages: filteredGroup,
          chats: updatedChats,
        };
      });
    } catch (error) {
      toast.error("Failed to delete message", error);
    }
  },

  deleteForEveryone: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/forEveryone/${messageId}`);

      set((state) => {
        const transform = (msg) =>
          msg._id === messageId
            ? { ...msg, isDeleted: true, text: null, image: null }
            : msg;

        const updatedPrivate = state.messages.map(transform);
        const updatedGroup = (state.groupMessages || []).map(transform);

        return {
          messages: updatedPrivate,
          groupMessages: updatedGroup,
        };
      });
    } catch (error) {
      toast.error("Failed to delete for everyone ", error);
    }
  },
  toggleReaction: async (messageId, emoji) => {
    const { authUser } = useAuthStore.getState();

    const updateLocalState = (messagesArray) =>
      messagesArray.map((msg) => {
        if (msg._id !== messageId) return msg;

        const reactions = [...(msg.reactions || [])];
        const existingIdx = reactions.findIndex(
          (r) => (r.userId?._id || r.userId) === authUser._id
        );

        if (existingIdx > -1) {
          if (reactions[existingIdx].emoji === emoji)
            reactions.splice(existingIdx, 1);
          else reactions[existingIdx].emoji = emoji;
        } else {
          reactions.push({
            userId: authUser._id,
            emoji,
            displayName: authUser.fullName,
          });
        }
        return { ...msg, reactions };
      });

    set((state) => ({
      messages: updateLocalState(state.messages),
      groupMessages: updateLocalState(state.groupMessages),
    }));

    try {
      await axiosInstance.patch(`/messages/reaction/${messageId}`, { emoji });
    } catch (error) {
      toast.error("Failed to update reaction");
    }
  },

  deleteSelectedMessages: async (deleteType = "forMe") => {
    const { selectedMessages } = get();
    const isForEveryone = deleteType === "forEveryone";

    try {
      await axiosInstance.post("/messages/delete-bulk", {
        messageIds: selectedMessages,
        isForEveryone: isForEveryone,
      });

      set((state) => {
        const updateList = (list) => {
          if (isForEveryone) {
            // Keep the message object but mark as deleted
            return list.map((m) =>
              selectedMessages.includes(m._id)
                ? { ...m, isDeleted: true, text: null, image: null }
                : m
            );
          } else {
            // Remove from local view entirely
            return list.filter((m) => !selectedMessages.includes(m._id));
          }
        };

        return {
          messages: updateList(state.messages),
          groupMessages: updateList(state.groupMessages || []),
          selectedMessages: [],
          isSelectionMode: false,
        };
      });

      toast.success(isForEveryone ? "Deleted for everyone" : "Deleted for me");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete messages");
    }
  },
  clearChat: async (id, isGroup = false) => {
    try {
      await axiosInstance.delete(`/messages/clear/${id}?isGroup=${isGroup}`);
      set((state) => {
        if (isGroup) {
          return {
            // Immediately empty the array
            groupMessages: [],
            // Update the sidebar preview
            groups: (state.groups || []).map((g) =>
              String(g._id) === String(id) ? { ...g, lastMessage: null } : g
            ),
          };
        } else {
          return {
            // Immediately empty the array
            messages: [],
            // Update the sidebar preview
            chats: (state.chats || []).map((c) =>
              String(c._id) === String(id) ? { ...c, lastMessage: null } : c
            ),
          };
        }
      });

      toast.success("Chat cleared");
    } catch (error) {
      console.error("Clear chat error:", error);
      toast.error("Failed to clear chat");
    }
  },

 forwardMessages: async (targetId, isTargetGroup = false) => {
  const { forwardingMessages, updateChatWithNewMessage, updateGroupWithNewMessage, chats, groups, getMyChatPartners } = get();

  if (!forwardingMessages?.length) return false;

  try {
    // 1. Define the endpoint once since the targetId is the same for all messages
    const endpoint = isTargetGroup 
      ? `/messages/group/${targetId}/send` 
      : `/messages/send/${targetId}`;

    // 2. Map promises using the clean endpoint
    const promises = forwardingMessages.map((msg) =>
      axiosInstance.post(endpoint, {
        text: msg.text,
        image: msg.image,
        isForwarded: true,
      })
    );

    const responses = await Promise.all(promises);

    // 3. Process the last message for the Sidebar/UI
    if (responses.length > 0) {
      const lastSentMsg = responses[responses.length - 1].data?.data;
      if (!lastSentMsg) return true;

      if (isTargetGroup) {
        updateGroupWithNewMessage?.(lastSentMsg);
        // Move group to top of sidebar
        set({
          groups: [
            { ...groups.find(g => String(g._id) === String(targetId)), lastMessage: lastSentMsg },
            ...groups.filter(g => String(g._id) !== String(targetId))
          ]
        });
      } else {
        updateChatWithNewMessage?.(lastSentMsg);
        // Move chat to top of sidebar
        const chatExists = chats.some((c) => String(c._id) === String(targetId));
        if (!chatExists) {
          await getMyChatPartners();
        } else {
          set({
            chats: [
              { ...chats.find(c => String(c._id) === String(targetId)), lastMessage: lastSentMsg },
              ...chats.filter(c => String(c._id) !== String(targetId))
            ]
          });
        }
      }
    }

    set({ forwardingMessages: [], isSelectionMode: false });
    toast.success(`Forwarded ${forwardingMessages.length} messages`);
    return true;
  } catch (error) {
    console.error("Forwarding error:", error);
    toast.error("Failed to forward messages");
    return false;
  }
},

  updateChatWithNewMessage: (msg) => {
    //  If this is a group message, let createGroupSlice handle it.
    if (msg.groupId) return;

    const { chats, allContacts } = get();
    const { authUser } = useAuthStore.getState();

    // Logic for private chat partner
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

    const updatedContacts = allContacts.map((contact) =>
      contact._id === partnerId ? { ...contact, lastMessage: msg } : contact
    );

    set({ chats: updatedChats, allContacts: updatedContacts });
  },

  setTypingStatus: (userId, isTyping) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [userId]: isTyping,
      },
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
      const { selectedUser, messages } = get();
      const { authUser } = useAuthStore.getState();

      //  Use authUser from useAuthStore, not from get()
      if (
        msg.senderId === authUser?._id ||
        msg.senderId?._id === authUser?._id
      ) {
        return;
      }

      // Check if message already exists (prevents duplicates)
      const messageExists = messages.some((m) => m._id === msg._id);
      if (messageExists) {
        return;
      }

      // Check if this message is for the currently open chat
      const isMessageFromSelectedUser =
        selectedUser?._id === msg.senderId ||
        selectedUser?._id === msg.senderId?._id;

      if (isMessageFromSelectedUser) {
        // Message is for the OPEN chat
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...msg,
              reactions: msg.reactions || [],
              replyTo: msg.replyTo || null,
            },
          ],
        }));

        //  If chat is open and visible, mark as read immediately (no unread count)
        const isPageVisible = !document.hidden;
        if (isPageVisible) {
          get().markMessagesAsRead(msg.senderId);
          get().updateUnreadCount(msg.senderId, 0);
        } else {
          // Page is hidden, increment unread
          const currentCount = get().unreadCounts[msg.senderId] || 0;
          get().updateUnreadCount(msg.senderId, currentCount + 1);
        }
      } else {
        //Message is for a DIFFERENT chat (not currently open)
        const senderId =
          typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
        const currentCount = get().unreadCounts[senderId] || 0;
        get().updateUnreadCount(senderId, currentCount + 1);
      }

      // Update sidebar last message
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
      set((state) => {
        const updater = (msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg;

        return {
          messages: state.messages.map(updater),
          groupMessages: state.groupMessages.map(updater),
        };
      });
    });

    socket.on("userTyping", ({ chatId, isGroup }) => {
      if (!isGroup) {
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [chatId]: true, // chatId is the Sender's ID sent from backend
          },
        }));
      }
    });

    socket.on("userStopTyping", ({ chatId, isGroup }) => {
      if (!isGroup) {
        set((state) => {
          const newTyping = { ...state.typingUsers };
          delete newTyping[chatId];
          return { typingUsers: newTyping };
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;
    {
      socket.off("newMessage");
      socket.off("messagesRead");
      socket.off("message:edited");
      socket.off("message:deleted");
      socket.off("message:deletedForMe");
      socket.off("message:reactionUpdated");
      socket.off("chat:cleared");
      socket.off("userTyping");
      socket.off("userStopTyping");
    }

    set({ typingUsers: {} });
  },
});
