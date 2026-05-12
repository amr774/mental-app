const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        emoji: {
            type: String,
            default: '🎯',
        },
        targetDays: {
            type: Number,
            default: 7,
        },
        completedDays: [{ type: String }], // ISO date strings "2024-01-15"
        weekStart: {
            type: String,
            required: true, // ISO date string of week Monday
        },
        archived: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

goalSchema.index({ userId: 1, weekStart: -1 });

module.exports = mongoose.model('Goal', goalSchema);
