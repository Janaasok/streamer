// controllers/friendsController.js
const User = require('../models/user');

const getFriends = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).populate('friends', 'username email _id');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ friends: user.friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = {
  getFriends,
};
