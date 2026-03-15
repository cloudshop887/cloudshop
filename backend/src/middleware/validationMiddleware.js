// Validation middleware for request data

/**
 * Validate shop registration data
 */
const validateShopRegistration = (req, res, next) => {
    const { name, address, latitude, longitude, category, openTime, closeTime } = req.body;
    const errors = [];

    if (!name || name.trim().length < 3) {
        errors.push('Shop name must be at least 3 characters long');
    }

    if (!address || address.trim().length < 10) {
        errors.push('Please provide a complete address');
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        errors.push('Invalid coordinates');
    }

    if (!category || category.trim().length === 0) {
        errors.push('Please select a category');
    }

    if (!openTime || !closeTime) {
        errors.push('Please provide opening and closing times');
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: errors.join(', ') });
    }

    next();
};

/**
 * Validate product creation data
 */
const validateProductCreation = (req, res, next) => {
    const { name, price, stock } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Product name must be at least 2 characters long');
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
        errors.push('Price must be a positive number');
    }

    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum < 0) {
        errors.push('Stock must be a non-negative number');
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: errors.join(', ') });
    }

    next();
};

/**
 * Validate user registration data
 */
const validateUserRegistration = (req, res, next) => {
    const { fullName, email, phone, password } = req.body;
    const errors = [];

    if (!fullName || fullName.trim().length < 2) {
        errors.push('Full name must be at least 2 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Please provide a valid email address');
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone || !phoneRegex.test(phone.replace(/\s+/g, ''))) {
        errors.push('Please provide a valid 10-digit phone number');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: errors.join(', ') });
    }

    next();
};

/**
 * Validate order creation data
 */
const validateOrderCreation = (req, res, next) => {
    const { items, deliveryAddress } = req.body;
    const errors = [];

    if (!items || !Array.isArray(items) || items.length === 0) {
        errors.push('Order must contain at least one item');
    }

    if (items && Array.isArray(items)) {
        items.forEach((item, index) => {
            if (!item.productId || !item.quantity || item.quantity <= 0) {
                errors.push(`Invalid item at position ${index + 1}`);
            }
        });
    }

    if (!deliveryAddress || deliveryAddress.trim().length < 10) {
        errors.push('Please provide a complete delivery address');
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: errors.join(', ') });
    }

    next();
};

/**
 * Sanitize string inputs to prevent XSS
 */
const sanitizeInputs = (req, res, next) => {
    const sanitize = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                // Remove HTML tags
                obj[key] = obj[key].replace(/<[^>]*>/g, '').trim();
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };

    if (req.body) {
        sanitize(req.body);
    }

    next();
};

module.exports = {
    validateShopRegistration,
    validateProductCreation,
    validateUserRegistration,
    validateOrderCreation,
    sanitizeInputs
};
