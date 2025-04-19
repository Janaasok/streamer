import React, { useState } from "react";
import { Button } from "@mui/material";

const FileUpload = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      onFileUpload(file);
      setFile(null);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <Button onClick={handleUpload} variant="contained" color="primary">
        Upload
      </Button>
    </div>
  );
};

export default FileUpload;
