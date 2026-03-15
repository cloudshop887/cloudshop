const prisma = require('../utils/prisma');
const Joi = require('joi');
const { getIo } = require('../socket');

// Validation schema for Alert
const alertSchema = Joi.object({
    title: Joi.string().required().max(100),
    description: Joi.string().required(),
    type: Joi.string().required().valid(
        'EMERGENCY',
        'COMMUNITY',
        'OFFER',
        'GENERAL'
    ),
    location: Joi.string().required(),
    latitude: Joi.number().optional().allow(null),
    longitude: Joi.number().optional().allow(null),
    imageUrl: Joi.string().uri().allow('', null),
    anonymous: Joi.boolean().default(false)
});

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Public (Guest or User)
const createAlert = async (req, res) => {
    try {
        const { error, value } = alertSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const ipAddress = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
        const userId = req.user ? req.user.id : null;

        const alert = await prisma.alert.create({
            data: {
                ...value,
                ipAddress,
                userId: value.anonymous ? null : userId,
                anonymous: value.anonymous || !userId
            },
            include: {
                user: {
                    select: { fullName: true }
                }
            }
        });

        // Broadcast via Socket.io
        const io = getIo();
        io.emit('new_alert', alert);

        // Send Push Notifications (Optional: filter by distance logic could be here too)
        try {
            const { sendPushNotification } = require('./pushNotificationController');
            sendPushNotification({
                title: `${alert.type === 'EMERGENCY' ? '🚨' : '📢'} ${alert.type} Alert`,
                body: alert.title,
                icon: '/icon.png',
                data: { url: `/alerts/${alert.id}` }
            });
        } catch (pushErr) {
            console.error('Push notification failed:', pushErr);
        }

        res.status(201).json(alert);
    } catch (error) {
        console.error('Error creating alert:', error);
        res.status(500).json({ message: 'Server error while creating alert' });
    }
};

const { calculateDistance } = require('../utils/distance');

// @desc    Get all alerts with distance filtering
// @route   GET /api/alerts
// @access  Public
const getAlerts = async (req, res) => {
    try {
        // Auto-delete alerts older than 1 week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        await prisma.alert.deleteMany({
            where: {
                createdAt: { lt: oneWeekAgo }
            }
        });

        const { type, lat, lng, radius, search } = req.query;

        const r = radius ? parseFloat(radius) : 10; // Default 10km for alerts

        let alerts;

        if (lat && lng) {
            // Fetch all alerts (or we could apply type/search filters here in Prisma first)
            const where = {};
            if (type) where.type = type;
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }

            const allAlerts = await prisma.alert.findMany({
                where,
                include: { user: { select: { fullName: true } } },
                orderBy: { createdAt: 'desc' }
            });

            // Filter by distance in JS
            alerts = allAlerts.map(alert => {
                const distance = calculateDistance(
                    parseFloat(lat),
                    parseFloat(lng),
                    alert.latitude,
                    alert.longitude
                );
                return {
                    ...alert,
                    distance: parseFloat(distance.toFixed(2)),
                    userName: alert.user ? alert.user.fullName : (alert.anonymous ? 'Anonymous' : 'Guest')
                };
            }).filter(alert => alert.distance <= r);

        } else {
            const where = {};
            if (type && type !== 'All') where.type = type; // Handle 'All' from frontend
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }

            const rawAlerts = await prisma.alert.findMany({
                where,
                include: { user: { select: { fullName: true } } },
                orderBy: { createdAt: 'desc' }
            });

            alerts = rawAlerts.map(alert => ({
                ...alert,
                distance: null, // No distance available
                userName: alert.user ? alert.user.fullName : (alert.anonymous ? 'Anonymous' : 'Guest')
            }));
        }

        res.json(alerts);
    } catch (error) {
        console.error('SERVER 500 ERROR IN getAlerts:', error);
        res.status(500).json({
            message: 'Server error while fetching alerts',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Get single alert
const getAlertById = async (req, res) => {
    try {
        const alert = await prisma.alert.findUnique({
            where: { id: req.params.id },
            include: { user: { select: { fullName: true } } }
        });

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        res.json(alert);
    } catch (error) {
        console.error('Error fetching alert:', error);
        res.status(500).json({ message: 'Server error while fetching alert' });
    }
};

module.exports = {
    createAlert,
    getAlerts,
    getAlertById
};
