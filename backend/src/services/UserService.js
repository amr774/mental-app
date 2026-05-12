const bcrypt = require("bcrypt");
const userRepository = require("../repositories/UserRepository");

class UserService {

    async getProfile(userId) {
        const user = await userRepository.findById(userId);
        if (!user) throw { status: 404, message: "User not found" };
        const { password, resetToken, resetTokenExpiry, ...profile } = user.toObject();
        return profile;
    }

    async updateAvatar(userId, filename) {
        const url     = `/uploads/avatars/${filename}`;
        const updated = await userRepository.updateById(userId, { avatar: url });
        if (!updated) throw { status: 404, message: "User not found" };
        return { avatar: url };
    }

    async updateProfile(userId, name, currentPassword, newPassword) {
        const user = await userRepository.findById(userId);
        if (!user) throw { status: 404, message: "User not found" };

        const updates = {};

        if (name) updates.name = name;

        if (newPassword) {
            if (!currentPassword)
                throw { status: 400, message: "Current password is required" };

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch)
                throw { status: 400, message: "Current password is incorrect" };

            if (newPassword.length < 6)
                throw { status: 400, message: "New password must be at least 6 characters" };

            updates.password = await bcrypt.hash(newPassword, 10);
        }

        const updated = await userRepository.updateById(userId, updates);
        return { id: updated._id, name: updated.name, email: updated.email, role: updated.role };
    }

    async getWishlist(userId) {
        const user = await userRepository.getWishlist(userId);
        if (!user) throw { status: 404, message: "User not found" };
        return user.wishlist;
    }

    async addToWishlist(userId, petId) {
        const user = await userRepository.addToWishlist(userId, petId);
        if (!user) throw { status: 404, message: "User not found" };
        return user.wishlist;
    }

    async removeFromWishlist(userId, petId) {
        const user = await userRepository.removeFromWishlist(userId, petId);
        if (!user) throw { status: 404, message: "User not found" };
        return user.wishlist;
    }
}

module.exports = new UserService();
