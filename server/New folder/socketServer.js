const authSocket = require("./middlewares/authSocket");
const newConnectionHandler = require("./socketHandlers/newConnectionHandler");
const disconnectHandler = require("./socketHandlers/disconnectedHandler");
const serverStore = require("./serverStore");
const directMessageHandler = require("./socketHandlers/directMessageHandler");
const directChatHistoryHandler = require("./socketHandlers/directChatHistoryHandler");
const roomCreateHandler = require("./socketHandlers/roomCreateHandler");
const roomJoinHandler = require("./socketHandlers/roomJoinHandler");
const roomLeaveHandler = require("./socketHandlers/roomLeaveHandler");
const roomInitializeConnectionHandler = require("./socketHandlers/roomInitializeConnectionHandler");
const roomSignalingDataHandler = require("./socketHandlers/roomSignalingDataHandler");

// Import game handlers
const gameCreateHandler = require("./socketHandlers/gameCreateHandler");
const gameJoinHandler = require("./socketHandlers/gameJoinHandler");
const gameAnswerHandler = require("./socketHandlers/gameAnswerHandler");
const gameLeaveHandler = require("./socketHandlers/gameLeaveHandler");

const registerSocketServer = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  serverStore.setSocketServerInstance(io);

  io.use((socket, next) => {
    authSocket(socket, next);
  });

  const emitOnlineUsers = () => {
    const onlineUsers = serverStore.getOnlineUsers();
    io.emit("online-users", { onlineUsers });
  };

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    newConnectionHandler(socket, io);
    emitOnlineUsers();

    // Direct messaging and chat history
    socket.on("direct-message", (data) => {
      directMessageHandler(socket, data);
    });

    socket.on("direct-chat-history", (data) => {
      directChatHistoryHandler(socket, data);
    });

    // Room handlers
    socket.on("room-create", () => {
      roomCreateHandler(socket);
    });

    socket.on("room-join", (data) => {
      roomJoinHandler(socket, data);
    });

    socket.on("room-leave", (data) => {
      roomLeaveHandler(socket, data);
    });

    socket.on("conn-init", (data) => {
      roomInitializeConnectionHandler(socket, data);
    });

    socket.on("conn-signal", (data) => {
      roomSignalingDataHandler(socket, data);
    });

    // Game handlers
    socket.on("game-create", () => {
      gameCreateHandler(socket);
    });

    socket.on("game-join", (data) => {
      gameJoinHandler(socket, data);
    });

    socket.on("game-answer", (data) => {
      gameAnswerHandler(socket, data);
    });

    socket.on("game-leave", () => {
      gameLeaveHandler(socket);
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      disconnectHandler(socket);
    });
  });

  setInterval(() => {
    emitOnlineUsers();
  }, [1000 * 8]);
};

module.exports = {
  registerSocketServer,
};