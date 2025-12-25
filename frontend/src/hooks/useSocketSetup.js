import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

export const useSocketSetup = () => {
  const { socket, authUser } = useAuthStore();
  const { 
    subscribeToMessages, 
    subscribeToGroupEvents,
    unsubscribeFromMessages,
    unsubscribeFromGroupEvents
  } = useChatStore();

  console.log(" useSocketSetup - socket:", socket?.connected);
  console.log(" useSocketSetup - authUser:", authUser?._id);
  console.log(" useSocketSetup - subscribeToMessages:", typeof subscribeToMessages);
  console.log(" useSocketSetup - subscribeToGroupEvents:", typeof subscribeToGroupEvents);

  useEffect(() => {
    if (!socket || authUser) {
      return;
    }
    
    
    if (subscribeToMessages) {
      console.log(" Calling subscribeToMessages");
      subscribeToMessages();
    }
    
    if (subscribeToGroupEvents) {
      console.log(" Calling subscribeToGroupEvents");
      subscribeToGroupEvents();
    }

    return () => {
      console.log("🌐Cleaning up global socket listeners");
      unsubscribeFromMessages?.();
      unsubscribeFromGroupEvents?.();
    };
  }, [
    socket, 
    authUser, 
    subscribeToMessages, 
    subscribeToGroupEvents,
    unsubscribeFromMessages,
    unsubscribeFromGroupEvents
  ]);
};