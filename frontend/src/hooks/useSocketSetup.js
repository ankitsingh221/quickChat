import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

export const useSocketSetup = () => {
  const { socket, authUser } = useAuthStore();
  const {
    subscribeToMessages,
    subscribeToGroupEvents,
    unsubscribeFromMessages,
    unsubscribeFromGroupEvents,
  } = useChatStore();

  useEffect(() => {
    if (!socket || !authUser) {
      return;
    }
    // Ensure we only subscribe once the socket is actually connected
    const handleConnect = () => {
      subscribeToMessages?.();
      subscribeToGroupEvents?.();
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    return () => {
      socket.off("connect", handleConnect);
      unsubscribeFromMessages?.();
      unsubscribeFromGroupEvents?.();
    };
  }, [socket, authUser, subscribeToMessages, subscribeToGroupEvents]);
};
