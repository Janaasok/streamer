// GameSocket.js

import { socket } from "../../socket/socketConnection"; // Corrected import

export const joinGame = (gameId) => {
  if (socket) {
    socket.emit("joinGame", gameId);
  }
};

export const sendGameEvent = (event) => {
  if (socket) {
    socket.emit("gameEvent", event);
  }
};

export const subscribeToGameUpdates = (callback) => {
  if (socket) {
    socket.on("gameUpdate", callback);
  }
};
