// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Prisma errors
    if (err.code === 'P2002') {
        return res.status(400).json({
            message: 'A record with this information already exists',
            field: err.meta?.target
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            message: 'Record not found'
        });
    }

    if (err.code === 'P2003') {
        return res.status(400).json({
            message: 'Invalid reference to related record'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'Token expired'
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation failed',
            errors: err.errors
        });
    }

    // Default error
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

// 404 handler
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = { errorHandler, notFound };
