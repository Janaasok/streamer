const serverStore = require("../serverStore");

const gameAnswerHandler = (socket, data) => {
  const { roomId, answer } = data;
  const userId = socket.user.id;

  // Check if the answer is correct
const gameRoom = serverStore.getGameRoom(roomId);
if (!gameRoom) {
    socket.emit("game-room-error", {
        message: "Game room not found",
    });
    return;
}

  if (gameRoom) {
    const isCorrect = gameRoom.checkAnswer(answer); // Ensure this function is defined in the game room logic


    // Update the player's score
    gameRoom.updateScore(userId, isCorrect ? 10 : 0);

    // Notify all players in the room
    socket.to(roomId).emit("game-update", { 
        playerId: userId,

      playerId: userId,
      isCorrect,
      score: gameRoom.getPlayerScore(userId),
    });

    // Notify the answering player
    socket.emit("game-update", {
      playerId: userId,
      isCorrect,
      score: gameRoom.getPlayerScore(userId),
    });
  }
};

module.exports = gameAnswerHandler;
