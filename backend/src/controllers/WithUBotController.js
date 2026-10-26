const withUBotService = require("../services/WithUBotService");

exports.chat = async (req, res) => {
    try {
        const { message, history } = req.body;
        const result = await withUBotService.respond(message, history || []);
        res.json(result);
    } catch (err) {
        const status = err.status || 500;
        res.status(status).json({ message: err.message || "WithUBot error" });
    }
};
