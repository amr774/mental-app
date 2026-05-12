const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        mood: {
            type: String,
            required: true,
            trim: true,
        },
        note: {
            type: String,
            default: '',
            trim: true,
        },
    },
    { timestamps: true }
);

// Compound index for fast user+date queries
moodSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Mood', moodSchema);
