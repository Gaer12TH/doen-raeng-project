require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Proxy (Required for Render/Railway Load Balancers)
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting (Market Standard: Prevent Abuse)
// Allow 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later. (ใจเย็นๆ วัยรุ่น กดรัวเกินไปแล้ว)' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Doen Raeng, Load Der API is running! 🚀');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
