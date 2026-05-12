const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    type:        { type: String },
    personality: { type: String },
    description: { type: String },
    image:       { type: String, default: "" },
    price:       { type: Number, default: 0 },
    contact:     { type: String, default: "" },
    status:      { type: String, enum: ["available", "sold"], default: "available" },
    adoptedBy:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("Pet", petSchema);
