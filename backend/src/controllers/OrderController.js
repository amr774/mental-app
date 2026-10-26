const orderService = require('../services/OrderService');

class OrderController {
    async create(req, res) {
        try {
            const { items, customer, paymentMethod, deliveryFee, totalAmount } = req.body;
            if (!items?.length)    return res.status(400).json({ message: 'No items in order' });
            if (!customer?.fullName || !customer?.email || !customer?.phone ||
                !customer?.governorate || !customer?.address) {
                return res.status(400).json({ message: 'All customer fields are required' });
            }
            const order = await orderService.create({
                userId:        req.user?.id || null,
                items,
                customer,
                paymentMethod: paymentMethod || 'cash',
                deliveryFee:   Number(deliveryFee) || 70,
                totalAmount:   Number(totalAmount),
            });
            res.status(201).json(order);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    async getMyOrders(req, res) {
        try {
            const orders = await orderService.getByUser(req.user?.id);
            res.json(orders);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async getAllOrders(req, res) {
        try {
            const orders = await orderService.getAll();
            res.json(orders);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            const order = await orderService.updateStatus(req.params.id, status);
            if (!order) return res.status(404).json({ message: 'Order not found' });
            res.json(order);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }
}

module.exports = new OrderController();
