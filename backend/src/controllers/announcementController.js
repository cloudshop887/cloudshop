const prisma = require('../utils/prisma');

/**
 * @desc    Get all announcements
 * @route   GET /api/announcements
 * @access  Public
 */
const getAllAnnouncements = async (req, res) => {
    try {
        const { role } = req.query;
        const announcements = await prisma.announcement.findMany({
            where: {
                role: role ? { in: ['ALL', role] } : 'ALL'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Create new announcement
 * @route   POST /api/announcements
 * @access  Private (Admin)
 */
const createAnnouncement = async (req, res) => {
    try {
        const { title, message, type, role } = req.body;

        const announcement = await prisma.announcement.create({
            data: {
                title,
                message,
                type: type || 'INFO',
                role: role || 'ALL'
            }
        });

        res.status(201).json(announcement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Delete announcement
 * @route   DELETE /api/announcements/:id
 * @access  Private (Admin)
 */
const deleteAnnouncement = async (req, res) => {
    try {
        await prisma.announcement.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Announcement removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllAnnouncements,
    createAnnouncement,
    deleteAnnouncement
};
