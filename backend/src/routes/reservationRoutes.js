const express = require('express');
const router = express.Router();
const {
    createReservation,
    getMyReservations,
    getShopReservations,
    updateReservationStatus,
    cancelReservation,
    previewDiscount,
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Preview discount before reserving
router.post('/preview-discount', protect, previewDiscount);

// Create a new reservation
router.post('/', protect, createReservation);

// Get all reservations for logged-in user
router.get('/my-reservations', protect, getMyReservations);

// Get all reservations for a shop (shop owner/admin)
router.get('/shop/:shopId', protect, authorize('SHOP_OWNER', 'ADMIN'), getShopReservations);

// Update reservation status (shop owner/admin)
router.put('/:id/status', protect, authorize('SHOP_OWNER', 'ADMIN'), updateReservationStatus);

// Cancel a reservation (user)
router.put('/:id/cancel', protect, cancelReservation);

module.exports = router;
