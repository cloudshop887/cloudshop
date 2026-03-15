const prisma = require('../utils/prisma');

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    try {
        const totalShops = await prisma.shop.count();
        const totalUsers = await prisma.user.count();
        const totalOrders = await prisma.order.count();

        // Use Prisma aggregation for total revenue
        const aggregateResult = await prisma.order.aggregate({
            _sum: {
                totalAmount: true
            }
        });
        const totalRevenue = aggregateResult._sum.totalAmount || 0;

        // Get monthly revenue for a chart (last 6 months)
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthName = date.toLocaleString('default', { month: 'short' });

            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            // Use aggregation for monthly revenue as well
            const monthlyAggregate = await prisma.order.aggregate({
                where: {
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                },
                _sum: {
                    totalAmount: true
                }
            });

            const monthRevenue = monthlyAggregate._sum.totalAmount || 0;
            last6Months.push({ month: monthName, revenue: parseFloat(monthRevenue) });
        }

        res.json({
            totalShops,
            totalUsers,
            totalOrders,
            totalRevenue: parseFloat(totalRevenue).toFixed(2),
            revenueChart: last6Months
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recent system activity
// @route   GET /api/admin/activity
// @access  Private (Admin)
const getSystemActivity = async (req, res) => {
    try {
        // Fetch recent alerts, shops, and orders as activity
        const recentShops = await prisma.shop.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { owner: { select: { fullName: true } } }
        });

        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { fullName: true } } }
        });

        const activity = [
            ...recentShops.map(s => ({
                id: `shop-${s.id}`,
                text: `New shop registered: ${s.name} by ${s.owner?.fullName || 'Unknown'}`,
                time: s.createdAt,
                type: 'SHOP'
            })),
            ...recentOrders.map(o => ({
                id: `order-${o.id}`,
                text: `New order #${o.id} placed by ${o.user?.fullName || 'Guest'}`,
                time: o.createdAt,
                type: 'ORDER'
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats, getSystemActivity };
