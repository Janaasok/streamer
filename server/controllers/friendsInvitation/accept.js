const FriendsInvitation = require("../../models/friendInvitation");
const { StatusCodes } = require("http-status-codes");
const friendsUpdates = require("../../socketHandlers/updates/friends");
const User = require("../../models/user");

const accept = async (req, res) => {
  try {
    const { id } = req.body;

    const invitation = await FriendsInvitation.findById(id);

    if (!invitation) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send("Invitation not found or already handled.");
    }

    const { senderId, receiverId } = invitation;

    const senderUser = await User.findById(senderId);
    const receiverUser = await User.findById(receiverId);

    if (!senderUser || !receiverUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send("One of the users no longer exists.");
    }

    if (!senderUser.friends.includes(receiverId)) {
      senderUser.friends.push(receiverId);
    }

    if (!receiverUser.friends.includes(senderId)) {
      receiverUser.friends.push(senderId);
    }

    await senderUser.save();
    await receiverUser.save();

    await FriendsInvitation.findByIdAndDelete(id);

    friendsUpdates.updateFriends(senderId.toString());
    friendsUpdates.updateFriends(receiverId.toString());
    friendsUpdates.updateFriendsPendingInvitations(receiverId.toString());

    return res.status(StatusCodes.OK).send("Friend added successfully.");
  } catch (error) {
    console.error("Error in accept:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send("An error occurred. Please try again.");
  }
};

module.exports = { accept };
