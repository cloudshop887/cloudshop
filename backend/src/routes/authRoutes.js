const express = require('express');
const router = express.Router();
// const passport = require('passport');
const { registerUser, loginUser, getUserProfile, updateUserProfile, getAllUsers, deleteUser, updateUserRole, forgotPassword, resetPassword } = require('../controllers/authController');
const { sendOTP, verifyOTPAndLogin, resendOTP } = require('../controllers/otpController');
const { googleAuthSuccess, googleAuthFailure } = require('../controllers/googleAuthController');
const { firebaseLogin } = require('../controllers/firebaseAuthController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Firebase Authentication (Google/Phone OTP)
router.post('/firebase-login', firebaseLogin);

// Google OAuth Routes (Legacy - Commented out)
// router.get('/google',
//     passport.authenticate('google', { scope: ['profile', 'email'] })
// );

// router.get('/google/callback',
//     passport.authenticate('google', {
//         failureRedirect: '/api/auth/google/failure',
//         session: false
//     }),
//     googleAuthSuccess
// );

// router.get('/google/success', googleAuthSuccess);
// router.get('/google/failure', googleAuthFailure);

// OTP Authentication Routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPAndLogin);
router.post('/resend-otp', resendOTP);

// Traditional Email/Password Authentication
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Admin Routes
router.get('/users', protect, authorize('ADMIN'), getAllUsers);
router.route('/users/:id')
    .delete(protect, authorize('ADMIN'), deleteUser)
    .put(protect, authorize('ADMIN'), updateUserRole);

module.exports = router;
