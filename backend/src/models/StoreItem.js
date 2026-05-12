const mongoose = require("mongoose");

const storeItemSchema = new mongoose.Schema({
    sellerId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerName:  { type: String, required: true },
    title:       { type: String, required: true },
    description: { type: String, default: "" },
    price:       { type: Number, required: true, min: 0 },
    category:    { type: String, default: "general" },
    condition:   { type: String, enum: ["new", "like-new", "good", "fair"], default: "good" },
    image:       { type: String, default: "" },
    status:      { type: String, enum: ["available", "sold"], default: "available" },
    contact:     { type: String, default: "" },  // phone / email / whatsapp
}, { timestamps: true });

module.exports = mongoose.model("StoreItem", storeItemSchema);
