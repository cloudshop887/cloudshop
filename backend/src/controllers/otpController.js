const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');
const {
    generateOTP,
    createOTPRecord,
    findLatestOTP,
    canRequestOTP,
    incrementAttempts,
    markOTPAsUsed,
    verifyOTP,
    sendOTPViaSMS
} = require('../services/otpService');

/**
 * Generate JWT token
 * @param {number} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @desc    Send OTP to phone number
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        // Validate phone number
        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Validate phone format (Indian format: +91XXXXXXXXXX or 10 digits)
        const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
        const cleanPhone = phone.replace(/\s+/g, '');

        if (!phoneRegex.test(cleanPhone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format. Use +91XXXXXXXXXX or 10 digits starting with 6-9'
            });
        }

        // Normalize phone number (ensure +91 prefix)
        const normalizedPhone = cleanPhone.startsWith('+91')
            ? cleanPhone
            : `+91${cleanPhone}`;

        // Check rate limiting (1 OTP per 60 seconds)
        const canRequest = await canRequestOTP(normalizedPhone);
        if (!canRequest) {
            return res.status(429).json({
                success: false,
                message: 'Please wait 60 seconds before requesting another OTP',
                retryAfter: 60
            });
        }

        // Generate OTP
        const otp = generateOTP();

        // Create OTP record in database
        await createOTPRecord(normalizedPhone, otp);

        // Send OTP via SMS
        await sendOTPViaSMS(normalizedPhone, otp);

        console.log(`✅ OTP sent to ${normalizedPhone}: ${otp}`); // Remove in production

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            phone: normalizedPhone,
            // For development only - remove in production
            ...(process.env.NODE_ENV !== 'production' && { otp })
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP. Please try again.'
        });
    }
};

/**
 * @desc    Verify OTP and login/register user
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTPAndLogin = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        // Validate input
        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and OTP are required'
            });
        }

        // Normalize phone number
        const cleanPhone = phone.replace(/\s+/g, '');
        const normalizedPhone = cleanPhone.startsWith('+91')
            ? cleanPhone
            : `+91${cleanPhone}`;

        // Find latest valid OTP
        const otpRecord = await findLatestOTP(normalizedPhone);

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP. Please request a new one.'
            });
        }

        // Check if OTP is already used
        if (otpRecord.used) {
            return res.status(400).json({
                success: false,
                message: 'OTP already used. Please request a new one.'
            });
        }

        // Check if OTP has expired
        if (new Date() > otpRecord.expiresAt) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Check attempt limit
        if (otpRecord.attempts >= 5) {
            // Mark as used to prevent further attempts
            await markOTPAsUsed(otpRecord.id);

            return res.status(400).json({
                success: false,
                message: 'Maximum attempts exceeded. Please request a new OTP.'
            });
        }

        // Verify OTP
        const isValid = await verifyOTP(otp, otpRecord.otpHash);

        if (!isValid) {
            // Increment attempt count
            await incrementAttempts(otpRecord.id);

            const remainingAttempts = 5 - (otpRecord.attempts + 1);

            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
                remainingAttempts
            });
        }

        // OTP is valid - mark as used
        await markOTPAsUsed(otpRecord.id);

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { phone: normalizedPhone },
            select: {
                id: true,
                phone: true,
                fullName: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        if (!user) {
            // Create new user
            user = await prisma.user.create({
                data: {
                    phone: normalizedPhone,
                    fullName: `User ${normalizedPhone.slice(-4)}`, // Default name
                    email: `${normalizedPhone.replace('+', '')}@cloudshop.temp`, // Temporary email
                    password: await require('bcryptjs').hash(Math.random().toString(36), 10), // Random password
                    role: 'USER'
                },
                select: {
                    id: true,
                    phone: true,
                    fullName: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            });

            console.log(`✅ New user created via OTP: ${normalizedPhone}`);
        }

        // Generate JWT token
        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                _id: user.id,
                phone: user.phone,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP. Please try again.'
        });
    }
};

/**
 * @desc    Resend OTP (same as send OTP but with different message)
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOTP = async (req, res) => {
    // Reuse sendOTP logic
    await sendOTP(req, res);
};

module.exports = {
    sendOTP,
    verifyOTPAndLogin,
    resendOTP
};
