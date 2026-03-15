const express = require('express');
const router = express.Router();
const { getDashboardStats, getSystemActivity } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('ADMIN'), getDashboardStats);
router.get('/activity', protect, authorize('ADMIN'), getSystemActivity);

module.exports = router;
