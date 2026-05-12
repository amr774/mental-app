const BaseRepository = require('./BaseRepository');
const Mood = require('../models/Mood');

class MoodRepository extends BaseRepository {
    constructor() {
        super(Mood);
    }

    /** All entries for a user, newest first */
    async findByUser(userId) {
        return this.model.find({ userId }).sort({ createdAt: -1 });
    }

    /** Find today's entry for a user (if any) */
    async findTodayEntry(userId) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        return this.model.findOne({
            userId,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
        });
    }
}

module.exports = new MoodRepository();
