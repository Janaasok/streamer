const express = require("express");
const { upload, uploadFile } = require("../controllers/upload");

const router = express.Router();

// Define the file upload route
router.post("/upload", upload.single("file"), uploadFile);

module.exports = router;
