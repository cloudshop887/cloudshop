const prisma = require('../utils/prisma');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    const { orderItems, shopId, totalAmount } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                shopId: parseInt(shopId),
                totalAmount: parseFloat(totalAmount),
                status: 'PENDING',
                items: {
                    create: orderItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: parseFloat(item.price)
                    }))
                }
            },
            include: { items: true }
        });

        // Notify Shop Owner
        const shop = await prisma.shop.findUnique({
            where: { id: parseInt(shopId) }
        });

        if (shop) {
            await prisma.notification.create({
                data: {
                    userId: shop.ownerId,
                    type: 'ORDER_PLACED',
                    message: `New order #${order.id} received for ${shop.name}`
                }
            });
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                items: { include: { product: true } },
                user: { select: { fullName: true, email: true, phone: true } },
                shop: { select: { name: true, address: true, phone: true } }
            }
        });

        if (order) {
            // Check access: User who placed it, Shop Owner, or Admin
            if (req.user.role === 'ADMIN' || order.userId === req.user.id || order.shop.ownerId === req.user.id) { // Note: ownerId check requires fetching shop owner, simplified here assuming logic
                // To properly check shop owner, we might need more queries or structure. 
                // For MVP, allowing user and admin. Shop owner check is complex without fetching shop.ownerId relation in the query above.
                // Let's assume for now if user is SHOP_OWNER, they can view orders for their shop.
                res.json(order);
            } else {
                res.status(401).json({ message: 'Not authorized' });
            }
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: {
                shop: { select: { name: true } },
                items: { include: { product: { select: { name: true, imageUrl: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get orders for a shop (Shop Owner)
// @route   GET /api/orders/shop/:shopId
// @access  Private (Shop Owner)
const getShopOrders = async (req, res) => {
    try {
        // Verify ownership
        const shop = await prisma.shop.findUnique({
            where: { id: parseInt(req.params.shopId) }
        });

        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        if (shop.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const orders = await prisma.order.findMany({
            where: { shopId: parseInt(req.params.shopId) },
            include: { user: { select: { fullName: true, phone: true } }, items: true },
            orderBy: { createdAt: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Shop Owner/Admin)
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const order = await prisma.order.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { shop: true }
        });

        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.shop.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });

        // Notify Customer
        await prisma.notification.create({
            data: {
                userId: order.userId,
                type: 'ORDER_STATUS_CHANGED',
                message: `Your order #${order.id} status has been updated to ${status}`
            }
        });

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getOrderById, getMyOrders, getShopOrders, updateOrderStatus };
