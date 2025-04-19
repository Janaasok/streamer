const serverStore = require("../serverStore");

const gameLeaveHandler = (socket) => {
  const socketId = socket.id;
  const userId = socket.user.id;

  // Remove the player from the game room
const gameRoom = serverStore.leaveGameRoom(userId, socketId);
if (!gameRoom) {
    socket.emit("game-room-error", {
        message: "Game room not found",
    });
    return;
}


  if (gameRoom) {
    // Notify all players in the room
    socket.to(gameRoom.roomId).emit("game-room-update", { 
        players: gameRoom.players,

      players: gameRoom.players,
    });
  }
};

module.exports = gameLeaveHandler;
