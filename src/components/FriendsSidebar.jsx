import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import axios from "axios";
import AddFriendButton from "./AddFriendButton";
import FriendsTitle from "./FriendsTitle";
import FriendsList from "./FriendsList";
import PendingInvitationsList from "./PendingInvitationsList";
import { Menu, MenuItem, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const MainContainer = styled("div")({
  width: "224px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "#2F3136",
});

const ServersList = styled("div")({
  width: "100%",
  padding: "10px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  color: "white",
});

const ServerItemContainer = styled("div")({
  width: "90%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#3A3C43",
  borderRadius: "5px",
  margin: "5px 0",
  padding: "8px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#4A4C53",
  },
});

const ServerName = styled("div")({
  flexGrow: 1,
  textAlign: "center",
});

const FriendsSidebar = () => {
  const navigate = useNavigate();
  const [servers, setServers] = useState([]);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedServerId, setSelectedServerId] = useState(null);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token || token === "undefined") {
        setError("Unauthorized. Please log in.");
        navigate("/login");
        return;
      }

      try {
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) throw new Error("Invalid token format");

        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setError("Session expired. Please log in again.");
          navigate("/login");
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [serverResponse, friendsResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/v1/servers", config),
          axios.get("http://localhost:5000/api/v1/friends", config),
        ]);

        setServers(serverResponse.data);
        setFriends(friendsResponse.data.friends);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to fetch data. Please try again.");
      }
    };

    fetchData();
  }, [navigate]);

  const handleServerClick = (serverId) => {
    navigate(`/server/${serverId}/stream`);
  };

  const handleAddClick = (event, serverId) => {
    setSelectedServerId(serverId);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedServerId(null);
  };

  const handleInvite = async (friendId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/v1/servers/${selectedServerId}/invite`,
        { userId: friendId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      handleCloseMenu();
    } catch (error) {
      console.error("Failed to invite friend:", error);
      if (error.response && error.response.data) {
        alert(`Invite failed: ${error.response.data.message}`);
      } else {
        alert("Something went wrong while sending the invite.");
      }
    }
  };

  // ✅ Get current server members to filter invite list
  const currentServer = servers.find((s) => s._id === selectedServerId);
  const currentMembers = currentServer?.members || [];
  const inviteableFriends = friends.filter(
    (friend) => !currentMembers.includes(friend._id)
  );

  return (
    <MainContainer>
      <AddFriendButton />
      <FriendsTitle title="Private Messages" />
      <FriendsList />
      <FriendsTitle title="Servers" />
      <ServersList>
        {error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : servers.length > 0 ? (
          servers.map((server) => (
            <ServerItemContainer key={server._id}>
              <ServerName onClick={() => handleServerClick(server._id)}>
                {server.name}
              </ServerName>
              <IconButton size="small" onClick={(e) => handleAddClick(e, server._id)}>
                <AddIcon style={{ color: "white" }} />
              </IconButton>
            </ServerItemContainer>
          ))
        ) : (
          <p>No servers found</p>
        )}
      </ServersList>
      <FriendsTitle title="Invitations" />
      <PendingInvitationsList />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {/* ✅ Use only friends who are not already in the server */}
        {inviteableFriends.length > 0 ? (
          inviteableFriends.map((friend) => (
            <MenuItem key={friend._id} onClick={() => handleInvite(friend._id)}>
              {friend.username}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No friends to invite</MenuItem>
        )}
      </Menu>
    </MainContainer>
  );
};

export default FriendsSidebar;
