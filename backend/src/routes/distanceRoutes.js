const express = require('express');
const router = express.Router();
const { calculateDistance } = require('../controllers/distanceController');

router.get('/', calculateDistance);

module.exports = router;
