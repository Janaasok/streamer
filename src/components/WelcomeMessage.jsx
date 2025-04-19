import React from "react";
import { Typography } from "@mui/material";
import { styled } from "@mui/system";

const Wrapper = styled("div")({
  flexGrow: 1,
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#36393f",
});

const WelcomeMessage = () => {
  return (
    <Wrapper>
      <Typography variant="h6" sx={{ color: "white" }}>
        To start chatting - choose a user
      </Typography>
    </Wrapper>
  );
};

export default WelcomeMessage;