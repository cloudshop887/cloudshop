const express = require('express');
const router = express.Router();
const {
    getAllLostFound,
    getLostFoundById,
    createLostFound,
    updateLostFound,
    deleteLostFound
} = require('../controllers/lostFoundController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getAllLostFound)
    .post(protect, createLostFound);

router.route('/:id')
    .get(getLostFoundById)
    .put(protect, updateLostFound)
    .delete(protect, deleteLostFound);

module.exports = router;
