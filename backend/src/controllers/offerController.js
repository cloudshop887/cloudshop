const prisma = require('../utils/prisma');

/**
 * @desc    Get all active offers
 * @route   GET /api/offers
 * @access  Public
 */
const getAllOffers = async (req, res) => {
    try {
        const offers = await prisma.offer.findMany({
            where: {
                isActive: true,
                expiryDate: {
                    gte: new Date(),
                },
            },
            include: {
                shop: {
                    select: {
                        name: true,
                        category: true,
                        address: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get offers for a specific shop
 * @route   GET /api/offers/shop/:shopId
 * @access  Public
 */
const getShopOffers = async (req, res) => {
    try {
        const offers = await prisma.offer.findMany({
            where: {
                shopId: parseInt(req.params.shopId),
                isActive: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Create new offer
 * @route   POST /api/offers
 * @access  Private (Shop Owners/Admins)
 */
const createOffer = async (req, res) => {
    try {
        const { title, description, discount, code, expiryDate, imageUrl, shopId } = req.body;

        // Verify shop ownership if not admin
        if (req.user.role !== 'ADMIN') {
            const shop = await prisma.shop.findUnique({
                where: { ownerId: req.user.id }
            });
            if (!shop || shop.id !== parseInt(shopId)) {
                return res.status(401).json({ message: 'Not authorized to post for this shop' });
            }
        }

        const offer = await prisma.offer.create({
            data: {
                title,
                description,
                discount,
                code,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                imageUrl,
                shopId: parseInt(shopId)
            }
        });

        res.status(201).json(offer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Delete offer
 * @route   DELETE /api/offers/:id
 * @access  Private
 */
const deleteOffer = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const offer = await prisma.offer.findUnique({
            where: { id }
        });

        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        // Auth check
        if (req.user.role !== 'ADMIN') {
            const shop = await prisma.shop.findUnique({
                where: { ownerId: req.user.id }
            });
            if (!shop || shop.id !== offer.shopId) {
                return res.status(401).json({ message: 'Not authorized' });
            }
        }

        await prisma.offer.delete({
            where: { id }
        });

        res.json({ message: 'Offer removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllOffers,
    getShopOffers,
    createOffer,
    deleteOffer
};
