const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Google OAuth Success Handler
// @route   GET /api/auth/google/success
// @access  Public (but requires successful OAuth)
const googleAuthSuccess = (req, res) => {
    if (req.user) {
        const token = generateToken(req.user.id);

        // Redirect to frontend with token and user data
        const frontendURL = process.env.FRONTEND_URL || 'https://cloudshop-main.vercel.app';

        // Encode user data for URL
        const userData = encodeURIComponent(JSON.stringify({
            _id: req.user.id,
            fullName: req.user.fullName,
            email: req.user.email,
            profilePic: req.user.profilePic,
            role: req.user.role,
            token
        }));

        // Redirect to frontend with user data
        res.redirect(`${frontendURL}/auth/google/callback?user=${userData}`);
    } else {
        res.redirect(`${process.env.FRONTEND_URL || 'https://cloudshop-main.vercel.app'}/login?error=auth_failed`);
    }
};

// @desc    Google OAuth Failure Handler
// @route   GET /api/auth/google/failure
// @access  Public
const googleAuthFailure = (req, res) => {
    const frontendURL = process.env.FRONTEND_URL || 'https://cloudshop-main.vercel.app';
    res.redirect(`${frontendURL}/login?error=google_auth_failed`);
};

module.exports = {
    googleAuthSuccess,
    googleAuthFailure
};
