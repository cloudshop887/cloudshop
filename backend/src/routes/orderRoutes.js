const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, getMyOrders, getShopOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createOrder);

router.route('/myorders')
    .get(protect, getMyOrders);

router.route('/shop/:shopId')
    .get(protect, authorize('SHOP_OWNER', 'ADMIN'), getShopOrders);

router.route('/:id')
    .get(protect, getOrderById);

router.route('/:id/status')
    .put(protect, authorize('SHOP_OWNER', 'ADMIN'), updateOrderStatus);

module.exports = router;
