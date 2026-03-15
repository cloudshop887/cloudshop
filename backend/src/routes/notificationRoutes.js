const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { subscribe } = require('../controllers/pushNotificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read/all', protect, markAllAsRead);
router.post('/subscribe', subscribe);

module.exports = router;
