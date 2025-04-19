const jwt = require("jsonwebtoken");

const authSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.log("❌ No token in socket handshake");
      return next(new Error("NOT_AUTHORIZED"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;

    console.log("✅ Socket authorized user:", decoded.email);
    next();
  } catch (err) {
    console.error("❌ Socket auth failed:", err.message);
    return next(new Error("NOT_AUTHORIZED"));
  }
};

module.exports = authSocket;
