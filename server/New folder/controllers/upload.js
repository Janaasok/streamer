const { StatusCodes } = require("http-status-codes");
const multer = require("multer");
const path = require("path");

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Rename the file to avoid conflicts
  },
});

const upload = multer({ storage });

// Controller to handle file uploads
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(StatusCodes.BAD_REQUEST).send("No file uploaded.");
  }
  return res.status(StatusCodes.CREATED).send("File uploaded successfully.");
};

// Export the upload middleware and controller
module.exports = {
  upload,
  uploadFile,
};
