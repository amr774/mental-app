const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/ChatbotController");

router.post("/chat", chatbotController.chat.bind(chatbotController));

module.exports = router;
