const express = require('express');
const router = express.Router();
const {
    getAllAnnouncements,
    createAnnouncement,
    deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getAllAnnouncements)
    .post(protect, authorize('ADMIN'), createAnnouncement);

router.route('/:id')
    .delete(protect, authorize('ADMIN'), deleteAnnouncement);

module.exports = router;
