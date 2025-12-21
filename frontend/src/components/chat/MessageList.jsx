import React from "react";
import MessageItem from "./MessageItem";

// Helper function to format the date label
const formatHeaderDate = (date) => {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return messageDate.toLocaleDateString("en-GB"); // Returns DD/MM/YYYY
};

const MessageList = ({ messages, authUser, selectedUser, messageActions, setSelectedImg }) => {
  return (
    <>
      {messages.map((msg, index) => {
        const isMe = msg.senderId.toString() === authUser._id.toString();
        
        // Calculate if we need to show a date separator
        const currentDateLabel = formatHeaderDate(msg.createdAt);
        const previousMessage = messages[index - 1];
        const previousDateLabel = previousMessage ? formatHeaderDate(previousMessage.createdAt) : null;
        
        // Show separator if it's the first message or the date has changed
        const showSeparator = currentDateLabel !== previousDateLabel;

        return (
          <React.Fragment key={msg._id}>
            {showSeparator && (
              <div className="flex items-center justify-center my-6">
                <div className="h-[1px] bg-slate-800 flex-grow max-w-[10%]"></div>
                <span className="mx-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                  {currentDateLabel}
                </span>
                <div className="h-[1px] bg-slate-800 flex-grow max-w-[10%]"></div>
              </div>
            )}
            
            <MessageItem
              msg={msg}
              isMe={isMe}
              authUser={authUser}
              selectedUser={selectedUser}
              messageActions={messageActions}
              setSelectedImg={setSelectedImg}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

export default MessageList;