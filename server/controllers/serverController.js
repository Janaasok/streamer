const Server = require("../models/Server");

// Create a new server and auto-join the owner
exports.createServer = async (req, res) => {
  try {
    console.log("✅ Incoming request data:", req.body);
    console.log("✅ Authenticated user:", req.user);

    const userId = req.user.userId || req.user._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID is missing" });
    }

    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Server name is required" });

    const newServer = new Server({
      name,
      description,
      owner: userId,
      members: [userId], // ✅ Add creator to members array
    });

    await newServer.save();

    res.status(201).json({
      message: "Server created successfully!",
      server: newServer,
    });
  } catch (error) {
    console.error("❌ Server creation failed:", error);
    res.status(500).json({ message: "Server creation failed", error });
  }
};


exports.inviteToServer = async (req, res) => {
  try {
    console.log("👉 Invite request body:", req.body);
    console.log("👉 Invite request params:", req.params);
    console.log("👉 Invite request user:", req.user);

    const { userId } = req.body;
    const serverId = req.params.serverId;
    const requesterId = req.user.userId || req.user._id;

    if (!userId || !serverId) {
      return res.status(400).json({ message: "Missing userId or serverId" });
    }

    const server = await Server.findById(serverId);
    if (!server) return res.status(404).json({ message: "Server not found" });

    if (!server.owner.equals(requesterId)) {
      return res.status(403).json({ message: "Only the owner can invite users." });
    }

    if (server.members.some((memberId) => memberId.equals(userId))) {
      return res.status(400).json({ message: "User is already a member." });
    }

    server.members.push(userId);
    await server.save();

    res.status(200).json({ message: "User invited to server." });
  } catch (error) {
    console.error("Invite failed:", error);
    res.status(500).json({ message: "Failed to invite user to server." });
  }
};


// Get all servers the logged-in user is a member of
exports.getServers = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const servers = await Server.find({ members: userId }).populate("owner", "username email");
    res.status(200).json(servers);
  } catch (error) {
    console.error("❌ Failed to fetch servers:", error);
    res.status(500).json({ message: "Failed to fetch servers", error });
  }
};

// Get one server by ID (if the user is a member)
exports.getServerById = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const server = await Server.findById(req.params.serverId).populate("owner", "username email");

    if (!server) return res.status(404).json({ message: "Server not found" });

    // ✅ Check if user is a member
    if (!server.members.includes(userId.toString())) {
      return res.status(403).json({ message: "Access denied. You are not a member of this server." });
    }

    res.status(200).json(server);
  } catch (error) {
    console.error("❌ Failed to get server by ID:", error);
    res.status(500).json({ message: "Failed to get server details", error });
  }
};


// Delete server (only owner can delete)
exports.deleteServer = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const server = await Server.findById(req.params.serverId);

    if (!server) return res.status(404).json({ message: "Server not found" });

    if (server.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this server" });
    }

    await Server.findByIdAndDelete(req.params.serverId);
    res.status(200).json({ message: "Server deleted successfully" });
  } catch (error) {
    console.error("❌ Failed to delete server:", error);
    res.status(500).json({ message: "Failed to delete server", error });
  }
};
