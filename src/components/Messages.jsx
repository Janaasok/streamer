import React from "react";
import { styled } from "@mui/system";
import MessagesHeader from "./MessagesHeader";
import { connect } from "react-redux";
import Message from "./Message";
import DateSeparator from "./DateSeparator";

const MainContainer = styled("div")({
  height: "calc(100% - 60px)",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "10px 0",
  
  "& > div": {
    width: "80%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#b0b0b0",
    borderRadius: "6px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#2f3136",
  },
});

const Messages = ({ chosenChatDetails, messages }) => {
  return (
    <MainContainer>
      <MessagesHeader name={chosenChatDetails?.name} />
      {messages.map((message, index) => {
        const sameAuthor =
          index > 0 &&
          messages[index].author._id === messages[index - 1].author._id;
        const sameDay =
          index > 0 &&
          new Date(message.date).toDateString() ===
            new Date(messages[index - 1].date).toDateString();
        
        return (
          <div key={message._id}>
            {!sameDay && (
              <DateSeparator date={new Date(message.date).toDateString()} />
            )}
            <Message
              content={message.content}
              username={message.author.username}
              sameAuthor={sameAuthor}
              date={new Date(message.date).toLocaleTimeString()}
              sameDay={sameDay}
              isSender={message.isSender}
              fileUrl={message.fileUrl}
              fileType={message.fileType}
              fileName={message.fileName}
              isImage={message.isImage}
            />
          </div>
        );
      })}
    </MainContainer>
  );
};

const mapStoreStateToProps = ({ chat }) => {
  return { ...chat };
};

export default connect(mapStoreStateToProps)(Messages);