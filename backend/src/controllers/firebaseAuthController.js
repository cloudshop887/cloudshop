const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const admin = require('../config/firebaseAdmin'); // Import Admin SDK

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Firebase Authentication (Google/Phone)
// @route   POST /auth/firebase-login
// @access  Public
const firebaseLogin = async (req, res) => {
    const { idToken } = req.body; // Expect ID Token from frontend

    try {
        // Verify the ID token using Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture, phone_number } = decodedToken;

        console.log('🔥 Firebase Verified User:', { uid, email, phone_number });

        const firebaseUid = uid;
        const profilePic = picture;
        const fullName = name;
        const phoneNumber = phone_number;

        // Find user by email, phone, or firebaseUid
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    email ? { email } : {},
                    phoneNumber ? { phone: phoneNumber } : {},
                    firebaseUid ? { firebaseUid } : {}
                ].filter(condition => Object.keys(condition).length > 0)
            }
        });

        if (user) {
            // Update existing user with Firebase UID if not set
            if (!user.firebaseUid || !user.profilePic) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        firebaseUid,
                        profilePic: profilePic || user.profilePic,
                        fullName: fullName || user.fullName
                    }
                });
                console.log('✅ Updated existing user with Firebase UID');
            } else {
                console.log('✅ Existing user logged in');
            }
        } else {
            // Create new user
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await prisma.user.create({
                data: {
                    fullName: fullName || (phoneNumber ? `User ${phoneNumber.slice(-4)}` : 'User'),
                    email: email || null,
                    phone: phoneNumber || null,
                    password: hashedPassword,
                    profilePic: profilePic || null,
                    firebaseUid: firebaseUid || null,
                    role: 'USER'
                }
            });
            console.log('✅ New user created via Firebase:', user.email || user.phone);
        }

        // Generate JWT token
        const token = generateToken(user.id);

        res.json({
            _id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            profilePic: user.profilePic,
            role: user.role,
            token
        });
    } catch (error) {
        console.error('❌ Firebase auth error:', error.code, error.message);
        res.status(401).json({ message: error.message || 'Invalid Firebase Token', code: error.code });
    }
};

module.exports = {
    firebaseLogin
};
