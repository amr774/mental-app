const userService = require("../services/UserService");
const upload      = require("../middlewares/uploadMiddleware");

class UserController {

    async getProfile(req, res) {
        try {
            const user = await userService.getProfile(req.user.id);
            res.json({ user });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const { name, currentPassword, newPassword } = req.body;
            const user = await userService.updateProfile(req.user.id, name, currentPassword, newPassword);
            res.json({ message: "Profile updated successfully", user });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async getWishlist(req, res) {
        try {
            const wishlist = await userService.getWishlist(req.user.id);
            res.json({ wishlist });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async addToWishlist(req, res) {
        try {
            const wishlist = await userService.addToWishlist(req.user.id, req.params.petId);
            res.json({ message: "Pet added to wishlist ✅", wishlist });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    uploadAvatar(req, res) {
        upload.single("avatar")(req, res, async (err) => {
            if (err) return res.status(400).json({ message: err.message });
            if (!req.file) return res.status(400).json({ message: "No file uploaded" });
            try {
                const result = await userService.updateAvatar(req.user.id, req.file.filename);
                res.json(result);
            } catch (e) {
                res.status(e.status || 500).json({ message: e.message });
            }
        });
    }

    async removeFromWishlist(req, res) {
        try {
            const wishlist = await userService.removeFromWishlist(req.user.id, req.params.petId);
            res.json({ message: "Pet removed from wishlist ✅", wishlist });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }
}

module.exports = new UserController();
