import axios from "axios";
import { logout } from "./utils";
import FormData from 'form-data';

// ===========================
//    AXIOS CLIENT SETUP
// ===========================
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API,
  timeout: 1000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const register = async (data) => {
  try {
    return await apiClient.post(`/api/v1/auth/register`, data);
  } catch (exception) {
    return { error: true, exception };
  }
};

export const login = async (data) => {
  try {
    const response = await apiClient.post(`/api/v1/auth/login`, data);
    const userData = response?.data;

    // 🔐 Store token on success
    if (userData?.token) {
      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(userData.user || {}));
    }

    return response;
  } catch (exception) {
    return { error: true, exception };
  }
};

// ===========================
//     FRIEND REQUEST APIs
// ===========================
export const sendFriendInvitation = async (data) => {
  try {
    return await apiClient.post("/api/v1/friend-invitation/invite", data);
  } catch (exception) {
    checkResponseCode(exception);
    return { error: true, exception };
  }
};

export const acceptFriendInvitation = async (data) => {
  try {
    return await apiClient.post("/api/v1/friend-invitation/accept", data);
  } catch (exception) {
    checkResponseCode(exception);
    return { error: true, exception };
  }
};

export const rejectFriendInvitation = async (data) => {
  try {
    return await apiClient.post("/api/v1/friend-invitation/reject", data);
  } catch (exception) {
    checkResponseCode(exception);
    return { error: true, exception };
  }
};

// ===========================
//       SERVER APIs
// ===========================
export const createServer = async (data) => {
  try {
    return await apiClient.post(`/api/v1/servers`, data);
  } catch (exception) {
    checkResponseCode(exception);
    return { error: true, exception };
  }
};

export const getServers = async () => {
  try {
    return await apiClient.get(`/api/v1/servers`);
  } catch (exception) {
    checkResponseCode(exception);
    return { error: true, exception };
  }
};

export const getServerById = async (serverId) => {
  try {
    return await apiClient.get(`/api/v1/servers/${serverId}`);
  } catch (exception) {
    checkResponseCode(exception);
    return { error: true, exception };
  }
};

export const deleteServer = async (serverId) => {
  try {
    return await apiClient.delete(`/api/v1/servers/${serverId}`);
  } catch (exception) {
    checkResponseCode(exception);
    return { error: true, exception };
  }
};

// ===========================
//   SERVER INVITATION APIs
// ===========================
export const sendServerInvitation = async (data) => {
  try {
    return await apiClient.post("/api/v1/server-invitations/invite", data);
  } catch (exception) {
    checkResponseCode(exception);
    return { error: true, exception };
  }
};

export const acceptServerInvitation = async (invitationId) => {
  try {
    return await apiClient.post(`/api/v1/server-invitations/${invitationId}/accept`);
  } catch (exception) {
    checkResponseCode(exception);
    return { error: true, exception };
  }
};

export const rejectServerInvitation = async (invitationId) => {
  try {
    return await apiClient.post(`/api/v1/server-invitations/${invitationId}/reject`);
  } catch (exception) {
    checkResponseCode(exception);
    return { error: true, exception };
  }
};

export const getPendingServerInvitations = async () => {
  try {
    return await apiClient.get("/api/v1/server-invitations/pending");
  } catch (exception) {
    checkResponseCode(exception);
    return { error: true, exception };
  }
};

// ===========================
//        FILE UPLOAD
// ===========================
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    return await apiClient.post(`/api/v1/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (exception) {
    return { error: true, exception };
  }
};

// ===========================
//         AI CHAT APIs
// ===========================
export const sendChatMessageToAI = async (message) => {
  try {
    const response = await apiClient.post('/api/v1/gemini/chat', { message });
    return response.data;
  } catch (exception) {
    checkResponseCode(exception);
    return { error: true, exception };
  }
};

// ===========================
//      HELPER FUNCTION
// ===========================
const checkResponseCode = (exception) => {
  const responseCode = exception?.response?.status;
  if (responseCode === 401 || responseCode === 403) {
    logout(); // clear localStorage, redirect, etc.
  }
};
