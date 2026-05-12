const authService = require("../services/AuthService");

class AuthController {

    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            const user = await authService.register(name, email, password);
            res.status(201).json({ message: "User registered successfully", user });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const data = await authService.login(email, password);
            res.json({ message: "Login successful", ...data });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async forgotPassword(req, res) {
        try {
            const result = await authService.forgotPassword(req.body.email);
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async resetPassword(req, res) {
        try {
            const { email, resetToken, newPassword } = req.body;
            const result = await authService.resetPassword(email, resetToken, newPassword);
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }
}

module.exports = new AuthController();
