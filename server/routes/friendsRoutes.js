// D:/project/streamer (2)/streamer/server/routes/friendsRoutes.js

const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController'); // ✅ Corrected name
const auth = require('../middlewares/auth');

router.get('/friends', auth, friendsController.getFriends); // ✅ Auth middleware + correct controller

module.exports = router;
