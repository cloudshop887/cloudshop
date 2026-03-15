const prisma = require('../utils/prisma');

/**
 * Calculate the discounted price based on shop's Reserve & Pick discount settings.
 * @param {number} originalPrice
 * @param {number} quantity
 * @param {object} shop - shop with discount fields
 * @returns {{ discountPercentage, discountedPrice, bulkDiscountApplied, bulkDiscountPercentage }}
 */
const calculateReservationDiscount = (originalPrice, quantity, shop) => {
    let discountPercentage = 0;
    let bulkDiscountApplied = false;
    let bulkDiscountPercentage = 0;

    if (shop.isReservePickDiscountEnabled && shop.reservePickDiscountPercentage) {
        discountPercentage = parseFloat(shop.reservePickDiscountPercentage);

        // Check if bulk discount applies
        if (
            shop.bulkDiscountMinItems &&
            shop.bulkDiscountPercentage &&
            quantity >= shop.bulkDiscountMinItems
        ) {
            bulkDiscountApplied = true;
            bulkDiscountPercentage = parseFloat(shop.bulkDiscountPercentage);
            discountPercentage += bulkDiscountPercentage;
        }
    }

    const discountMultiplier = (100 - discountPercentage) / 100;
    const discountedPrice = parseFloat((originalPrice * discountMultiplier).toFixed(2));

    return { discountPercentage, discountedPrice, bulkDiscountApplied, bulkDiscountPercentage };
};

// @desc    Create a new reservation (Reserve & Pick)
// @route   POST /api/reservations
// @access  Private (User)
const createReservation = async (req, res) => {
    const { productId, shopId, quantity = 1, notes } = req.body;

    if (!productId || !shopId) {
        return res.status(400).json({ message: 'Product ID and Shop ID are required' });
    }

    try {
        // Fetch product and shop together
        const [product, shop] = await Promise.all([
            prisma.product.findUnique({ where: { id: parseInt(productId) } }),
            prisma.shop.findUnique({ where: { id: parseInt(shopId) } }),
        ]);

        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock for reservation' });
        }

        const originalPrice = parseFloat(product.offerPrice || product.price);
        const qty = parseInt(quantity);

        const { discountPercentage, discountedPrice, bulkDiscountApplied, bulkDiscountPercentage } =
            calculateReservationDiscount(originalPrice, qty, shop);

        const reservation = await prisma.reservation.create({
            data: {
                userId: req.user.id,
                productId: parseInt(productId),
                shopId: parseInt(shopId),
                quantity: qty,
                originalPrice,
                discountPercentage,
                discountedPrice,
                bulkDiscountApplied,
                bulkDiscountPercentage,
                status: 'PENDING',
                notes: notes || null,
            },
            include: {
                product: { select: { name: true, imageUrl: true, category: true } },
            },
        });

        // Notify shop owner
        await prisma.notification.create({
            data: {
                userId: shop.ownerId,
                type: 'RESERVATION_PLACED',
                message: `New reservation #${reservation.id} for ${product.name} by a customer.`,
            },
        });

        res.status(201).json({
            ...reservation,
            savingsAmount: parseFloat(((originalPrice - discountedPrice) * qty).toFixed(2)),
        });
    } catch (error) {
        console.error('Create reservation error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reservations for current user
// @route   GET /api/reservations/my-reservations
// @access  Private (User)
const getMyReservations = async (req, res) => {
    try {
        const reservations = await prisma.reservation.findMany({
            where: { userId: req.user.id },
            include: {
                product: { select: { name: true, imageUrl: true, category: true, price: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reservations for a shop (Shop Owner)
// @route   GET /api/reservations/shop/:shopId
// @access  Private (Shop Owner/Admin)
const getShopReservations = async (req, res) => {
    try {
        const shop = await prisma.shop.findUnique({
            where: { id: parseInt(req.params.shopId) },
        });
        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        if (shop.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const reservations = await prisma.reservation.findMany({
            where: { shopId: parseInt(req.params.shopId) },
            include: {
                user: { select: { fullName: true, phone: true, email: true } },
                product: { select: { name: true, imageUrl: true, category: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private (Shop Owner/Admin)
const updateReservationStatus = async (req, res) => {
    const { status } = req.body; // CONFIRMED, CANCELLED, PICKED_UP
    const validStatuses = ['CONFIRMED', 'CANCELLED', 'PICKED_UP'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const reservation = await prisma.reservation.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { product: true },
        });

        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

        // Verify shop owner
        const shop = await prisma.shop.findUnique({ where: { id: reservation.shopId } });
        if (shop.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updated = await prisma.reservation.update({
            where: { id: parseInt(req.params.id) },
            data: { status },
        });

        // Notify customer
        await prisma.notification.create({
            data: {
                userId: reservation.userId,
                type: 'RESERVATION_STATUS_CHANGED',
                message: `Your reservation #${reservation.id} for ${reservation.product.name} is now ${status}.`,
            },
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel a reservation (by user)
// @route   PUT /api/reservations/:id/cancel
// @access  Private (User)
const cancelReservation = async (req, res) => {
    try {
        const reservation = await prisma.reservation.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        if (reservation.userId !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (reservation.status === 'PICKED_UP') {
            return res.status(400).json({ message: 'Cannot cancel a picked-up reservation' });
        }

        const updated = await prisma.reservation.update({
            where: { id: parseInt(req.params.id) },
            data: { status: 'CANCELLED' },
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get discount preview for a product (before confirming reservation)
// @route   POST /api/reservations/preview-discount
// @access  Private (User)
const previewDiscount = async (req, res) => {
    const { productId, shopId, quantity = 1 } = req.body;
    try {
        const [product, shop] = await Promise.all([
            prisma.product.findUnique({ where: { id: parseInt(productId) } }),
            prisma.shop.findUnique({ where: { id: parseInt(shopId) } }),
        ]);

        if (!product || !shop) return res.status(404).json({ message: 'Product or shop not found' });

        const originalPrice = parseFloat(product.offerPrice || product.price);
        const qty = parseInt(quantity);
        const { discountPercentage, discountedPrice, bulkDiscountApplied, bulkDiscountPercentage } =
            calculateReservationDiscount(originalPrice, qty, shop);

        res.json({
            originalPrice,
            discountPercentage,
            discountedPrice,
            bulkDiscountApplied,
            bulkDiscountPercentage,
            totalOriginal: parseFloat((originalPrice * qty).toFixed(2)),
            totalDiscounted: parseFloat((discountedPrice * qty).toFixed(2)),
            totalSavings: parseFloat(((originalPrice - discountedPrice) * qty).toFixed(2)),
            isDiscountEnabled: shop.isReservePickDiscountEnabled || false,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReservation,
    getMyReservations,
    getShopReservations,
    updateReservationStatus,
    cancelReservation,
    previewDiscount,
};
