import React, { useState } from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import ServerDialog from "./ServerDialog";
import { createServer, sendServerInvitation } from "../api";

const ServerButton = ({ onServerCreated }) => {
  const [open, setOpen] = useState(false);

  const handleServerCreated = async (server) => {
    onServerCreated(server);
    setOpen(false);

    // Send invitations to friends after creating the server
    const friendEmails = ["friend1@example.com", "friend2@example.com"]; // Replace with actual friend emails
    await sendServerInvitation({ serverId: server._id, targetEmailAddress: friendEmails });

    await sendServerInvitation({ serverId: server._id, friendIds });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "16px",
          marginTop: "10px",
          color: "white",
          backgroundColor: "#4CAF50",
        }}
      >
        <AddIcon />
      </Button>
      <ServerDialog open={open} onClose={() => setOpen(false)} onServerCreated={handleServerCreated} />
    </>
  );
};

export default ServerButton;
