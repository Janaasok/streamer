const { StatusCodes } = require("http-status-codes");
const User = require("../../models/user");
const ServerInvitation = require("../../models/serverInvitation");
const serverUpdates = require("../../socketHandlers/updates/servers");

const invite = async (req, res) => {
  const { serverId, targetEmailAddress } = req.body;
  const { userId } = req.user;

  // Check if the user is trying to invite themselves
  if (req.user.email.toLowerCase() === targetEmailAddress.toLowerCase()) {
    return res
      .status(StatusCodes.CONFLICT)
      .send("You cannot invite yourself to a server.");
  }

  // Find the target user
  const targetUser = await User.findOne({ email: targetEmailAddress.toLowerCase() });
  if (!targetUser) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send(`User with email ${targetEmailAddress} not found.`);
  }

  // Check if an invitation already exists
  const invitationAlreadyExists = await ServerInvitation.findOne({
    serverId,
    senderId: userId,
    receiverId: targetUser._id,
  });

  if (invitationAlreadyExists) {
    return res
      .status(StatusCodes.CONFLICT)
      .send("Invitation has already been sent.");
  }

  const newInvitation = await ServerInvitation.create({
    serverId,
    senderId: userId,
    receiverId: targetUser._id,
  });

  serverUpdates.updateServerPendingInvitations(targetUser._id.toString());

  return res.status(StatusCodes.CREATED).send("Server invitation sent successfully.");
};

module.exports = { invite };