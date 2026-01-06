import { create } from "zustand";
import { io } from "socket.io-client";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,

  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });

      get().connectSocket();
    } catch (err) {
      console.error("Auth check failed:", err);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });

      get().connectSocket();

      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });

      get().connectSocket();

      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");

      get().disconnectSocket();
      set({ authUser: null });

      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
    }
  },

  updateProfile: async (data) => {

    const previousData = get().authUser || {};
    set({
      authUser:{...previousData, ...data},
      isUpdatingProfile: true,
    })
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });

      toast.success("Profile updated successfully");
    } catch (error) {
      set({ authUser: previousData });
       toast.error("Update failed. Please try again.",error)
    }
    finally{
      set({isUpdatingProfile: false});
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log(" Socket connected");

      import("./useChatStore").then(({ useChatStore }) => {
        console.log("🔌 Setting up chat socket listeners");

        useChatStore.getState().getMyChatPartners();
        useChatStore.getState().subscribeToMessages();
      });
    });

    newSocket.on("disconnect", () => {
      console.log(" Socket disconnected");
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (!socket) return;

    import("./useChatStore").then(({ useChatStore }) => {
      useChatStore.getState().unsubscribeFromMessages();
    });

    socket.off("getOnlineUsers");
    socket.disconnect();

    set({ socket: null, onlineUsers: [] });
  },
}));
