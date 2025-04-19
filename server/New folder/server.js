const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

// Database Connection
const connectDB = require("./db/connection");

// Routes
const authRoutes = require("./routes/authRoutes");
const friendInvitationRoutes = require("./routes/friendInvitationRoutes");
const serverRoutes = require("./routes/serverRoutes");

// Middleware
const { auth } = require("./middlewares/auth"); // ✅ Fixed auth middleware path

// Socket Server
const socketServer = require("./socketServer");

const port = process.env.PORT || process.env.API_PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/friend-invitation", auth, friendInvitationRoutes);
app.use("/api/v1/servers", auth, serverRoutes); // ✅ Only authenticated users can access servers

const server = http.createServer(app);
socketServer.registerSocketServer(server);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(port, () => console.log(`🚀 Server is Running on port: ${port}...`));
  } catch (error) {
    console.log("❌ Server startup failed:", error);
  }
};

start();
