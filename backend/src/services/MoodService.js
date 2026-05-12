const moodRepository = require('../repositories/MoodRepository');

class MoodService {
    /**
     * Log (or update) today's mood for a user.
     * If the user already logged a mood today, it updates it instead.
     */
    async log(userId, mood, note = '') {
        const existing = await moodRepository.findTodayEntry(userId);

        if (existing) {
            existing.mood = mood;
            existing.note = note;
            await existing.save();
            return existing;
        }

        return moodRepository.create({ userId, mood, note });
    }

    /**
     * Get all mood entries for a user, newest first.
     */
    async getHistory(userId) {
        return moodRepository.findByUser(userId);
    }
}

module.exports = new MoodService();
