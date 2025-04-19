const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  author: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  content: {
    type: String,
  },
  date: {
    type: Date,
  },
  type: { type: String, default: "DIRECT" },
  file: {
    name: String,
    type: String,
    url: String,
    data: String, 
  },
});

module.exports = mongoose.model("Message", messageSchema);
