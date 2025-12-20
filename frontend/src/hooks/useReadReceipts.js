import { useEffect, useRef } from "react";

const useReadReceipts = (
  selectedUser,
  messages,
  markMessagesAsRead,
  getMessagesByUserId,
  subscribeToMessages,
  unsubscribeFromMessages
) => {
  const isMarkingAsRead = useRef(false);

  // EFFECT 1: Fetch messages and subscribe
  useEffect(() => {
    if (selectedUser?._id) {
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();
      isMarkingAsRead.current = false;
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  // EFFECT 2: The "Smart" Read Receipt Logic
  useEffect(() => {
    if (!selectedUser?._id || messages.length === 0) return;

    const handleMarkAsRead = () => {
      const lastMsg = messages[messages.length - 1];
      const isWindowFocused = document.hasFocus();

      if (
        lastMsg.senderId === selectedUser._id &&
        !lastMsg.seen &&
        !isMarkingAsRead.current &&
        isWindowFocused
      ) {
        isMarkingAsRead.current = true;

        markMessagesAsRead(selectedUser._id).finally(() => {
          setTimeout(() => {
            isMarkingAsRead.current = false;
          }, 500);
        });
      }
    };

    handleMarkAsRead();
    window.addEventListener("focus", handleMarkAsRead);

    return () => window.removeEventListener("focus", handleMarkAsRead);
  }, [messages, selectedUser?._id, markMessagesAsRead]);
};

export default useReadReceipts;