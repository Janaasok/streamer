const { v4: uuidv4 } = require("uuid");

const connectedUsers = new Map();
let activeRooms = [];
let gameRooms = []; // Add this line for game rooms

let io = null;

const setSocketServerInstance = (ioInstance) => {
  io = ioInstance;
};

const getSocketServerInstance = () => {
  return io;
};

const addNewConnectedUser = ({ socketId, userId }) => {
  connectedUsers.set(socketId, { userId });
};

const removeConnectedUser = (socketId) => {
  if (connectedUsers.has(socketId)) {
    connectedUsers.delete(socketId);
  }
};

const getActiveConnections = (userId) => {
  const activeConnections = [];

  connectedUsers.forEach(function (value, key) {
    if (value.userId === userId) {
      activeConnections.push(key);
    }
  });

  return activeConnections;
};

const getOnlineUsers = () => {
  const onlineUsers = [];

  connectedUsers.forEach((value, key) => {
    onlineUsers.push({ socketId: key, userId: value.userId });
  });

  return onlineUsers;
};

// Rooms
const addNewActiveRoom = (userId, socketId) => {
  const newActiveRoom = {
    roomCreator: {
      userId,
      socketId,
    },
    participants: [
      {
        userId,
        socketId,
      },
    ],
    roomId: uuidv4(),
  };

  activeRooms = [...activeRooms, newActiveRoom];

  return newActiveRoom;
};

const getActiveRooms = () => {
  return [...activeRooms];
};

const getActiveRoom = (roomId) => {
  const activeRoom = activeRooms.find(
    (activeRoom) => activeRoom.roomId === roomId
  );
  if (activeRoom) {
    return {
      ...activeRoom,
    };
  } else {
    return null;
  }
};

const joinActiveRoom = (roomId, newParticipant) => {
  const room = activeRooms.find((room) => room.roomId === roomId);
  activeRooms = activeRooms.filter((room) => room.roomId !== roomId);

  const updatedRoom = {
    ...room,
    participants: [...room.participants, newParticipant],
  };

  activeRooms.push(updatedRoom);
};

const leaveActiveRoom = (roomId, participantSocketId) => {
  const activeRoom = activeRooms.find((room) => room.roomId === roomId);

  if (activeRoom) {
    const copyOfActiveRoom = { ...activeRoom };

    copyOfActiveRoom.participants = copyOfActiveRoom.participants.filter(
      (participant) => participant.socketId !== participantSocketId
    );

    activeRooms = activeRooms.filter((room) => room.roomId !== roomId);

    if (copyOfActiveRoom.participants.length > 0) {
      activeRooms.push(copyOfActiveRoom);
    }
  }
};

// Game Rooms
const addGameRoom = (userId, socketId) => {
  const roomId = `game-room-${uuidv4()}`;
  const gameRoom = {
    roomId,
    players: [{ userId, socketId, score: 0 }],
    questions: [], // Add game questions here
  };
  gameRooms.push(gameRoom);
  return gameRoom;
};

const joinGameRoom = (roomId, userId, socketId) => {
  const gameRoom = gameRooms.find((room) => room.roomId === roomId);
  if (gameRoom) {
    gameRoom.players.push({ userId, socketId, score: 0 });
    return gameRoom;
  }
  return null;
};

const leaveGameRoom = (userId, socketId) => {
  const gameRoom = gameRooms.find((room) =>
    room.players.some((player) => player.userId === userId)
  );
  if (gameRoom) {
    gameRoom.players = gameRoom.players.filter(
      (player) => player.userId !== userId
    );
    return gameRoom;
  }
  return null;
};

const getGameRoom = (roomId) => {
  return gameRooms.find((room) => room.roomId === roomId);
};

const updatePlayerScore = (roomId, userId, score) => {
  const gameRoom = gameRooms.find((room) => room.roomId === roomId);
  if (gameRoom) {
    const player = gameRoom.players.find((player) => player.userId === userId);
    if (player) {
      player.score += score;
    }
  }
};

module.exports = {
  addNewConnectedUser,
  removeConnectedUser,
  getActiveConnections,
  setSocketServerInstance,
  getSocketServerInstance,
  getOnlineUsers,
  addNewActiveRoom,
  getActiveRooms,
  getActiveRoom,
  joinActiveRoom,
  leaveActiveRoom,
  addGameRoom, // Export new game methods
  joinGameRoom,
  leaveGameRoom,
  getGameRoom,
  updatePlayerScore,
};