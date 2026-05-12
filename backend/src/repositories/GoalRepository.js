const BaseRepository = require('./BaseRepository');
const Goal = require('../models/Goal');

class GoalRepository extends BaseRepository {
    constructor() {
        super(Goal);
    }

    async getByUser(userId) {
        return this.model
            .find({ userId, archived: false })
            .sort({ createdAt: -1 });
    }

    async getByUserAndWeek(userId, weekStart) {
        return this.model.find({ userId, weekStart, archived: false });
    }
}

module.exports = new GoalRepository();
