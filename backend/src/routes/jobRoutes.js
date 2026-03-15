const express = require('express');
const router = express.Router();
const {
    getAllJobs,
    getJobsByShop,
    createJob,
    updateJob,
    deleteJob
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getAllJobs)
    .post(protect, authorize('SHOP_OWNER', 'ADMIN'), createJob);

router.route('/shop/:shopId')
    .get(getJobsByShop);

router.route('/:id')
    .put(protect, authorize('SHOP_OWNER', 'ADMIN'), updateJob)
    .delete(protect, authorize('SHOP_OWNER', 'ADMIN'), deleteJob);

module.exports = router;
