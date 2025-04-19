import { serversActions } from "../actions/serversActions";

const initialState = {
  servers: [],
  pendingServerInvitations: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case serversActions.SET_PENDING_SERVER_INVITATIONS:
      return {
        ...state,
        pendingServerInvitations: action.pendingServerInvitations,
      };
    case serversActions.SET_SERVERS:
      return {
        ...state,
        servers: action.servers,
      };
    default:
      return state;
  }
};

export default reducer;
