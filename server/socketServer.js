const { Server } = require("socket.io");
const jwt = require("jsonwebtoken"); // Required for JWT verification
const serverStore = require("./serverStore");

// Handlers
const newConnectionHandler = require("./socketHandlers/newConnectionHandler");
const disconnectHandler = require("./socketHandlers/disconnectedHandler");
const directMessageHandler = require("./socketHandlers/directMessageHandler");
const directChatHistoryHandler = require("./socketHandlers/directChatHistoryHandler");

const roomCreateHandler = require("./socketHandlers/roomCreateHandler");
const roomJoinHandler = require("./socketHandlers/roomJoinHandler");
const roomLeaveHandler = require("./socketHandlers/roomLeaveHandler");
const roomInitializeConnectionHandler = require("./socketHandlers/roomInitializeConnectionHandler");
const roomSignalingDataHandler = require("./socketHandlers/roomSignalingDataHandler");

const gameCreateHandler = require("./socketHandlers/gameCreateHandler");
const gameJoinHandler = require("./socketHandlers/gameJoinHandler");
const gameAnswerHandler = require("./socketHandlers/gameAnswerHandler");
const gameLeaveHandler = require("./socketHandlers/gameLeaveHandler");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const registerSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  serverStore.setSocketServerInstance(io);

  // ✅ Inline authentication middleware using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.log("⛔ No token provided in socket handshake.");
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      console.log("❌ Invalid socket token:", err.message);
      return next(new Error("Authentication error"));
    }
  });

  // Broadcast online users
  const emitOnlineUsers = () => {
    const onlineUsers = serverStore.getOnlineUsers();
    io.emit("online-users", { onlineUsers });
  };

  io.on("connection", (socket) => {
    console.log(`✅ [Socket Connected] ${socket.id} | User: ${socket.user?.email}`);

    newConnectionHandler(socket, io);
    emitOnlineUsers();

    // 📬 Messaging
    socket.on("direct-message", (data) => directMessageHandler(socket, data));
    socket.on("direct-chat-history", (data) => directChatHistoryHandler(socket, data));

    // 🎤 Room events
    socket.on("room-create", () => roomCreateHandler(socket));
    socket.on("room-join", (data) => roomJoinHandler(socket, data));
    socket.on("room-leave", (data) => roomLeaveHandler(socket, data));
    socket.on("conn-init", (data) => roomInitializeConnectionHandler(socket, data));
    socket.on("conn-signal", (data) => roomSignalingDataHandler(socket, data));

    // 🕹️ Game events
    socket.on("game-create", () => gameCreateHandler(socket));
    socket.on("game-join", (data) => gameJoinHandler(socket, data));
    socket.on("game-answer", (data) => gameAnswerHandler(socket, data));
    socket.on("game-leave", () => gameLeaveHandler(socket));

    // 🔌 Disconnection
    socket.on("disconnect", () => {
      console.log(`❌ [Socket Disconnected] ${socket.id}`);
      disconnectHandler(socket);
    });
  });

  setInterval(emitOnlineUsers, 8000);
};

module.exports = {
  registerSocketServer,
};
