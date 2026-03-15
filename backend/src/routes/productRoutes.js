const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, bulkUploadProducts, compareProducts } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
    .get(getProducts)
    .post(protect, authorize('SHOP_OWNER', 'ADMIN'), createProduct);

router.get('/compare', compareProducts);
router.post('/bulk-upload', protect, authorize('SHOP_OWNER'), upload.single('file'), bulkUploadProducts);

router.route('/:id')
    .get(getProductById)
    .put(protect, authorize('SHOP_OWNER', 'ADMIN'), updateProduct)
    .delete(protect, authorize('SHOP_OWNER', 'ADMIN'), deleteProduct);

module.exports = router;
