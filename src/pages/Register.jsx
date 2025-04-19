import React, { useState, useEffect } from "react";
import { Typography, CircularProgress, Snackbar, Alert } from "@mui/material";
import { validateRegisterForm } from "../utils/validators";
import { AuthBox, RegisterFooter, RegisterInputs } from "../components";
import { connect } from "react-redux";
import { getActions } from "../app/actions/authActions";
import { useNavigate } from "react-router-dom";

const Register = ({ register }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setIsFormValid(validateRegisterForm({ email, password, username }));
  }, [email, username, password, setIsFormValid]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);

    const userDetails = {
      email,
      username,
      password,
    };

    try {
      await register(userDetails, navigate);
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <AuthBox>
      <Typography variant="h5" sx={{ color: "white", textAlign: "center", mb: 2 }}>
        Create an Account
      </Typography>
      <RegisterInputs
        email={email}
        setEmail={setEmail}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
      />
      <RegisterFooter isFormValid={isFormValid} handleRegister={handleRegister} />
      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
          <CircularProgress size={24} />
        </div>
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </AuthBox>
  );
};

const mapActionsToProps = (dispatch) => {
  return {
    ...getActions(dispatch),
  };
};

export default connect(null, mapActionsToProps)(Register);