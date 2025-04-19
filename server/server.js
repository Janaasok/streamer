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
const serverRoutes = require("./routes/serverRoutes"); // ✅ Correctly imported
const geminiRoutes = require("./routes/gemini_routes");
const friendsRoutes = require("./routes/friendsRoutes");

// Middleware
const auth = require("./middlewares/auth"); // ✅ FIXED: exported as a function

// Socket Server
const socketServer = require("./socketServer");

const port = process.env.PORT || process.env.API_PORT || 5000;
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

// Routes
app.use('/uploads', express.static('public/uploads'));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/friend-invitation", auth, friendInvitationRoutes);
app.use("/api/v1/servers", auth, serverRoutes); // ✅ Works only if exported properly
app.use("/api/v1/gemini", auth, geminiRoutes);
app.use("/api/v1", friendsRoutes);
app.use((req, res, next) => {
  console.log("⛳ Hit route:", req.method, req.originalUrl);
  next();
});
app.use('/uploads', express.static('public/uploads'));
app.use('/api', require('./routes/upload'));



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
const path = require("path");

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});


start();
