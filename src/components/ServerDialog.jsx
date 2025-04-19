import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { createServer, uploadFile } from "../api";
import FileUpload from "./FileUpload";

const ServerDialog = ({ open, onClose, onServerCreated }) => {
  const [serverName, setServerName] = useState("");
  const [serverDescription, setServerDescription] = useState("");
  const [file, setFile] = useState(null);

  const handleCreateServer = async () => {
    if (!serverName) return alert("Server name is required!");

    const serverData = { name: serverName, description: serverDescription };
    try {
      if (file) {
        await uploadFile(file);
      }
      const createdServer = await createServer(serverData);
      onServerCreated(createdServer);
      alert("Server created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating server:", error);
      alert("Failed to create server");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create a New Server</DialogTitle>
      <DialogContent>
        <TextField
          label="Server Name"
          fullWidth
          value={serverName}
          onChange={(e) => setServerName(e.target.value)}
          margin="dense"
        />
        <TextField
          label="Description"
          fullWidth
          value={serverDescription}
          onChange={(e) => setServerDescription(e.target.value)}
          margin="dense"
          multiline
          rows={3}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleCreateServer} color="primary" variant="contained">Create Server</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServerDialog;
