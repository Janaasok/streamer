const express = require("express");
const router = express.Router();

const auth  = require("../middlewares/auth");
const {
  createServer,
  inviteToServer,
  getServers,
  getServerById,
  deleteServer
} = require("../controllers/serverController"); // ✅ Make sure this path is correct

router.post("/", auth, createServer); // ✅ If createServer is undefined, this will crash
router.post("/:serverId/invite", auth, inviteToServer);

router.get("/", auth, getServers);
router.get("/:serverId", auth, getServerById);
router.delete("/:serverId", auth, deleteServer);

module.exports = router;
