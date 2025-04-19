import * as api from "../../api";
import { openAlertMessage } from "./alertActions";

export const authActions = {
  SET_USER_DETAILS: "AUTH.SET_USER_DETAILS",
};

export const getActions = (dispatch) => {
  return {
    login: (userDetails, navigate) => dispatch(login(userDetails, navigate)),
    register: (userDetails, navigate) => dispatch(register(userDetails, navigate)),
    setUserDetails: (userDetails) => dispatch(setUserDetails(userDetails)),
  };
};

const setUserDetails = (userDetails) => {
  return {
    type: authActions.SET_USER_DETAILS,
    userDetails,
  };
};

const login = (userDetails, navigate) => {
  return async (dispatch) => {
    try {
      const response = await api.login(userDetails);

      console.log("Login response:", response);

      if (response.error) {
        dispatch(openAlertMessage(response?.exception?.response?.data || "Login failed."));
      } else {
        const userData = response?.data?.userDetails;

        if (!userData) {
          dispatch(openAlertMessage("Login failed: Invalid response structure."));
          return;
        }

        const { _id, email, username, token } = userData;

        if (!token || !_id) {
          dispatch(openAlertMessage("Login failed: Missing required fields."));
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify({ _id, email, username }));

        dispatch(setUserDetails({ _id, email, username }));
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      dispatch(openAlertMessage(err.message || "Login failed. Please try again."));
    }
  };
};

const register = (userDetails, navigate) => {
  return async (dispatch) => {
    try {
      const response = await api.register(userDetails);

      console.log("Register response:", response);

      if (response.error) {
        dispatch(openAlertMessage(response?.exception?.response?.data || "Registration failed."));
      } else {
        const userData = response?.data?.userDetails;

        if (!userData) {
          dispatch(openAlertMessage("Registration failed: Invalid response structure."));
          return;
        }

        const { _id, email, username, token } = userData;

        if (!token || !_id) {
          dispatch(openAlertMessage("Registration failed: Missing required fields."));
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify({ _id, email, username }));

        dispatch(setUserDetails({ _id, email, username }));
        navigate("/");
      }
    } catch (err) {
      console.error("Register error:", err);
      dispatch(openAlertMessage("Registration failed. Please try again."));
    }
  };
};
