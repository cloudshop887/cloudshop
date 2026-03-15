const prisma = require('../utils/prisma');

/**
 * @desc    Get all job vacancies
 * @route   GET /api/jobs
 * @access  Public
 */
const getAllJobs = async (req, res) => {
    try {
        const jobs = await prisma.jobVacancy.findMany({
            where: { isActive: true },
            include: {
                shop: {
                    select: {
                        name: true,
                        address: true,
                        category: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get jobs by shop
 * @route   GET /api/jobs/shop/:shopId
 * @access  Public
 */
const getJobsByShop = async (req, res) => {
    try {
        const jobs = await prisma.jobVacancy.findMany({
            where: { shopId: parseInt(req.params.shopId) },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Create new job vacancy
 * @route   POST /api/jobs
 * @access  Private (Shop Owner)
 */
const createJob = async (req, res) => {
    try {
        const { title, description, salary, jobType, requirements, shopId } = req.body;

        // Verify shop ownership
        const shop = await prisma.shop.findUnique({
            where: { id: parseInt(shopId) }
        });

        if (!shop || shop.ownerId !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to post for this shop' });
        }

        const job = await prisma.jobVacancy.create({
            data: {
                title,
                description,
                salary,
                jobType,
                requirements,
                shopId: parseInt(shopId)
            }
        });

        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Update job vacancy
 * @route   PUT /api/jobs/:id
 * @access  Private (Shop Owner)
 */
const updateJob = async (req, res) => {
    try {
        const { title, description, salary, jobType, requirements, isActive } = req.body;
        const id = parseInt(req.params.id);

        const job = await prisma.jobVacancy.findUnique({
            where: { id },
            include: { shop: true }
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.shop.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedJob = await prisma.jobVacancy.update({
            where: { id },
            data: {
                title,
                description,
                salary,
                jobType,
                requirements,
                isActive
            }
        });

        res.json(updatedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Delete job vacancy
 * @route   DELETE /api/jobs/:id
 * @access  Private (Shop Owner)
 */
const deleteJob = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const job = await prisma.jobVacancy.findUnique({
            where: { id },
            include: { shop: true }
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.shop.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await prisma.jobVacancy.delete({
            where: { id }
        });

        res.json({ message: 'Job removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllJobs,
    getJobsByShop,
    createJob,
    updateJob,
    deleteJob
};
