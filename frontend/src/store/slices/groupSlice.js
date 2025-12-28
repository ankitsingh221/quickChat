import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../useAuthStore";

export const createGroupSlice = (set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupMessagesLoading: false,
  groupUnreadCounts: {},
  groupTypingUsers: {},

  setSelectedGroup: (group) => {
    set((state) => ({
      selectedGroup: group,
      selectedUser: null,
      groupMessages: [],
      messages: [],
      isGroupMessagesLoading: !!group,
      groupTypingUsers: {
        ...state.groupTypingUsers,
        [group?._id]: state.groupTypingUsers[group?._id] || [],
      },
    }));

    if (group) {
      const socket = useAuthStore.getState().socket;
      get().getGroupMessages(group._id);
      if (socket) {
        socket.emit("joinChat", group._id);
        socket.emit("joinGroup", group._id);
        get().subscribeToGroupEvents();
      }
    }
  },

  createGroup: async (payload) => {
    set({ isCreatingGroup: true });
    try {
      const { groupName, groupDescription, memberIds, groupPic } = payload;
      const sanitizedIds = memberIds.map((id) =>
        typeof id === "object" ? id._id : id
      );

      const res = await axiosInstance.post("/groups/create", {
        groupName: groupName.trim(),
        groupDescription: groupDescription || "",
        memberIds: sanitizedIds,
        groupPic,
      });

      const newGroup = res.data.data;

      set((state) => ({
        groups: [newGroup, ...state.groups],
        isCreatingGroup: false,
      }));

      toast.success("Group created!");
      return newGroup;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to create group";
      toast.error(msg);
      set({ isCreatingGroup: false });
      return null;
    }
  },

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups/my-groups");

      let groups = Array.isArray(res.data?.data) ? res.data.data : [];
      const currentCounts = get().groupUnreadCounts; // Get what's already in state
      const mergedUnreadCounts = { ...currentCounts };

      groups.forEach((group) => {
        if (mergedUnreadCounts[group._id] === undefined) {
          mergedUnreadCounts[group._id] = group.unreadCount || 0;
        }
      });

      // Sort: Last message first, OR Newest created group first if no messages
      groups.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt
          ? new Date(a.lastMessage.createdAt).getTime()
          : new Date(a.createdAt).getTime(); // Fallback to group creation time
        const bTime = b.lastMessage?.createdAt
          ? new Date(b.lastMessage.createdAt).getTime()
          : new Date(b.createdAt).getTime();
        return bTime - aTime;
      });

      set({
        groups,
        // Using groupUnreadCounts to match state naming
        groupUnreadCounts: mergedUnreadCounts,
      });
    } catch (error) {
      console.error("GetGroups Error:", error);
      set({ groups: [] });
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Failed to load groups");
      }
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  getGroupById: async (groupId) => {
    try {
      const res = await axiosInstance.get(`/groups/${groupId}`);
      return res.data.data;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load group");
      return null;
    }
  },

  updateGroupInfo: async (groupId, updateData) => {
    set({ isUpdatingGroup: true });

    try {
      const res = await axiosInstance.put(`/groups/${groupId}`, updateData);

      const updatedGroup = res.data.data || res.data;

      set((state) => ({
        //  Update the list sidebar
        groups: state.groups.map((g) => (g._id === groupId ? updatedGroup : g)),
        // Update the active group view
        selectedGroup:
          state.selectedGroup?._id === groupId
            ? updatedGroup
            : state.selectedGroup,
        selectedChat:
          state.selectedChat?._id === groupId
            ? updatedGroup
            : state.selectedChat,

        isUpdatingGroup: false,
      }));

      toast.success("Group updated successfully");
      return updatedGroup;
    } catch (error) {
      console.error("Update Group Error:", error);
      toast.error(error.response?.data?.message || "Failed to update group");
      set({ isUpdatingGroup: false });
      return null;
    }
  },

  addMembersToGroup: async (groupId, memberIds) => {
    set({ isUpdatingGroup: true });
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/add-members`, {
        memberIds,
      });

      const updatedGroup = res.data.data;

      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? updatedGroup : g)),
        selectedGroup:
          state.selectedGroup?._id === groupId
            ? updatedGroup
            : state.selectedGroup,
        isUpdatingGroup: false,
      }));

      toast.success("Members added successfully");
      return true;
    } catch (error) {
      console.error("Add members error:", error);
      toast.error(error.response?.data?.message || "Failed to add members");
      set({ isUpdatingGroup: false });
      return false;
    }
  },

  removeMemberFromGroup: async (groupId, memberId) => {
    set({ isUpdatingGroup: true });

    try {
      const res = await axiosInstance.delete(
        `/groups/${groupId}/remove/${memberId}`
      );
      const updatedGroup = res.data.data || res.data;

      set((state) => ({
        // Update the group in the sidebar list
        groups: state.groups.map((g) => (g._id === groupId ? updatedGroup : g)),
        // If your chat uses selectedChat, update that. If it uses selectedGroup, update that.
        selectedGroup:
          state.selectedGroup?._id === groupId
            ? updatedGroup
            : state.selectedGroup,
        selectedChat:
          state.selectedChat?._id === groupId
            ? updatedGroup
            : state.selectedChat,

        isUpdatingGroup: false,
      }));

      toast.success("Member removed");
      return updatedGroup;
    } catch (error) {
      console.error("Remove member error:", error);
      toast.error(error.response?.data?.message || "Failed to remove member");
      set({ isUpdatingGroup: false });
      return null;
    }
  },

  makeAdmin: async (groupId, memberId) => {
    try {
      const res = await axiosInstance.post(
        `/groups/${groupId}/make-admin/${memberId}`
      );

      const updatedGroup = res.data.data;

      // Update in groups list
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? updatedGroup : g)),
        selectedGroup:
          state.selectedGroup?._id === groupId
            ? updatedGroup
            : state.selectedGroup,
      }));

      toast.success("Admin added successfully");
      return updatedGroup;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to make admin");
      return null;
    }
  },

  leaveGroup: async (groupId) => {
    try {
      await axiosInstance.post(`/groups/${groupId}/leave`);

      // Remove from groups list
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        selectedGroup:
          state.selectedGroup?._id === groupId ? null : state.selectedGroup,
      }));

      toast.success("Left group successfully");
      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to leave group");
      return false;
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);

      // Remove from groups list
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        selectedGroup:
          state.selectedGroup?._id === groupId ? null : state.selectedGroup,
      }));

      toast.success("Group deleted successfully");
      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete group");
      return false;
    }
  },

  getGroupMessages: async (groupId) => {
    if (!groupId) return;

    // Reset state for the new group to prevent seeing old data
    set({
      groupMessages: [],
      isGroupMessagesLoading: true,
    });

    const socket = useAuthStore.getState().socket;

    try {
      //  Join the chat room via socket immediately
      if (socket) {
        socket.emit("joinChat", groupId);
      }

      const res = await axiosInstance.get(`/messages/group/${groupId}`);

      //  Normalize data (handling different possible response structures)
      const rawMessages = res.data?.messages || res.data?.data || [];

      const normalized = Array.isArray(rawMessages)
        ? rawMessages.map((m) => ({
            ...m,
            reactions: m.reactions || [],
            replyTo: m.replyTo || null,
          }))
        : [];

      set({ groupMessages: normalized });
    } catch (error) {
      console.error("Store Fetch Error:", error);
      set({ groupMessages: [] });
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async ({ text, image, replyTo, overrideId = null }) => {
    const { selectedGroup, groupMessages, groups, updateGroupWithNewMessage } =
      get();
    const { authUser } = useAuthStore.getState();

    // Determine Target (Forwarding vs. Current Chat)
    const targetGroupId = overrideId || selectedGroup?._id;
    const isForwarding = !!overrideId;

    if (!targetGroupId) return toast.error("No group selected.");

    //  Permission Check (Only if we have group data available)
    // If forwarding, we might not have 'selectedGroup' settings, so we let the backend handle it
    if (!isForwarding && selectedGroup) {
      const isCreator =
        selectedGroup.createdBy === authUser._id ||
        selectedGroup.createdBy?._id === authUser._id;
      const isAdmin = selectedGroup.admins?.some(
        (admin) => (admin._id || admin) === authUser._id
      );
      const onlyAdminsCanSend = selectedGroup.settings?.onlyAdminsCanSend;

      if (onlyAdminsCanSend && !isCreator && !isAdmin) {
        return toast.error("Only admins can send messages in this group.");
      }
    }

    //  Optimistic UI Logic (SKIP IF FORWARDING)
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    if (!isForwarding) {
      const optimisticMessage = {
        _id: tempId,
        senderId: {
          _id: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic,
        },
        groupId: targetGroupId,
        text,
        image,
        replyTo: replyTo || null,
        reactions: [],
        createdAt: new Date().toISOString(),
      };

      set({ groupMessages: [...groupMessages, optimisticMessage] });

      // Update Sidebar
      const existingIndex = groups.findIndex((g) => g._id === targetGroupId);
      if (existingIndex !== -1) {
        const updatedGroups = [...groups];
        updatedGroups[existingIndex] = {
          ...updatedGroups[existingIndex],
          lastMessage: optimisticMessage,
        };
        const [movedGroup] = updatedGroups.splice(existingIndex, 1);
        updatedGroups.unshift(movedGroup);
        set({ groups: updatedGroups });
      }
    }

    //  API Call
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
        `/messages/group/${targetGroupId}/send`,
        payload
      );

      //  Success Logic (Only update UI if NOT forwarding)
      if (res.data?.data) {
        if (!isForwarding) {
          set((state) => ({
            groupMessages: state.groupMessages.map((msg) =>
              msg._id === tempId
                ? {
                    ...res.data.data,
                    reactions: [],
                    replyTo: res.data.data.replyTo || null,
                  }
                : msg
            ),
          }));
          updateGroupWithNewMessage(res.data.data);
        } else {
          // If forwarding, we just update the sidebar of the group we sent it to
          updateGroupWithNewMessage(res.data.data);
        }
      }
      return res.data.data;
    } catch (error) {
      if (!isForwarding) set({ groupMessages, groups });
      toast.error(error.response?.data?.message || "Failed to forward message");
      throw error;
    }
  },
  updateGroupWithNewMessage: (msg) => {
    //  If this is a private message (no groupId), stop immediately.
    if (!msg.groupId) return;

    const { groups } = get();
    const groupId = msg.groupId;

    const existingIndex = groups.findIndex((g) => g._id === groupId);

    // If the group doesn't exist in our list, we don't update it (prevents ghost groups)
    if (existingIndex === -1) return;

    const updatedGroup = {
      ...groups[existingIndex],
      lastMessage: msg,
    };

    let updatedGroups = [...groups];
    updatedGroups.splice(existingIndex, 1);
    updatedGroups.unshift(updatedGroup);

    set({ groups: updatedGroups });
  },

  markGroupMessagesAsSeen: async (groupId) => {
    if (!groupId) return;
    const { groupMessages, groupUnreadCounts } = get();
    const { authUser, socket } = useAuthStore.getState();

    // ONLY mark as read if there are actual unread messages from OTHERS
    const hasUnread = groupMessages.some(
      (m) =>
        (m.senderId?._id || m.senderId) !== authUser._id &&
        !m.seenBy?.includes(authUser._id)
    );

    if (!hasUnread && (groupUnreadCounts[groupId] || 0) === 0) return;

    try {
      set((state) => ({
        groupMessages: state.groupMessages.map((m) => {
          const sId = m.senderId?._id || m.senderId;
          if (sId !== authUser._id) {
            return {
              ...m,
              seenBy: [...new Set([...(m.seenBy || []), authUser._id])],
            };
          }
          return m;
        }),
        groupUnreadCounts: { ...state.groupUnreadCounts, [groupId]: 0 },
        groups: state.groups.map((g) =>
          g._id === groupId ? { ...g, unreadCount: 0 } : g
        ),
      }));

      await axiosInstance.put(`/messages/group/${groupId}/read`);
      if (socket)
        socket.emit("markGroupRead", { groupId, userId: authUser._id });
    } catch (error) {
      console.error("Error:", error);
    }
  },

  updateGroupUnreadCount: (groupId, count) => {
    set((state) => ({
      groupUnreadCounts: {
        ...state.groupUnreadCounts,
        [groupId]: count,
      },

      groups: state.groups.map((group) =>
        group._id === groupId ? { ...group, unreadCount: count } : group
      ),
    }));
  },
  setGroupTypingStatus: (groupId, userId, isTyping, userName) => {
    if (!groupId) return;

    set((state) => {
      const currentTypers = state.groupTypingUsers[groupId] || [];

      let updatedTypers;
      if (isTyping) {
        const exists = currentTypers.some((u) => u.userId === userId);
        updatedTypers = exists
          ? currentTypers
          : [...currentTypers, { userId, userName }];
      } else {
        updatedTypers = currentTypers.filter((u) => u.userId !== userId);
      }

      return {
        groupTypingUsers: {
          ...state.groupTypingUsers,
          [groupId]: updatedTypers,
        },
      };
    });
  },

  joinGroupRoom: (groupId) => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.emit("joinGroup", groupId);
    }
  },

  leaveGroupRoom: (groupId) => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.emit("leaveGroup", groupId);
    }
  },

  subscribeToGroupEvents: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) {
      console.log("No socket available in subscribeToGroupEvents");
      return;
    }
    socket.off("newGroupMessage");
    socket.off("group:created");
    socket.off("group:updated");
    socket.off("group:membersAdded");
    socket.off("group:memberRemoved");
    socket.off("group:memberLeft");
    socket.off("group:adminAdded");
    socket.off("group:deleted");
    socket.off("groupMessageReadUpdate");
    socket.off("userTyping");
    socket.off("userStopTyping");
    socket.off("message:deleted");
    socket.off("message:reactionUpdated");
    socket.off("message:deletedForMe");
    socket.off("messages:bulkDeleted");

    console.log("Setting up clean group event listeners");

    socket.on("newGroupMessage", (msg) => {
      const {
        selectedGroup,
        groupMessages,
        updateGroupWithNewMessage,
        groupUnreadCounts,
        updateGroupUnreadCount,
      } = get();
      const { authUser } = useAuthStore.getState();

      if (!msg.groupId) return;

      const senderId = msg.senderId?._id || msg.senderId;
      if (senderId === authUser?._id) return;

      const isMessageForCurrentGroup = selectedGroup?._id === msg.groupId;
      const isPageVisible = !document.hidden;

      //  Add message to the list if the group is open
      if (isMessageForCurrentGroup) {
        const exists = groupMessages.some((m) => m._id === msg._id);
        if (!exists) {
          set((state) => ({
            groupMessages: [
              ...state.groupMessages,
              {
                ...msg,
                reactions: msg.reactions || [],
                replyTo: msg.replyTo || null,
              },
            ],
          }));
        }
      }

      if (!isMessageForCurrentGroup || !isPageVisible) {
        const currentCount = groupUnreadCounts[msg.groupId] || 0;
        updateGroupUnreadCount(msg.groupId, currentCount + 1);
      } else {
        // If the group is open AND visible, we don't increment.
        // We can also optionally trigger the "read" API immediately here.
        get().markGroupMessagesAsSeen(msg.groupId);
      }

      updateGroupWithNewMessage(msg);
    });

    socket.on("group:created", (group) => {
      set((state) => {
        //  Check if group already exists (prevents duplicates)
        const groupExists = state.groups.some((g) => g._id === group._id);

        if (groupExists) {
          console.log("Group already exists, skipping");
          return state; // Return unchanged state
        }
        return {
          groups: [group, ...state.groups],
        };
      });

      // Auto-join the group room
      socket.emit("joinGroup", group._id);
      toast.success(`You were added to "${group.groupName}"`);
    });

    socket.on("group:updated", (updatedGroup) => {
      const { authUser } = useAuthStore.getState();
      const currentSelectedGroup = get().selectedGroup;
      const currentSelectedChat = get().selectedChat;

      const isStillMember = updatedGroup.members.some(
        (m) => (m._id || m).toString() === authUser._id.toString()
      );

      set((state) => {
        // Check if group exists in our list
        const groupExists = state.groups.some(
          (g) => g._id === updatedGroup._id
        );

        // If not a member anymore, remove it
        if (!isStillMember) {
          return {
            groups: state.groups.filter((g) => g._id !== updatedGroup._id),
            selectedGroup:
              currentSelectedGroup?._id === updatedGroup._id
                ? null
                : currentSelectedGroup,
            selectedChat:
              currentSelectedChat?._id === updatedGroup._id
                ? null
                : currentSelectedChat,
          };
        }

        //  If group exists, update it
        if (groupExists) {
          return {
            groups: state.groups.map((g) =>
              g._id === updatedGroup._id ? updatedGroup : g
            ),
            selectedGroup:
              currentSelectedGroup?._id === updatedGroup._id
                ? updatedGroup
                : currentSelectedGroup,
            selectedChat:
              currentSelectedChat?._id === updatedGroup._id
                ? updatedGroup
                : currentSelectedChat,
          };
        }

        // If group doesn't exist but we're a member (shouldn't happen with proper backend)
        return {
          groups: [updatedGroup, ...state.groups],
          selectedGroup: currentSelectedGroup,
          selectedChat: currentSelectedChat,
        };
      });
    });

    socket.on("group:membersAdded", ({ group }) => {
      set((state) => ({
        groups: state.groups.map((g) => (g._id === group._id ? group : g)),
        selectedGroup:
          state.selectedGroup?._id === group._id ? group : state.selectedGroup,
      }));
    });

    socket.on("group:memberRemoved", ({ groupId, removedMemberId, group }) => {
      const { authUser } = useAuthStore.getState();

      if (removedMemberId === authUser._id) {
        set((state) => ({
          groups: state.groups.filter((g) => g._id !== groupId),
          selectedGroup:
            state.selectedGroup?._id === groupId ? null : state.selectedGroup,
        }));
        toast.error("You were removed from the group");
      } else {
        set((state) => ({
          groups: state.groups.map((g) => (g._id === groupId ? group : g)),
          selectedGroup:
            state.selectedGroup?._id === groupId ? group : state.selectedGroup,
        }));
      }
    });

    socket.on("group:memberLeft", ({ groupId, group }) => {
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? group : g)),
        selectedGroup:
          state.selectedGroup?._id === groupId ? group : state.selectedGroup,
      }));
    });

    socket.on("group:adminAdded", ({ groupId, group }) => {
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? group : g)),
        selectedGroup:
          state.selectedGroup?._id === groupId ? group : state.selectedGroup,
      }));
    });

    socket.on("group:deleted", ({ groupId }) => {
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        selectedGroup:
          state.selectedGroup?._id === groupId ? null : state.selectedGroup,
      }));
      toast.error("Group was deleted");
    });

    socket.on(
      "groupMessageReadUpdate",
      ({ groupId: incomingGroupId, userId }) => {
        const { selectedGroup } = get();
        if (selectedGroup?._id === incomingGroupId) {
          set((state) => ({
            groupMessages: state.groupMessages.map((m) => {
              if (!m.seenBy.includes(userId)) {
                return { ...m, seenBy: [...m.seenBy, userId] };
              }
              return m;
            }),
          }));
        }
      }
    );

    socket.on("userTyping", ({ chatId, userId, userName, isGroup }) => {
      if (isGroup) {
        get().setGroupTypingStatus(chatId, userId, true, userName);
      }
    });

    socket.on("userStopTyping", ({ chatId, userId, isGroup }) => {
      if (isGroup) {
        get().setGroupTypingStatus(chatId, userId, false);
      }
    });

    socket.on("message:deleted", ({ messageId, groupId }) => {
      if (!groupId) return;

      set((state) => ({
        groupMessages: state.groupMessages.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, text: null, image: null }
            : m
        ),
        groups: state.groups.map((group) => {
          if (group._id === groupId && group.lastMessage?._id === messageId) {
            return {
              ...group,
              lastMessage: {
                ...group.lastMessage,
                isDeleted: true,
                text: null,
                image: null,
              },
            };
          }
          return group;
        }),
      }));
    });

    socket.on(
      "message:reactionUpdated",
      ({ messageId, reactions, groupId }) => {
        if (!groupId) return;

        set((state) => ({
          groupMessages: state.groupMessages.map((m) =>
            m._id === messageId ? { ...m, reactions: reactions || [] } : m
          ),
        }));
      }
    );

    socket.on("message:deletedForMe", ({ messageId }) => {
      set((state) => ({
        groupMessages: state.groupMessages.filter((m) => m._id !== messageId),
      }));
    });

    socket.on("messages:bulkDeleted", ({ messageIds, groupId }) => {
      if (!groupId) return;

      set((state) => ({
        groupMessages: state.groupMessages.filter(
          (m) => !messageIds.includes(m._id)
        ),
        groups: state.groups.map((g) => {
          if (g._id === groupId && messageIds.includes(g.lastMessage?._id)) {
            return { ...g, lastMessage: null };
          }
          return g;
        }),
      }));
    });
  },

  unsubscribeFromGroupEvents: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.off("newGroupMessage");
    socket.off("group:created");
    socket.off("group:updated");
    socket.off("group:membersAdded");
    socket.off("group:memberRemoved");
    socket.off("group:memberLeft");
    socket.off("group:adminAdded");
    socket.off("group:deleted");
    socket.off("groupMessageReadUpdate");
    socket.off("userTyping");
    socket.off("userStopTyping");
    socket.off("message:deleted");
    socket.off("message:reactionUpdated");
    socket.off("message:deletedForMe");
    socket.off("messages:bulkDeleted");
  },
});
