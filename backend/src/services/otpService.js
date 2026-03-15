const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

/**
 * OTP Service - Handles all OTP-related operations
 */

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP using bcrypt
 * @param {string} otp - Plain OTP
 * @returns {Promise<string>} Hashed OTP
 */
const hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
};

/**
 * Verify OTP against hash
 * @param {string} otp - Plain OTP
 * @param {string} otpHash - Hashed OTP
 * @returns {Promise<boolean>} True if OTP matches
 */
const verifyOTP = async (otp, otpHash) => {
    return await bcrypt.compare(otp, otpHash);
};

/**
 * Create OTP record in database
 * @param {string} phone - Phone number
 * @param {string} otp - Plain OTP (will be hashed)
 * @returns {Promise<Object>} Created OTP record
 */
const createOTPRecord = async (phone, otp) => {
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Invalidate all previous OTPs for this phone
    await prisma.oTP.updateMany({
        where: {
            phone,
            used: false
        },
        data: {
            used: true
        }
    });

    // Create new OTP record
    const otpRecord = await prisma.oTP.create({
        data: {
            phone,
            otpHash,
            expiresAt
        }
    });

    return otpRecord;
};

/**
 * Find latest valid OTP for phone number
 * @param {string} phone - Phone number
 * @returns {Promise<Object|null>} OTP record or null
 */
const findLatestOTP = async (phone) => {
    return await prisma.oTP.findFirst({
        where: {
            phone,
            used: false,
            expiresAt: {
                gt: new Date() // Not expired
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

/**
 * Check if phone can request new OTP (rate limiting)
 * @param {string} phone - Phone number
 * @returns {Promise<boolean>} True if can request
 */
const canRequestOTP = async (phone) => {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const recentOTP = await prisma.oTP.findFirst({
        where: {
            phone,
            createdAt: {
                gt: oneMinuteAgo
            }
        }
    });

    return !recentOTP;
};

/**
 * Increment OTP attempt count
 * @param {number} otpId - OTP record ID
 * @returns {Promise<Object>} Updated OTP record
 */
const incrementAttempts = async (otpId) => {
    return await prisma.oTP.update({
        where: { id: otpId },
        data: {
            attempts: {
                increment: 1
            }
        }
    });
};

/**
 * Mark OTP as used
 * @param {number} otpId - OTP record ID
 * @returns {Promise<Object>} Updated OTP record
 */
const markOTPAsUsed = async (otpId) => {
    return await prisma.oTP.update({
        where: { id: otpId },
        data: {
            used: true
        }
    });
};

/**
 * Clean up expired OTPs (run periodically)
 * @returns {Promise<number>} Number of deleted records
 */
const cleanupExpiredOTPs = async () => {
    const result = await prisma.oTP.deleteMany({
        where: {
            OR: [
                {
                    expiresAt: {
                        lt: new Date()
                    }
                },
                {
                    used: true,
                    createdAt: {
                        lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Older than 24 hours
                    }
                }
            ]
        }
    });

    return result.count;
};

/**
 * Send OTP via SMS (mock implementation)
 * In production, integrate with SMS service like Twilio, AWS SNS, etc.
 * @param {string} phone - Phone number
 * @param {string} otp - OTP to send
 * @returns {Promise<boolean>} True if sent successfully
 */
const sendOTPViaSMS = async (phone, otp) => {
    // Mock implementation - just log to console
    console.log(`📱 Sending OTP to ${phone}: ${otp}`);
    console.log(`⚠️  This is a MOCK implementation. In production, integrate with SMS service.`);

    // In production, use actual SMS service:
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
        body: `Your CloudShop OTP is: ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
    });
    */

    return true;
};

module.exports = {
    generateOTP,
    hashOTP,
    verifyOTP,
    createOTPRecord,
    findLatestOTP,
    canRequestOTP,
    incrementAttempts,
    markOTPAsUsed,
    cleanupExpiredOTPs,
    sendOTPViaSMS
};
