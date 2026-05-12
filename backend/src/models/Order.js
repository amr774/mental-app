const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

const orderItemSchema = new Schema({
    itemId:   { type: ObjectId, required: true },
    itemType: { type: String, enum: ['pet', 'store'], required: true },
    name:     { type: String, required: true },
    price:    { type: Number, required: true },
    image:    { type: String, default: '' },
}, { _id: false });

const orderSchema = new Schema({
    userId: { type: ObjectId, ref: 'User', default: null },
    items:  { type: [orderItemSchema], required: true },
    customer: {
        fullName:    { type: String, required: true, trim: true },
        email:       { type: String, required: true, trim: true },
        phone:       { type: String, required: true, trim: true },
        governorate: { type: String, required: true, trim: true },
        address:     { type: String, required: true, trim: true },
    },
    paymentMethod: { type: String, enum: ['cash', 'visa'], default: 'cash' },
    status:        { type: String, enum: ['pending', 'confirmed', 'cancelled', 'delivered'], default: 'pending' },
    deliveryFee:   { type: Number, default: 70 },
    totalAmount:   { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
