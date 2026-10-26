const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/ChatbotController");
const verifyToken = require("../middlewares/authMiddleware");

router.post("/chat", verifyToken, chatbotController.chat.bind(chatbotController));

module.exports = router;
