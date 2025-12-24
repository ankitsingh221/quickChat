import React from "react";
import MessageItem from "./MessageItem";

const formatHeaderDate = (date) => {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) return "Today";
  if (messageDate.toDateString() === yesterday.toDateString()) return "Yesterday";
  return messageDate.toLocaleDateString("en-GB"); 
};

const MessageList = ({ messages, authUser, selectedUser, selectedGroup, messageActions, setSelectedImg }) => {
  return (
    <>
      {messages.map((msg, index) => {
        // FIX: Extract the ID string safely. 
        // Checks msg.senderId._id (for groups) first, falls back to msg.senderId (for private).
        const senderIdStr = msg.senderId?._id || msg.senderId;
        const isMe = senderIdStr?.toString() === authUser?._id?.toString();
        
        const currentDateLabel = formatHeaderDate(msg.createdAt);
        const previousMessage = messages[index - 1];
        const previousDateLabel = previousMessage ? formatHeaderDate(previousMessage.createdAt) : null;
        
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
              selectedGroup={selectedGroup}
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