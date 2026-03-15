// Input validation utilities

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Validate price (must be positive number)
 */
export const isValidPrice = (price) => {
    const num = parseFloat(price);
    return !isNaN(num) && num > 0;
};

/**
 * Validate stock (must be non-negative integer)
 */
export const isValidStock = (stock) => {
    const num = parseInt(stock);
    return !isNaN(num) && num >= 0 && Number.isInteger(num);
};

/**
 * Validate coordinates
 */
export const isValidCoordinate = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    return (
        !isNaN(latitude) &&
        !isNaN(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
};

/**
 * Sanitize string input (remove HTML tags)
 */
export const sanitizeString = (str) => {
    if (!str) return '';
    return str.replace(/<[^>]*>/g, '').trim();
};

/**
 * Validate URL format
 */
export const isValidUrl = (url) => {
    if (!url) return true; // Optional field
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Validate time format (HH:MM)
 */
export const isValidTime = (time) => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
};

/**
 * Validate password strength
 */
export const isStrongPassword = (password) => {
    // At least 6 characters
    return password && password.length >= 6;
};

/**
 * Validate required field
 */
export const isRequired = (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== '';
};

/**
 * Validate form data
 */
export const validateForm = (data, rules) => {
    const errors = {};

    for (const [field, validators] of Object.entries(rules)) {
        const value = data[field];

        for (const validator of validators) {
            const result = validator(value, data);
            if (result !== true) {
                errors[field] = result;
                break;
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export default {
    isValidEmail,
    isValidPhone,
    isValidPrice,
    isValidStock,
    isValidCoordinate,
    sanitizeString,
    isValidUrl,
    isValidTime,
    isStrongPassword,
    isRequired,
    validateForm
};
