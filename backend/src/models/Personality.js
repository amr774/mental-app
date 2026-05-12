const mongoose = require("mongoose");

const personalitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    answers: { type: [Number], required: true },
    result: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Personality", personalitySchema);
