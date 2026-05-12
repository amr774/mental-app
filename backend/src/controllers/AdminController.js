const adminService = require("../services/AdminService");

class AdminController {

    async getStats(req, res) {
        try {
            const stats = await adminService.getStats();
            res.json({ stats });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await adminService.getAllUsers();
            res.json({ total: users.length, users });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async deleteUser(req, res) {
        try {
            const result = await adminService.deleteUser(req.params.id);
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async getPersonalityResults(req, res) {
        try {
            const data = await adminService.getPersonalityResults();
            res.json(data);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }
}

module.exports = new AdminController();
