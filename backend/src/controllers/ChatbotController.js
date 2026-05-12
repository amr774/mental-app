const chatbotService = require("../services/ChatbotService");

class ChatbotController {

    async chat(req, res) {
        try {
            const { message, history } = req.body;
            const result = await chatbotService.respond(message, history || []);
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }
}

module.exports = new ChatbotController();
