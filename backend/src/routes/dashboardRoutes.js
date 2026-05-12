const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');

const Mood        = require('../models/Mood');
const Journal     = require('../models/Journal');
const Pet         = require('../models/Pet');
const Personality = require('../models/Personality');
const Post        = require('../models/Post');
const Goal        = require('../models/Goal');

router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Mood history for streak calculation
        const moods = await Mood.find({ userId }).sort({ createdAt: 1 });

        // Calculate streak
        let streak = 0;
        if (moods.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const moodDays = new Set(
                moods.map(m => new Date(m.createdAt).toISOString().slice(0, 10))
            );

            for (let i = 0; i < 365; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const key = d.toISOString().slice(0, 10);
                if (moodDays.has(key)) {
                    streak++;
                } else {
                    break;
                }
            }
        }

        const [journalCount, adoptedPets, personalityResult, postsCount, goals] =
            await Promise.all([
                Journal.countDocuments({ userId }),
                Pet.find({ adoptedBy: userId }),
                Personality.findOne({ userId }).sort({ createdAt: -1 }),
                Post.countDocuments({ userId }),
                Goal.find({ userId, archived: false }),
            ]);

        // Goals completed this week
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        weekStart.setHours(0, 0, 0, 0);
        const weekStartStr = weekStart.toISOString().slice(0, 10);

        const weekGoals = goals.filter(g => g.weekStart === weekStartStr);
        const goalsCompletedThisWeek = weekGoals.filter(
            g => g.completedDays.length >= g.targetDays
        ).length;

        res.json({
            moodCount: moods.length,
            streak,
            journalCount,
            adoptedPetsCount: adoptedPets.length,
            postsCount,
            goalsTotal: goals.length,
            goalsCompletedThisWeek,
            personality: personalityResult ? personalityResult.result : null,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
