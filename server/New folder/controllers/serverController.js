const Server = require("../models/Server");

exports.createServer = async (req, res) => {
    try {
      console.log("✅ Incoming request data:", req.body);
      console.log("✅ Authenticated user:", req.user);
  
      if (!req.user || !req.user.userId) {  // Fix: Using userId instead of _id
        return res.status(401).json({ message: "Unauthorized: User ID is missing" });
      }
  
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ message: "Server name is required" });
  
      const newServer = new Server({ 
        name, 
        description, 
        owner: req.user.userId  // Fix: Using userId instead of _id
      });
      await newServer.save();
  
      res.status(201).json({ message: "Server created successfully!", server: newServer });
    } catch (error) {
      console.error("❌ Server creation failed:", error);
      res.status(500).json({ message: "Server creation failed", error });
    }
  };
  
  

exports.getServers = async (req, res) => {
  try {
    const servers = await Server.find().populate("owner", "username email");
    res.status(200).json(servers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch servers", error });
  }
};

exports.getServerById = async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId).populate("owner", "username email");
    if (!server) return res.status(404).json({ message: "Server not found" });

    res.status(200).json(server);
  } catch (error) {
    res.status(500).json({ message: "Failed to get server details", error });
  }
};

exports.deleteServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId);
    if (!server) return res.status(404).json({ message: "Server not found" });

    if (server.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this server" });
    }

    await Server.findByIdAndDelete(req.params.serverId);
    res.status(200).json({ message: "Server deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete server", error });
  }
};
