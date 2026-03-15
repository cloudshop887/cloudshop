const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const http = require('http');
// const passport = require('./src/config/passport'); // Import passport config
const { init } = require('./src/socket');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = init(server);

const PORT = process.env.PORT || 5000;

const authRoutes = require('./src/routes/authRoutes');
const shopRoutes = require('./src/routes/shopRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const distanceRoutes = require('./src/routes/distanceRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Secure origin for production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
// app.use(passport.initialize()); // Initialize Passport

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/distance', distanceRoutes);
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/lost-found', require('./src/routes/lostFoundRoutes'));
app.use('/api/jobs', require('./src/routes/jobRoutes'));
app.use('/api/announcements', require('./src/routes/announcementRoutes'));
app.use('/api/offers', require('./src/routes/offerRoutes'));
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/reservations', require('./src/routes/reservationRoutes'));

app.get('/', (req, res) => {
    res.send('Community Alert Platform API is running...');
});

// Error Handling Middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

// Start Server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

