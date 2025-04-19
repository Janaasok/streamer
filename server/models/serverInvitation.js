const mongoose = require("mongoose");

const ServerInvitationSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: "Server", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ServerInvitation", ServerInvitationSchema);