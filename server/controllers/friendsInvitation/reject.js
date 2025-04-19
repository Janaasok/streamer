const FriendsInvitation = require("../../models/friendInvitation");
const { StatusCodes } = require("http-status-codes");
const friendsUpdates = require("../../socketHandlers/updates/friends");

const reject = async (req, res) => {
  try {
    const { id } = req.body;
    const { userId } = req.user;

    const invitationExists = await FriendsInvitation.exists({ _id: id });

    if (invitationExists) {
      await FriendsInvitation.findByIdAndDelete(id);
    }

    friendsUpdates.updateFriendsPendingInvitations(userId);

    return res.status(StatusCodes.OK).send("Invitation successfully rejected.");
  } catch (error) {
    console.error("Error in reject:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send("An error occurred. Please try again.");
  }
};

module.exports = { reject };
