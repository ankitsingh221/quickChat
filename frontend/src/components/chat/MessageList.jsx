import React from "react";
import MessageItem from "./MessageItem";

const MessageList = ({ messages, authUser, selectedUser, messageActions, setSelectedImg }) => {
  return (
    <>
      {messages.map((msg) => {
        const isMe = msg.senderId.toString() === authUser._id.toString();

        return (
          <MessageItem
            key={msg._id}
            msg={msg}
            isMe={isMe}
            authUser={authUser}
            selectedUser={selectedUser}
            messageActions={messageActions}
            setSelectedImg={setSelectedImg}
          />
        );
      })}
    </>
  );
};

export default MessageList;