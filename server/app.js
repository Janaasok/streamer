const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const uploadRoutes = require("./routes/upload");

const app = express();

// Middleware
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], // allow both ports
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use the upload routes
app.use("/api/v1", uploadRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
