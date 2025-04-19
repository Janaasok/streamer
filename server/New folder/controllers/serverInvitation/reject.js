const { StatusCodes } = require("http-status-codes");
const ServerInvitation = require("../../models/serverInvitation");
const serverUpdates = require("../../socketHandlers/updates/servers");

const reject = async (req, res) => {
  const { id } = req.body;

  try {
    const invitation = await ServerInvitation.findById(id);
    if (!invitation) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send("Invitation not found.");
    }

    // Delete the invitation
    await ServerInvitation.findByIdAndDelete(id);

    // Notify the user about the update
    serverUpdates.updateServerPendingInvitations(invitation.receiverId.toString());

    return res.status(StatusCodes.OK).send("Server invitation rejected.");
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send("Something went wrong. Please try again.");
  }
};

module.exports = { reject };