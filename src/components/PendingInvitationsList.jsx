import React from "react";
import { styled } from "@mui/system";
import PendingInvitationsListItem from "./PendingInvitationsListItem";
import { connect } from "react-redux";

const MainContainer = styled("div")({
  width: "100%",
  height: "22%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  overflow: "auto",
});

const PendingInvitationsList = ({ pendingFriendsInvitations, pendingServerInvitations }) => {
  return (
    <MainContainer>
      {/* Friend Invitations */}
      {pendingFriendsInvitations?.map((invitation) => (
        <PendingInvitationsListItem
          key={invitation._id}
          id={invitation._id}
          username={invitation.senderId.username}
          email={invitation.senderId.email}
          type="friend"
        />
      ))}

      {/* Server Invitations */}
      {pendingServerInvitations?.map((invitation) => (
        <PendingInvitationsListItem
          key={invitation._id}
          id={invitation._id}
          username={invitation.senderId.username}
          email={invitation.senderId.email}
          serverName={invitation.serverId.name}
          type="server"
        />
      ))}
    </MainContainer>
  );
};

const mapStoreStateToProps = ({ friends, servers }) => {
  return {
    pendingFriendsInvitations: friends.pendingFriendsInvitations,
    pendingServerInvitations: servers.pendingServerInvitations,
  };
};

export default connect(mapStoreStateToProps)(PendingInvitationsList);