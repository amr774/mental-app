const journalService = require("../services/JournalService");

class JournalController {
    async create(req, res) {
        try {
            const entry = await journalService.create(req.user.id, req.body);
            res.status(201).json(entry);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async getAll(req, res) {
        try {
            const entries = await journalService.getByUser(req.user.id);
            res.json(entries);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async update(req, res) {
        try {
            const entry = await journalService.update(req.params.id, req.user.id, req.body);
            res.json(entry);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await journalService.delete(req.params.id, req.user.id);
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }
}

module.exports = new JournalController();
