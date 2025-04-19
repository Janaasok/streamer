import { openAlertMessage } from "./alertActions";
import * as api from "../../api";

export const serversActions = {
  SET_SERVERS: "SERVERS.SET_SERVERS",
  SET_PENDING_SERVER_INVITATIONS: "SERVERS.SET_PENDING_SERVER_INVITATIONS",
};

export const getActions = (dispatch) => {
  return {
    sendServerInvitation: (data, closeDialogHandler) =>
      dispatch(sendServerInvitation(data, closeDialogHandler)),
    acceptServerInvitation: (data) => dispatch(acceptServerInvitation(data)),
    rejectServerInvitation: (data) => dispatch(rejectServerInvitation(data)),
  };
};

export const setPendingServerInvitations = (pendingServerInvitations) => {
  return {
    type: serversActions.SET_PENDING_SERVER_INVITATIONS,
    pendingServerInvitations,
  };
};

export const sendServerInvitation = (data, closeDialogHandler) => {
  return async (dispatch) => {
    const response = await api.sendServerInvitation(data);

    if (response.error) {
      dispatch(openAlertMessage(response.exception?.response?.data));
    } else {
      dispatch(openAlertMessage("Server Invitation Has Been Sent!"));
      closeDialogHandler();
    }
  };
};

export const setServers = (servers) => {
  return {
    type: serversActions.SET_SERVERS,
    servers,
  };
};

const acceptServerInvitation = (data) => {
  return async (dispatch) => {
    const response = await api.acceptServerInvitation(data);

    if (response.error) {
      dispatch(openAlertMessage(response.exception?.response?.data));
    } else {
      dispatch(openAlertMessage("Server Invitation Accepted!"));
    }
  };
};

const rejectServerInvitation = (data) => {
  return async (dispatch) => {
    const response = await api.rejectServerInvitation(data);

    if (response.error) {
      dispatch(openAlertMessage(response.exception?.response?.data));
    } else {
      dispatch(openAlertMessage("Server Invitation Rejected!"));
    }
  };
};