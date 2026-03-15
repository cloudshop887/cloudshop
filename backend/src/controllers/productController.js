const prisma = require('../utils/prisma');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    const { search, category, shopId, minPrice, maxPrice, sortBy } = req.query;

    try {
        // Build filters using AND array for robustness
        let where = {
            AND: [
                { isActive: true },
                {
                    shop: {
                        isActive: true,
                        isApproved: true
                    }
                }
            ]
        };

        // Multi-term search support
        if (search) {
            const terms = search.trim().split(/\s+/);
            terms.forEach(term => {
                where.AND.push({
                    OR: [
                        { name: { contains: term } },
                        { description: { contains: term } },
                        { category: { contains: term } },
                        { subcategory: { contains: term } },
                        { shop: { name: { contains: term } } }
                    ]
                });
            });
        }

        if (category && category !== 'All') {
            where.AND.push({ category: category });
        }

        if (shopId) {
            where.AND.push({ shopId: parseInt(shopId) });
        }

        // Price filtering
        if (minPrice || maxPrice) {
            const priceFilter = {};
            if (minPrice) priceFilter.gte = parseFloat(minPrice);
            if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
            where.AND.push({ price: priceFilter });
        }

        // Sorting
        let orderBy = { createdAt: 'desc' };
        if (sortBy === 'price_asc') orderBy = { price: 'asc' };
        if (sortBy === 'price_desc') orderBy = { price: 'desc' };
        if (sortBy === 'views') orderBy = { views: 'desc' };

        const products = await prisma.product.findMany({
            where,
            include: { shop: { select: { name: true, id: true } } },
            orderBy: orderBy
        });

        // Format response
        const formattedProducts = products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            subcategory: p.subcategory,
            imageUrl: p.imageUrl,
            shopId: p.shopId,
            shopName: p.shop.name,
            description: p.description
        }));

        res.json(formattedProducts);
    } catch (error) {
        console.error('getProducts error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Compare products by category
// @route   GET /api/products/compare
// @access  Public
const compareProducts = async (req, res) => {
    const { category, search, minPrice, maxPrice } = req.query;

    if (!category) {
        return res.status(400).json({ message: 'Category is required for comparison' });
    }

    try {
        const where = {
            isActive: true,
            category: category
        };

        if (search) {
            where.name = { contains: search };
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        const products = await prisma.product.findMany({
            where,
            include: { shop: { select: { name: true, id: true } } },
            orderBy: { price: 'asc' }
        });

        res.json(products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            imageUrl: p.imageUrl,
            shopId: p.shopId,
            shopName: p.shop.name
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { shop: { select: { name: true, id: true, ownerId: true } } }
        });

        if (product) {
            // Increment views
            await prisma.product.update({
                where: { id: parseInt(req.params.id) },
                data: { views: { increment: 1 } }
            });

            // Record viewed item if user is logged in (optional, handled in separate route or here if auth middleware used)

            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Shop Owner)
const createProduct = async (req, res) => {
    const { name, description, price, offerPrice, stock, imageUrl, category, subcategory } = req.body;

    try {
        // Find shop owned by user
        const shop = await prisma.shop.findUnique({
            where: { ownerId: req.user.id }
        });

        if (!shop) {
            return res.status(404).json({ message: 'No shop found for this user' });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                offerPrice: offerPrice ? parseFloat(offerPrice) : null,
                stock: parseInt(stock),
                imageUrl,
                category,
                subcategory,
                shopId: shop.id
            }
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Shop Owner)
const updateProduct = async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { shop: true }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check ownership
        if (product.shop.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data: req.body
        });

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Shop Owner)
const deleteProduct = async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { shop: true }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.shop.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await prisma.product.delete({
            where: { id: parseInt(req.params.id) }
        });

        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk upload products via Excel or CSV
// @route   POST /api/products/bulk-upload
// @access  Private (Shop Owner)
const bulkUploadProducts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an Excel (.xlsx, .xls) or CSV (.csv) file' });
        }

        const shop = await prisma.shop.findUnique({
            where: { ownerId: req.user.id }
        });

        if (!shop) {
            return res.status(404).json({ message: 'No shop found for this user' });
        }

        const xlsx = require('xlsx');
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const products = xlsx.utils.sheet_to_json(sheet);

        const createdProducts = [];
        const errors = [];

        for (const product of products) {
            try {
                // Basic validation
                if (!product.name || !product.price) {
                    errors.push({ product, error: 'Missing required fields (name, price)' });
                    continue;
                }

                const newProduct = await prisma.product.create({
                    data: {
                        name: product.name,
                        description: product.description || '',
                        price: parseFloat(product.price),
                        offerPrice: product.offerPrice ? parseFloat(product.offerPrice) : null,
                        stock: product.stock ? parseInt(product.stock) : 0,
                        imageUrl: product.imageUrl || '',
                        category: product.category || 'General',
                        subcategory: product.subcategory || '',
                        shopId: shop.id,
                        isActive: true
                    }
                });
                createdProducts.push(newProduct);
            } catch (err) {
                errors.push({ product, error: err.message });
            }
        }

        res.json({
            message: `Processed ${products.length} items`,
            successCount: createdProducts.length,
            failedCount: errors.length,
            errors
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, bulkUploadProducts, compareProducts };
