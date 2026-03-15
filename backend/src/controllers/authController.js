const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');



const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { fullName, email, phone, password, role } = req.body;

    try {
        const userExists = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phone }
                ]
            }
        });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                phone,
                password: hashedPassword,
                profilePic: req.body.profilePic || null,
                role: role || 'USER'
            }
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            address: true,
            profilePic: true,
            role: true,
            createdAt: true
        }
    });

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/auth/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role (Admin)
// @route   PUT /api/auth/users/:id
// @access  Private (Admin)
const updateUserRole = async (req, res) => {
    const { role } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: parseInt(req.params.id) },
            data: { role }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id }
    });

    if (user) {
        user.fullName = req.body.fullName || user.fullName;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;
        user.profilePic = req.body.profilePic !== undefined ? req.body.profilePic : user.profilePic;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                profilePic: user.profilePic,
                password: user.password
            }
        });

        res.json({
            _id: updatedUser.id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            profilePic: updatedUser.profilePic,
            role: updatedUser.role,
            token: generateToken(updatedUser.id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire
        const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken,
                resetPasswordExpire
            }
        });

        const resetUrl = `${process.env.FRONTEND_URL || 'https://cloudshop-main.vercel.app'}/reset-password/${resetToken}`;

        const message = `You requested a password reset for your CloudShop account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 10 minutes.

If you didn't request this, please ignore this email.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request - CloudShop',
                message
            });

            console.log('✅ Password reset email sent to:', user.email);

            res.status(200).json({
                success: true,
                data: 'Password reset link has been sent to your email.',
                // ALWAYS return the URL in development so the user isn't stuck
                resetUrl: resetUrl
            });
        } catch (err) {
            console.error('❌ Email sending failed:', err.message);

            // Clean up the token since email failed
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetPasswordToken: null,
                    resetPasswordExpire: null
                }
            });

            return res.status(500).json({
                message: 'Failed to send reset email. Please try again later or contact support.'
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        console.log('Reset password attempt for token:', req.params.resettoken);
        console.log('Hashed token:', resetPasswordToken);

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken,
                resetPasswordExpire: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            console.log('No user found with valid token');
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        console.log('User found:', user.email);

        // Set new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpire: null
            }
        });

        console.log('Password updated successfully for:', user.email);

        res.status(200).json({
            success: true,
            data: 'Password updated successfully',
            token: generateToken(user.id)
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, getAllUsers, deleteUser, updateUserRole, forgotPassword, resetPassword };
