const prisma = require('../utils/prisma');

/**
 * @desc    Get all lost and found items
 * @route   GET /api/lost-found
 * @access  Public
 */
const getAllLostFound = async (req, res) => {
    try {
        const { type, status } = req.query;
        const items = await prisma.lostAndFound.findMany({
            where: {
                ...(type && { type }),
                ...(status && { status }),
            },
            include: {
                user: {
                    select: {
                        fullName: true,
                        phone: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get single lost and found item
 * @route   GET /api/lost-found/:id
 * @access  Public
 */
const getLostFoundById = async (req, res) => {
    try {
        const item = await prisma.lostAndFound.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                user: {
                    select: {
                        fullName: true,
                        phone: true,
                    }
                }
            }
        });

        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Create new lost and found item
 * @route   POST /api/lost-found
 * @access  Private
 */
const createLostFound = async (req, res) => {
    try {
        const { type, title, description, location, contact, imageUrl } = req.body;

        const item = await prisma.lostAndFound.create({
            data: {
                type,
                title,
                description,
                location,
                contact,
                imageUrl,
                userId: req.user.id
            }
        });

        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Update lost and found item
 * @route   PUT /api/lost-found/:id
 * @access  Private
 */
const updateLostFound = async (req, res) => {
    try {
        const { status, title, description, location, contact, imageUrl } = req.body;
        const id = parseInt(req.params.id);

        const item = await prisma.lostAndFound.findUnique({
            where: { id }
        });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if user is owner or admin
        if (item.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedItem = await prisma.lostAndFound.update({
            where: { id },
            data: {
                status,
                title,
                description,
                location,
                contact,
                imageUrl
            }
        });

        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Delete lost and found item
 * @route   DELETE /api/lost-found/:id
 * @access  Private
 */
const deleteLostFound = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const item = await prisma.lostAndFound.findUnique({
            where: { id }
        });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await prisma.lostAndFound.delete({
            where: { id }
        });

        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllLostFound,
    getLostFoundById,
    createLostFound,
    updateLostFound,
    deleteLostFound
};
