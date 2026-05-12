const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content:   { type: String, required: true, trim: true, maxlength: 500 },
        anonymous: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        anonymous: { type: Boolean, default: false },
        mood:      { type: String, default: '' },
        likes:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        comments:  [commentSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
