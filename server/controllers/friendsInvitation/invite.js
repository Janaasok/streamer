const { StatusCodes } = require("http-status-codes");
const User = require("../../models/user");
const FriendInvitation = require("../../models/friendInvitation");
const friendsUpdate = require("../../socketHandlers/updates/friends");

const invite = async (req, res) => {
  try {
    const { targetEmailAddress } = req.body;
    const { userId, email } = req.user;

    if (email.toLowerCase() === targetEmailAddress.toLowerCase()) {
      console.log("Attempted to invite self");
      return res.status(StatusCodes.CONFLICT).send("You cannot add yourself.");
    }

    const targetUser = await User.findOne({
      email: targetEmailAddress.toLowerCase(),
    });

    if (!targetUser) {
      console.log("Target user not found");
      return res
        .status(StatusCodes.NOT_FOUND)
        .send("User not found. Please check the email address.");
    }

    const invitationAlreadyReceived = await FriendInvitation.findOne({
      senderId: userId,
      receiverId: targetUser._id,
    });

    if (invitationAlreadyReceived) {
      console.log("Invitation already sent");
      return res.status(StatusCodes.CONFLICT).send("Invitation already sent.");
    }

    const userAlreadyFriends = targetUser.friends.find(
      (friendId) => friendId.toString() === userId.toString()
    );

    if (userAlreadyFriends) {
      console.log("Users are already friends");
      return res.status(StatusCodes.CONFLICT).send("User is already a friend.");
    }

    const newInvitation = await FriendInvitation.create({
      senderId: userId,
      receiverId: targetUser._id,
    });

    friendsUpdate.updateFriendsPendingInvitations(targetUser._id.toString());

    return res
      .status(StatusCodes.CREATED)
      .send("Friend invitation has been sent.");
  } catch (error) {
    console.error("Error in invite:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send("Something went wrong. Please try again.");
  }
};

module.exports = { invite };
