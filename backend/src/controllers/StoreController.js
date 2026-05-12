const storeService = require("../services/StoreService");

class StoreController {

    async getAll(req, res) {
        try {
            const { search, category, status } = req.query;
            const items = await storeService.getAll(search, category, status);
            res.json(items);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async getMine(req, res) {
        try {
            const items = await storeService.getMyItems(req.user.id);
            res.json(items);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async create(req, res) {
        try {
            const item = await storeService.create(
                req.user.id,
                req.user.name || "User",
                req.body
            );
            res.status(201).json(item);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async getAdminAll(req, res) {
        try {
            const { search, category } = req.query;
            const items = await storeService.getAdminAll(search, category);
            res.json(items);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async update(req, res) {
        try {
            const item = await storeService.update(req.params.id, req.body, req.user.id, req.user.role);
            res.json(item);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async markSold(req, res) {
        try {
            const item = await storeService.markSold(req.params.id, req.user.id, req.user.role);
            res.json(item);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await storeService.delete(req.params.id, req.user.id, req.user.role);
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }
}

module.exports = new StoreController();
