import React, { useState, useRef } from "react";
import { styled } from "@mui/system";
import { connect } from "react-redux";
import { sendDirectMessage } from "../socket/socketConnection.js";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import DescriptionIcon from "@mui/icons-material/Description";
import SendIcon from "@mui/icons-material/Send";

const MainContainer = styled("div")({
  height: "60px",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  position: "relative",
  padding: "10px",
  backgroundColor: "#40444B",
  borderRadius: "8px",
});

const Input = styled("input")({
  backgroundColor: "#2f3136",
  width: "75%",
  height: "44px",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  padding: "0 10px",
  outline: "none",
});

const FileInput = styled("input")({
  display: "none",
});

const UploadButton = styled("button")({
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "white",
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "30px",
  height: "30px",
  padding: "5px",
});

const SendButton = styled("button")({
  background: "#5865F2",
  border: "none",
  cursor: "pointer",
  color: "white",
  borderRadius: "5px",
  width: "40px",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.2s",
  "&:hover": {
    background: "#4752C4",
  },
});

const PreviewContainer = styled("div")({
  position: "absolute",
  bottom: "70px",
  backgroundColor: "#2f3136",
  padding: "8px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
});

const ImagePreview = styled("img")({
  width: "50px",
  height: "50px",
  borderRadius: "5px",
  objectFit: "cover",
});

const RemovePreviewButton = styled("button")({
  background: "#E74C3C",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  padding: "5px 10px",
  fontSize: "12px",
  "&:hover": {
    background: "#C0392B",
  },
});

const NewMessageInput = ({ chosenChatDetails, userDetails }) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleMessageValueChange = (event) => {
    setMessage(event.target.value);
  };

  const handleKeyPressed = (event) => {
    if (event.key === "Enter" && !isUploading) {
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || isUploading) return;

    const messageData = {
      senderUserId: userDetails._id,
      receiverUserId: chosenChatDetails.id,
      content: message.trim(),
    };

    if (selectedFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const res = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Upload failed with status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Upload response:", data); // Debug: check response

        if (data.fileUrl) {
          messageData.fileUrl = data.fileUrl;
          messageData.fileType = selectedFile.type;
          messageData.fileName = selectedFile.name;
          
          if (selectedFile.type.startsWith("image/")) {
            messageData.isImage = true; // Explicitly mark as image
          }
        }
      } catch (err) {
        console.error("File upload failed:", err);
        alert("Failed to upload file. Please try again.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    console.log("Sending message data:", messageData); // Debug: check message data
    sendDirectMessage(messageData);
    setMessage("");
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log("Selected file:", file); // Debug: log file details
    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl("");
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    
    console.log("Selected image:", file); // Debug: log image details
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removePreview = () => {
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const triggerImageInput = () => {
    imageInputRef.current.click();
  };

  return (
    <MainContainer>
      <UploadButton onClick={triggerFileInput} disabled={isUploading}>
        <AttachFileIcon />
      </UploadButton>
      <FileInput 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
      />

      <UploadButton onClick={triggerImageInput} disabled={isUploading}>
        <InsertPhotoIcon />
      </UploadButton>
      <FileInput 
        type="file" 
        ref={imageInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
      />

      <Input
        placeholder={`Message ${chosenChatDetails.name}`}
        value={message}
        onChange={handleMessageValueChange}
        onKeyDown={handleKeyPressed}
        disabled={isUploading}
      />

      <SendButton onClick={handleSendMessage} disabled={isUploading}>
        <SendIcon />
      </SendButton>

      {selectedFile && (
        <PreviewContainer>
          {previewUrl ? (
            <ImagePreview src={previewUrl} alt="Preview" />
          ) : (
            <DescriptionIcon style={{ color: "white", fontSize: "30px" }} />
          )}
          <RemovePreviewButton onClick={removePreview}>Remove</RemovePreviewButton>
        </PreviewContainer>
      )}
    </MainContainer>
  );
};

// Make sure to map the current user's ID
const mapStoreStateToProps = ({ chat, auth }) => ({
  ...chat,
  userDetails: auth.userDetails,
});

export default connect(mapStoreStateToProps)(NewMessageInput);