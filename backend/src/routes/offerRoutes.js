const express = require('express');
const router = express.Router();
const { getAllOffers, getShopOffers, createOffer, deleteOffer } = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllOffers);
router.get('/shop/:shopId', getShopOffers);
router.post('/', protect, authorize('SHOP_OWNER', 'ADMIN'), createOffer);
router.delete('/:id', protect, authorize('SHOP_OWNER', 'ADMIN'), deleteOffer);

module.exports = router;
