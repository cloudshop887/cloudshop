const prisma = require('../utils/prisma');

const webpush = require('web-push');

webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

// @desc    Subscribe to push notifications
// @route   POST /api/notifications/subscribe
// @access  Public
const subscribe = async (req, res) => {
    try {
        const { endpoint, keys } = req.body;

        if (!endpoint || !keys) {
            return res.status(400).json({ message: 'Invalid subscription object' });
        }

        const subscription = await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: {
                p256dh: keys.p256dh,
                auth: keys.auth
            },
            create: {
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth
            }
        });

        res.status(201).json(subscription);
    } catch (error) {
        console.error('Push subscribe error:', error);
        res.status(500).json({ message: 'Error subscribing to notifications' });
    }
};

// Function to send push notification to all subscribers
const sendPushNotification = async (payload) => {
    try {
        const subscriptions = await prisma.pushSubscription.findMany();

        const notificationPayload = JSON.stringify(payload);

        const pushPromises = subscriptions.map(sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };

            return webpush.sendNotification(pushSubscription, notificationPayload)
                .catch(err => {
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        // Subscription expired or removed
                        return prisma.pushSubscription.delete({ where: { id: sub.id } });
                    }
                    console.error('Error sending push notification:', err);
                });
        });

        await Promise.all(pushPromises);
    } catch (error) {
        console.error('Error in sendPushNotification:', error);
    }
};

module.exports = {
    subscribe,
    sendPushNotification
};
