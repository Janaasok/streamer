const { StatusCodes } = require("http-status-codes");
const ServerInvitation = require("../../models/serverInvitation");
const serverUpdates = require("../../socketHandlers/updates/servers");
const User = require("../../models/user");

const accept = async (req, res) => {
  const { id } = req.body;

  try {
    const invitation = await ServerInvitation.findById(id);
    if (!invitation) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send("Invitation not found.");
    }

    // Add the user to the server's members list
    const server = await Server.findById(invitation.serverId);
    server.members.push(invitation.receiverId);
    await server.save();

    // Delete the invitation
    await ServerInvitation.findByIdAndDelete(id);

    // Notify both users about the update
    serverUpdates.updateServerMembers(invitation.serverId.toString());
    serverUpdates.updateServerPendingInvitations(invitation.receiverId.toString());

    return res.status(StatusCodes.OK).send("Server invitation accepted.");
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send("Something went wrong. Please try again.");
  }
};

module.exports = { accept };