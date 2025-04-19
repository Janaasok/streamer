const express = require("express");
const router = express.Router();
const { createServer, getServers, getServerById, deleteServer } = require("../controllers/serverController");
const { auth } = require("../middlewares/auth"); // ✅ Fixed middleware path

router.post("/", auth, createServer);
router.get("/", getServers);
router.get("/:serverId", getServerById);
router.delete("/:serverId", auth, deleteServer);

module.exports = router;
