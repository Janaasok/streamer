const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

// Authentication Middleware
const auth = (req, res, next) => {
  let token = req.body.token || req.query.token || req.headers["authorization"];

  if (!token) {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "A token is required for authentication" });
  }

  try {
    token = token.replace(/^Bearer\s+/, "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("✅ Decoded JWT:", decoded); // Debugging
    next();
  } catch (error) {
    console.error("❌ JWT Error:", error);
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token, authentication failed" });
  }
};

// Role-Based Access Control (RBAC) Middleware (Optional)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied: Insufficient permissions" });
    }
    next();
  };
};

module.exports = { auth, authorize };
