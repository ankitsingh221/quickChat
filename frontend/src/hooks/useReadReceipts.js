import { useEffect, useRef } from "react";

const useReadReceipts = (
  selectedUser,
  messages,
  markMessagesAsRead,
  getMessagesByUserId
) => {
  const isMarkingAsRead = useRef(false);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessagesByUserId(selectedUser._id);
      isMarkingAsRead.current = false;
    }
  }, [selectedUser?._id, getMessagesByUserId]);

  useEffect(() => {
    if (!selectedUser?._id || messages.length === 0) return;

    const handleMarkAsRead = () => {
      const isWindowFocused = document.hasFocus();
      const isPageVisible = !document.hidden;

      const unreadMessages = messages.filter((msg) => {
        const senderId = msg.senderId?._id || msg.senderId; 
        return senderId === selectedUser._id && !msg.seen;
      });
      if (
        unreadMessages.length > 0 &&
        !isMarkingAsRead.current &&
        isWindowFocused &&
        isPageVisible
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
    document.addEventListener("visibilitychange", handleMarkAsRead);

    return () => {
      window.removeEventListener("focus", handleMarkAsRead);
      document.removeEventListener("visibilitychange", handleMarkAsRead);
    };
  }, [messages, selectedUser?._id, markMessagesAsRead]);
};

export default useReadReceipts;
