const express = require("express");
const cors    = require("cors");
const mongoose = require('mongoose');
const rateLimit = require("express-rate-limit");
const routes  = require("./routes");

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(value => value.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.disable('x-powered-by');
app.use((req, res, next) => { res.setHeader('X-Content-Type-Options', 'nosniff'); next(); });
app.use(express.json({ limit: '5mb' }));

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again in 15 minutes." },
});

app.use(generalLimiter);
app.use("/login", authLimiter);
app.use("/register", authLimiter);
app.use("/forgot-password", authLimiter);

// Serve uploaded avatars
app.use("/uploads", express.static(require('./config/uploads')));
app.get('/health', (req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'unavailable' });
});

// Health check
app.get("/", (req, res) => res.json({ message: "Mental Health API running ✅" }));

// All routes
app.use(routes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Request too large' });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON' });
    if (err.name === 'MulterError') return res.status(400).json({ message: 'Invalid upload or file too large' });
    console.error(err.name || 'Request failed');
    res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
