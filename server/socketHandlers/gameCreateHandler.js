const serverStore = require("../serverStore");

const gameCreateHandler = (socket) => {
  const socketId = socket.id;
  const userId = socket.user.id;

  // Create a new game room
  const gameRoom = serverStore.addGameRoom(userId, socketId);

  // Join the game room
  socket.join(gameRoom.roomId);

  // Notify the user that the game room was created
  socket.emit("game-room-create", {
    roomId: gameRoom.roomId,
  });
};

module.exports = gameCreateHandler;