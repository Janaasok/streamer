import React, { useEffect, useState } from "react";
import { styled } from "@mui/system";
import { connect } from "react-redux";

// Redux actions
import { getActions } from "../../app/actions/authActions";

// Socket
import { connectWithSocketServer } from "../../socket/socketConnection";

// Components
import { SideBar, FriendsSidebar, Messenger, AppBar, Room } from "../../components";
import Game from "../../components/game/Game";

// Utilities
import logout from "../../utils/logout";

// Styled Components
const Wrapper = styled("div")({
  width: "100%",
  height: "100vh",
  display: "flex",
  backgroundColor: "#36393f", // Modern dark background
  color: "#ffffff", // White text
  position: "relative",
});

const GameOverlay = styled("div")({
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#2f3136",
  padding: "20px",
  borderRadius: "10px",
  zIndex: 1000,
  boxShadow: "0 0 15px rgba(0, 0, 0, 0.6)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const CloseButton = styled("button")({
  marginTop: "15px",
  padding: "10px 20px",
  backgroundColor: "#7289da",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
  "&:hover": {
    backgroundColor: "#677bc4",
  },
});

const Dashboard = ({ setUserDetails, isUserInRoom }) => {
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      logout(); // Redirect to login or clear session
    } else {
      const userDetails = JSON.parse(storedUser);
      setUserDetails(userDetails);
      connectWithSocketServer(userDetails);
    }
  }, [setUserDetails]);

  const toggleGame = () => setShowGame((prev) => !prev);

  return (
    <Wrapper>
      {/* Left-side navigation */}
      <SideBar onGameClick={toggleGame} />

      {/* Friends and messenger */}
      <FriendsSidebar />
      <Messenger />

      {/* Top navigation */}
      <AppBar />

      {/* Voice/Video Room */}
      {isUserInRoom && <Room />}

      {/* Game Overlay */}
      {showGame && (
        <GameOverlay>
          <Game />
          <CloseButton onClick={toggleGame}>Close Game</CloseButton>
        </GameOverlay>
      )}
    </Wrapper>
  );
};

// Map Redux state
const mapStoreStateToProps = ({ room }) => ({
  isUserInRoom: room.isUserInRoom,
});

// Map Redux actions
const mapActionsToProps = (dispatch) => ({
  ...getActions(dispatch),
});

// Export connected component
export default connect(mapStoreStateToProps, mapActionsToProps)(Dashboard);
