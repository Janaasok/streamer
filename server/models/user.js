const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    
  },
  username: {
    type: String,
    unique: true,
    required: true,
    
  },
  password: {
    type: String,
    required: true,
  },
  friends: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
