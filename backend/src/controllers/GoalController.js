const goalService = require('../services/GoalService');

class GoalController {

    async getAll(req, res) {
        try {
            const goals = await goalService.getAll(req.user.id);
            res.json(goals);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async create(req, res) {
        try {
            const { title, emoji, targetDays, weekStart } = req.body;
            const goal = await goalService.create(req.user.id, title, emoji, targetDays, weekStart);
            res.status(201).json(goal);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async toggleDay(req, res) {
        try {
            const { date } = req.body;
            const goal = await goalService.toggleDay(req.params.id, req.user.id, date);
            res.json(goal);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await goalService.delete(req.params.id, req.user.id);
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }
}

module.exports = new GoalController();
