// routes/moodRoutes.js
const express     = require('express');
const router      = express.Router();
const moodService = require('../services/MoodService');
const verifyToken = require('../middlewares/authMiddleware');

/**
 * POST /moods
 * Body: { mood: string, note?: string }
 * Logs (or updates) today's mood for the logged-in user.
 */
router.post('/moods', verifyToken, async (req, res) => {
    try {
        const { mood, note } = req.body;

        if (!mood) {
            return res.status(400).json({ message: 'mood is required' });
        }

        const entry = await moodService.log(req.user.id, mood, note);
        res.status(201).json(entry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to save mood' });
    }
});

/**
 * GET /moods/history
 * Returns all mood entries for the logged-in user, newest first.
 */
router.get('/moods/history', verifyToken, async (req, res) => {
    try {
        const history = await moodService.getHistory(req.user.id);
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch mood history' });
    }
});

module.exports = router;
