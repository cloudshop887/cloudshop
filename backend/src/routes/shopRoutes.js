const express = require('express');
const router = express.Router();
const { registerShop, getShops, getShopById, updateShop, updateDiscountSettings } = require('../controllers/shopController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateShopRegistration, sanitizeInputs } = require('../middleware/validationMiddleware');

router.route('/')
    .post(protect, sanitizeInputs, validateShopRegistration, registerShop) // Any logged-in user can register a shop
    .get(getShops);

router.get('/nearby', require('../controllers/shopController').getNearbyShops);
router.get('/admin/all', protect, authorize('ADMIN'), require('../controllers/shopController').getAllShopsAdmin);
router.put('/:id/approve', protect, authorize('ADMIN'), require('../controllers/shopController').approveShop);
router.get('/my-shop', protect, require('../controllers/shopController').getMyShop);
router.put('/:id/discount-settings', protect, authorize('SHOP_OWNER', 'ADMIN'), updateDiscountSettings);

router.route('/:id')
    .get(getShopById)
    .put(protect, authorize('SHOP_OWNER', 'ADMIN'), sanitizeInputs, validateShopRegistration, updateShop);

module.exports = router;

