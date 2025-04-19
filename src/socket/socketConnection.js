import { io } from "socket.io-client";
import {
  setPendingFriendsInvitations,
  setFriends,
  setOnlineUsers,
} from "../app/actions/friendsActions";
import store from "../app/store";
import { updateDirectChatHistoryIfActive } from "../utils/chat";
import * as roomHandler from "./roomHandler";
import * as webRTCHandler from "./webRTCHandler";

let socket = null;

// ✅ Connect to Socket.IO server with token
export const connectWithSocketServer = (userDetails) => {
  // Try from userDetails, fallback to localStorage
  const token = userDetails?.token || localStorage.getItem("token");

  if (!token) {
    console.warn("⚠️ No token provided for socket connection.");
  }

  console.log("🔐 Connecting with token:", token);

  socket = io(process.env.REACT_APP_API || "http://localhost:5000", {
    auth: {
      token, // Sent as socket.handshake.auth.token
    },
    transports: ["websocket"],
    withCredentials: true,
  });

  // 🔗 Successful connection
  socket.on("connect", () => {
    console.log("✅ Connected to socket server:", socket.id);
  });

  // ❌ Connection error
  socket.on("connect_error", (err) => {
    console.error("❗ Socket connection error:", err.message);
  });

  // 📬 Friends system handlers
  socket.on("friends-invitations", (data) => {
    store.dispatch(setPendingFriendsInvitations(data.pendingInvitations));
  });

  socket.on("friends-list", (data) => {
    store.dispatch(setFriends(data.friends));
  });

  socket.on("online-users", (data) => {
    store.dispatch(setOnlineUsers(data.onlineUsers));
  });

  // 💬 Chat handlers
  socket.on("direct-chat-history", (data) => {
    updateDirectChatHistoryIfActive(data);
  });

  // 📡 Room handlers
  socket.on("room-create", roomHandler.newRoomCreated);
  socket.on("active-rooms", roomHandler.updateActiveRooms);

  // 🎥 WebRTC Peer Connection Setup
  socket.on("conn-prepare", ({ connUserSocketId }) => {
    webRTCHandler.prepareNewPeerConnection(connUserSocketId, false);
    socket.emit("conn-init", { connUserSocketId });
  });

  socket.on("conn-init", ({ connUserSocketId }) => {
    webRTCHandler.prepareNewPeerConnection(connUserSocketId, true);
  });

  socket.on("conn-signal", webRTCHandler.handleSignalingData);

  socket.on("room-participant-left", webRTCHandler.handleParticipantLeftRoom);
};

// ✅ Exporting socket globally
export { socket };

// 💬 Messaging
export const sendDirectMessage = (data) => {
  if (socket) {
    socket.emit("direct-message", data);
  }
};

export const getDirectChatHistory = (data) => {
  if (socket) {
    socket.emit("direct-chat-history", data);
  }
};

// 🧩 Rooms
export const createNewRoom = () => {
  if (socket) {
    socket.emit("room-create");
  }
};

export const joinRoom = (data) => {
  if (socket) {
    socket.emit("room-join", data);
  }
};

export const leaveRoom = (data) => {
  if (socket) {
    socket.emit("room-leave", data);
  }
};

// 🔁 WebRTC
export const signalPeerData = (data) => {
  if (socket) {
    socket.emit("conn-signal", data);
  }
};
