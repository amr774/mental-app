const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");
const emotionController = require("../controllers/EmotionController");

// Public health check — no auth needed
router.get("/emotion/health", emotionController.health.bind(emotionController));

// Predict — requires auth
router.post("/emotion/predict", verifyToken, emotionController.predict.bind(emotionController));

module.exports = router;
