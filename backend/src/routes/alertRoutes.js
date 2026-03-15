const express = require('express');
const router = express.Router();
const { createAlert, getAlerts, getAlertById } = require('../controllers/alertController');
const rateLimit = require('express-rate-limit');
const { optionalAuth } = require('../middleware/authMiddleware');

// Rate limiting for posting alerts (prevent spam)
const alertCreateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 alert creations per windowMs
    message: 'Too many alerts created from this IP, please try again after 15 minutes'
});

router.route('/')
    .get(getAlerts)
    .post(alertCreateLimiter, optionalAuth, createAlert);

router.route('/:id')
    .get(getAlertById);

module.exports = router;
