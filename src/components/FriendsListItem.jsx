import React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { connect } from "react-redux";

import Avatar from "./Avatar";
import OnlineIndicator from "./OnlineIndicator";
import { chatTypes, getActions } from "../app/actions/chatActions.js";

const FriendsListItem = ({ id, username, isOnline, setChosenChatDetails }) => {
  const handleChooseActiveConversation = () => {
    setChosenChatDetails({ id: id, name: username }, chatTypes.DIRECT);
  };

  return (
    <Button
      onClick={handleChooseActiveConversation}
      aria-label={`Start chat with ${username}`}
      style={{
        width: "100%",
        height: "48px",
        marginTop: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        textTransform: "none",
        color: "black",
        backgroundColor: isOnline ? "#f0fdf4" : "transparent", // subtle highlight if online
        borderRadius: "8px",
        paddingLeft: "10px",
        paddingRight: "10px",
        transition: "background-color 0.2s ease-in-out",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "100%",
        }}
      >
        <Avatar username={username} />
        <Typography
          variant="subtitle1"
          style={{
            fontWeight: 700,
            color: "#4b5563",
            flexGrow: 1,
          }}
        >
          {username}
        </Typography>
        {isOnline && <OnlineIndicator />}
      </div>
    </Button>
  );
};

// Map actions to props
const mapActionsToProps = (dispatch) => {
  return {
    ...getActions(dispatch),
  };
};

// Export wrapped with connect and memo for performance
export default connect(null, mapActionsToProps)(React.memo(FriendsListItem));
