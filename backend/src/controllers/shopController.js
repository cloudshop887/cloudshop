const prisma = require('../utils/prisma');

// @desc    Register a new shop
// @route   POST /api/shops
// @access  Private (Shop Owner)
const registerShop = async (req, res) => {
    const { name, description, address, latitude, longitude, category, openingHours, openTime, closeTime, logoUrl } = req.body;

    try {
        // Check if user already owns a shop
        const existingShop = await prisma.shop.findFirst({
            where: { ownerId: req.user.id }
        });

        if (existingShop) {
            return res.status(400).json({ message: 'You already own a shop' });
        }

        const shop = await prisma.shop.create({
            data: {
                name,
                description,
                address,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                category,
                openingHours,
                openTime,
                closeTime,
                logoUrl,
                ownerId: req.user.id,
                isApproved: false, // Requires admin approval
                isActive: true
            }
        });

        console.log('Shop created:', shop);
        // Return shop data. Role upgrade will happen on admin approval.
        res.status(201).json({
            ...shop, // Maintain compatibility
            shop,
            user: {
                id: req.user.id,
                fullName: req.user.fullName,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error('Shop registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
const getShops = async (req, res) => {
    const { keyword, category } = req.query;
    try {
        const whereClause = {
            isApproved: true,
            isActive: true
        };

        // Exclude the user's own shop if they're logged in
        if (req.user && req.user.id) {
            whereClause.ownerId = {
                not: req.user.id
            };
        }

        if (category && category !== 'All') {
            whereClause.category = category;
        }

        if (keyword) {
            whereClause.OR = [
                { name: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
                { address: { contains: keyword, mode: 'insensitive' } },
                { category: { contains: keyword, mode: 'insensitive' } }
            ];
        }

        const shops = await prisma.shop.findMany({
            where: whereClause,
            include: { owner: { select: { fullName: true } } },
            orderBy: { name: 'asc' }
        });

        const processedShops = shops.map(shop => ({
            ...shop,
            isOpen: isShopOpen(shop.openTime, shop.closeTime)
        }));

        res.json(processedShops);
    } catch (error) {
        console.error('Error fetching shops:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get shop by ID
// @route   GET /api/shops/:id
// @access  Public
const getShopById = async (req, res) => {
    try {
        const shop = await prisma.shop.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { products: true }
        });

        if (shop) {
            res.json(shop);
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update shop details
// @route   PUT /api/shops/:id
// @access  Private (Owner/Admin)
const updateShop = async (req, res) => {
    const { 
        name, description, address, latitude, longitude, 
        category, openTime, closeTime, bannerUrl, logoUrl,
        isPickupEnabled, isDeliveryEnabled,
        isReservePickDiscountEnabled, reservePickDiscountPercentage,
        bulkDiscountMinItems, bulkDiscountPercentage
    } = req.body;

    try {
        const shop = await prisma.shop.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        if (shop.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized to update this shop' });
        }

        const data = {};
        if (name !== undefined) data.name = name;
        if (description !== undefined) data.description = description;
        if (address !== undefined) data.address = address;
        if (latitude !== undefined) data.latitude = parseFloat(latitude);
        if (longitude !== undefined) data.longitude = parseFloat(longitude);
        if (category !== undefined) data.category = category;
        if (openTime !== undefined) data.openTime = openTime;
        if (closeTime !== undefined) data.closeTime = closeTime;
        if (bannerUrl !== undefined) data.bannerUrl = bannerUrl;
        if (logoUrl !== undefined) data.logoUrl = logoUrl;
        if (isPickupEnabled !== undefined) data.isPickupEnabled = Boolean(isPickupEnabled);
        if (isDeliveryEnabled !== undefined) data.isDeliveryEnabled = Boolean(isDeliveryEnabled);
        if (isReservePickDiscountEnabled !== undefined) data.isReservePickDiscountEnabled = Boolean(isReservePickDiscountEnabled);
        if (reservePickDiscountPercentage !== undefined) data.reservePickDiscountPercentage = parseFloat(reservePickDiscountPercentage);
        if (bulkDiscountMinItems !== undefined) data.bulkDiscountMinItems = parseInt(bulkDiscountMinItems);
        if (bulkDiscountPercentage !== undefined) data.bulkDiscountPercentage = parseFloat(bulkDiscountPercentage);

        const updatedShop = await prisma.shop.update({
            where: { id: parseInt(req.params.id) },
            data
        });

        res.json(updatedShop);
    } catch (error) {
        console.error('Update shop error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all shops (Admin)
// @route   GET /api/shops/admin/all
// @access  Private (Admin)
const getAllShopsAdmin = async (req, res) => {
    try {
        console.log('Admin fetching all shops...');
        const shops = await prisma.shop.findMany({
            include: { owner: { select: { fullName: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        console.log(`Found ${shops.length} shops`);
        res.json(shops);
    } catch (error) {
        console.error('Error fetching shops for admin:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a shop
// @route   PUT /api/shops/:id/approve
// @access  Private (Admin)
const approveShop = async (req, res) => {
    try {
        const shop = await prisma.shop.update({
            where: { id: parseInt(req.params.id) },
            data: { isApproved: true, isActive: true },
            include: { owner: true }
        });

        // Upgrade owner's role to SHOP_OWNER if they are a regular USER
        if (shop.owner && shop.owner.role === 'USER') {
            await prisma.user.update({
                where: { id: shop.ownerId },
                data: { role: 'SHOP_OWNER' }
            });
            console.log(`User ${shop.ownerId} upgraded to SHOP_OWNER upon shop approval.`);
        }

        res.json(shop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's shop
// @route   GET /api/shops/my-shop
// @access  Private (Shop Owner)
const getMyShop = async (req, res) => {
    try {
        const shop = await prisma.shop.findUnique({
            where: { ownerId: req.user.id },
            include: { products: true }
        });

        if (shop) {
            res.json(shop);
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper to check if shop is open
const isShopOpen = (openTime, closeTime) => {
    if (!openTime || !closeTime) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
};

const { calculateDistance } = require('../utils/distance');

// @desc    Get nearby shops
// @route   GET /api/shops/nearby
// @access  Public
const getNearbyShops = async (req, res) => {
    const { lat, lng, radius, category } = req.query; // radius in km

    if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and Longitude are required' });
    }

    const r = radius ? parseFloat(radius) : 5; // Default 5km

    try {
        const whereClause = {
            isActive: true,
            isApproved: true
        };

        if (category && category !== 'All') {
            whereClause.category = category;
        }

        // Fetch filtered active and approved shops
        const shops = await prisma.shop.findMany({
            where: whereClause
        });

        // Filter by distance and calculate remaining details in JS
        const processedShops = shops
            .map(shop => {
                const distance = calculateDistance(
                    parseFloat(lat),
                    parseFloat(lng),
                    shop.latitude,
                    shop.longitude
                );
                return {
                    ...shop,
                    distance: parseFloat(distance.toFixed(2)),
                    isOpen: isShopOpen(shop.openTime, shop.closeTime)
                };
            })
            .filter(shop => shop.distance <= r)
            .sort((a, b) => a.distance - b.distance);

        res.json(processedShops);
    } catch (error) {
        console.error('Error fetching nearby shops:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerShop, getShops, getShopById, updateShop, getAllShopsAdmin, approveShop, getMyShop, getNearbyShops, updateDiscountSettings };

// @desc    Update Reserve & Pick discount settings for a shop
// @route   PUT /api/shops/:id/discount-settings
// @access  Private (Shop Owner/Admin)
async function updateDiscountSettings(req, res) {
    const {
        isReservePickDiscountEnabled,
        reservePickDiscountPercentage,
        bulkDiscountMinItems,
        bulkDiscountPercentage,
    } = req.body;

    try {
        const shop = await prisma.shop.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        if (shop.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updated = await prisma.shop.update({
            where: { id: parseInt(req.params.id) },
            data: {
                isReservePickDiscountEnabled: Boolean(isReservePickDiscountEnabled),
                reservePickDiscountPercentage: reservePickDiscountPercentage != null
                    ? parseFloat(reservePickDiscountPercentage) : null,
                bulkDiscountMinItems: bulkDiscountMinItems != null
                    ? parseInt(bulkDiscountMinItems) : null,
                bulkDiscountPercentage: bulkDiscountPercentage != null
                    ? parseFloat(bulkDiscountPercentage) : null,
            },
        });

        res.json(updated);
    } catch (error) {
        console.error('Update discount settings error:', error);
        res.status(500).json({ message: error.message });
    }
}

