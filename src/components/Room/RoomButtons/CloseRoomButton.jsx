import React from "react";
import { useSelector } from "react-redux";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import * as roomHandler from "../../../socket/roomHandler.js";

const CloseRoomButton = () => {
  // Get active room state from Redux
  const roomDetails = useSelector((state) => state.room.roomDetails);

  const handleLeaveRoom = () => {
    console.log("🚪 Close button clicked!");
    console.log("🔍 Current roomDetails state:", roomDetails);

    if (!roomDetails || !roomDetails.roomId) {
      console.warn("⚠️ No active room to leave!");
      return;
    }

    try {
      roomHandler.leaveRoom();
      console.log("✅ Successfully left the room!");
    } catch (error) {
      console.error("❌ Error while leaving the room:", error);
    }
  };

  return (
    <IconButton 
      onClick={handleLeaveRoom} 
      style={{ color: "white" }} 
      aria-label="Close Room"
    >
      <CloseIcon />
    </IconButton>
  );
};

export default CloseRoomButton;
