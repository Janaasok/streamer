import React, { useState } from "react";
import { Tooltip, Typography, Box } from "@mui/material";
import Avatar from "./Avatar";
import InvitationDecisionButtons from "./InvitationDecisionButtons";
import { connect } from "react-redux";
import { getActions as getServerActions } from "../app/actions/serversActions";
import { getActions as getFriendActions } from "../app/actions/friendsActions";

const PendingInvitationsListItem = ({
  id,
  username,
  email,
  serverName,
  type,
  acceptFriendInvitation = () => {},
  rejectFriendInvitation = () => {},
  acceptServerInvitation = () => {},
  rejectServerInvitation = () => {},
}) => {
  const [buttonsDisabled, setButtonsDisabled] = useState(false);

  const handleAcceptInvitation = () => {
    if (type === "friend") {
      acceptFriendInvitation({ id });
    } else if (type === "server") {
      acceptServerInvitation({ id });
    }
    setButtonsDisabled(true);
  };

  const handleRejectInvitation = () => {
    if (type === "friend") {
      rejectFriendInvitation({ id });
    } else if (type === "server") {
      rejectServerInvitation({ id });
    }
    setButtonsDisabled(true);
  };

  return (
    <Tooltip title={email}>
      <div style={{ width: "100%" }}>
        <Box
          sx={{
            width: "100%",
            height: "42px",
            marginTop: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Avatar username={username} />
          <Typography
            sx={{
              marginLeft: "7px",
              fontWeight: 700,
              color: "#8e9297",
              flexGrow: 1,
            }}
            variant="subtitle1"
          >
            {type === "friend" ? username : `${username} invited you to ${serverName}`}
          </Typography>
          <InvitationDecisionButtons
            disabled={buttonsDisabled}
            acceptInvitationHandler={handleAcceptInvitation}
            rejectInvitationHandler={handleRejectInvitation}
          />
        </Box>
      </div>
    </Tooltip>
  );
};

const mapActionsToProps = (dispatch) => {
  return {
    ...getFriendActions(dispatch),
    ...getServerActions(dispatch),
  };
};

export default connect(null, mapActionsToProps)(PendingInvitationsListItem);