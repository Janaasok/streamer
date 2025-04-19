import React from "react";
import { styled } from "@mui/system";
import Avatar from "./Avatar";
import Typography from "@mui/material/Typography";
import Fade from "@mui/material/Fade";

const MainContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  padding: "10px",
  width: "100%",
  animation: "fadeIn 0.3s ease-in-out",
}));

const MessageBubble = styled("div")(({ theme }) => ({
  maxWidth: "65%",
  padding: "12px 16px",
  borderRadius: "18px",
  color: "#FFF",
  fontSize: "14px",
  lineHeight: "1.6",
  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  position: "relative",
  textAlign: "left",
  wordWrap: "break-word",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.02)",
  },
}));

const MessageMeta = styled("span")({
  fontSize: "12px",
  color: "#B9BBBE",
  marginTop: "5px",
});

const Message = ({ content, sameAuthor, username, date, sameDay, isSender }) => {
  return (
    <Fade in timeout={300}>
      <MainContainer style={{ justifyContent: isSender ? "flex-end" : "flex-start" }}>
        {!sameAuthor && !isSender && <Avatar username={username} />}
        <div>
          {!sameAuthor && (
            <Typography style={{ fontSize: "14px", color: "white", fontWeight: "bold" }}>
              {username} <MessageMeta>{date}</MessageMeta>
            </Typography>
          )}
          <MessageBubble style={{ backgroundColor: isSender ? "#7289DA" : "#36393F" }}>
            {content}
          </MessageBubble>
        </div>
      </MainContainer>
    </Fade>
  );
};

export default Message;
