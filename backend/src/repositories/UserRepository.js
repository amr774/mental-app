const BaseRepository = require("./BaseRepository");
const User = require("../models/User");

class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async findByEmail(email) {
        return this.model.findOne({ email });
    }

    async findByResetToken(token) {
        return this.model.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() }
        });
    }

    async getWishlist(userId) {
        return this.model.findById(userId)
            .select("wishlist")
            .populate("wishlist", "name type personality description");
    }

    async addToWishlist(userId, petId) {
        return this.model.findByIdAndUpdate(
            userId,
            { $addToSet: { wishlist: petId } },
            { new: true }
        );
    }

    async removeFromWishlist(userId, petId) {
        return this.model.findByIdAndUpdate(
            userId,
            { $pull: { wishlist: petId } },
            { new: true }
        );
    }
}

module.exports = new UserRepository();
