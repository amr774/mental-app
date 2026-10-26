const express = require("express");
const cors    = require("cors");
const path    = require("path");
const rateLimit = require("express-rate-limit");
const routes  = require("./routes");

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

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
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
