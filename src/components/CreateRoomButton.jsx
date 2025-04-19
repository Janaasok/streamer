import React, { useState } from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom"; // Navigation for game mode
import * as roomHandler from "../socket/roomHandler.js";

const CreateRoomButton = ({ isUserInRoom }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  // Open dialog when button is clicked
  const handleClick = () => {
    setOpenDialog(true);
  };

  // Create a video room
  const handleVideoRoom = () => {
    setOpenDialog(false);
    roomHandler.createNewRoom();
  };

  // Navigate to game selection page
  const handleGame = () => {
    setOpenDialog(false);
    navigate("/game"); // Redirect to the game page
  };

  return (
    <>
      {/* Room Creation Button */}
      <Button
        disabled={isUserInRoom}
        onClick={handleClick}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "16px",
          margin: 0,
          padding: 0,
          minWidth: 0,
          marginTop: "10px",
          color: "white",
          backgroundColor: "#5865f2",
        }}
      >
        <AddIcon />
      </Button>

      {}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Select an Option</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Do you want to start a <b>Video Room</b> or <b>Play a Game</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVideoRoom} color="primary" variant="contained">
            Join Video Room
          </Button>
          <Button onClick={handleGame} color="secondary" variant="contained">
            Play Game
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateRoomButton;
