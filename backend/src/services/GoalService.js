const goalRepository = require('../repositories/GoalRepository');

class GoalService {

    async getAll(userId) {
        return goalRepository.getByUser(userId);
    }

    async create(userId, title, emoji, targetDays, weekStart) {
        if (!title || !title.trim())
            throw { status: 400, message: 'Goal title is required' };
        if (!weekStart)
            throw { status: 400, message: 'weekStart is required' };
        return goalRepository.create({
            userId,
            title: title.trim(),
            emoji: emoji || '🎯',
            targetDays: targetDays || 7,
            weekStart,
            completedDays: [],
        });
    }

    async toggleDay(goalId, userId, dateStr) {
        const goal = await goalRepository.findById(goalId);
        if (!goal) throw { status: 404, message: 'Goal not found' };
        if (goal.userId.toString() !== userId.toString())
            throw { status: 403, message: 'Not authorized' };

        const idx = goal.completedDays.indexOf(dateStr);
        if (idx >= 0) {
            goal.completedDays.splice(idx, 1);
        } else {
            goal.completedDays.push(dateStr);
        }
        await goal.save();
        return goal;
    }

    async delete(goalId, userId) {
        const goal = await goalRepository.findById(goalId);
        if (!goal) throw { status: 404, message: 'Goal not found' };
        if (goal.userId.toString() !== userId.toString())
            throw { status: 403, message: 'Not authorized' };
        await goalRepository.deleteById(goalId);
        return { message: 'Goal deleted' };
    }
}

module.exports = new GoalService();
