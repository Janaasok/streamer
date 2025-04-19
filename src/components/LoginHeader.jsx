import React from "react";
import { Typography } from "@mui/material";

const LoginHeader = () => {
  return (
    <>
      <Typography variant="h5" sx={{ color: "white", textAlign: "center", mb: 1 }}>
        Welcome Back!
      </Typography>
      <Typography variant="body1" sx={{ color: "#b9bbbe", textAlign: "center" }}>
        We are glad you are here.
      </Typography>
    </>
  );
};

export default LoginHeader;
