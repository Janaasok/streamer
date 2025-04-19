const serverStore = require("../serverStore");

const gameJoinHandler = (socket, data) => {
  const { roomId } = data;
  const socketId = socket.id;
  const userId = socket.user.id;

  // Join the game room
  const gameRoom = serverStore.joinGameRoom(roomId, userId, socketId);
  if (!gameRoom) {
    socket.emit("game-room-error", {
      message: "Game room not found",
    });
    return;
  }


  if (gameRoom) {
    socket.join(roomId);

    // Notify all users in the room that a new player joined
    socket.to(roomId).emit("game-room-update", { 
        players: gameRoom.players,

      players: gameRoom.players,
    });

    // Notify the joining user
    socket.emit("game-room-join", {
      roomId,
      players: gameRoom.players,
    });
  } else {
    socket.emit("game-room-error", {
      message: "Game room not found",
    });
  }
};

module.exports = gameJoinHandler;
