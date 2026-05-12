const Order = require('../models/Order');

class OrderService {
    async create(data) {
        const order = new Order(data);
        return await order.save();
    }

    async getAll() {
        return Order.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'name email');
    }

    async getByUser(userId) {
        return Order.find({ userId }).sort({ createdAt: -1 });
    }

    async updateStatus(id, status) {
        return Order.findByIdAndUpdate(id, { status }, { new: true });
    }
}

module.exports = new OrderService();
