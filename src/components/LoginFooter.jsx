import React from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";
import CustomPrimaryButton from "./CustomPrimaryButton";
import RedirectInfo from "./RedirectInfo";

const LoginFooter = ({ handleLogin, isFormValid }) => {
  const navigate = useNavigate();

  const handleRegister = () => navigate("/register");

  return (
    <>
      <Tooltip title={!isFormValid ? "Enter a valid email and password (8-12 characters)." : "Press to log in!"}>
        <div>
          <CustomPrimaryButton
            label="Login"
            additionalStyles={{ marginTop: "30px", width: "100%" }}
            disabled={!isFormValid}
            onClick={handleLogin}
          />
        </div>
      </Tooltip>
      <RedirectInfo
        text="Need an Account? "
        redirectText="Create an Account"
        additionalStyles={{ marginTop: "10px" }}
        redirectHandler={handleRegister}
      />
    </>
  );
};

export default LoginFooter;
