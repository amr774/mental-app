const BaseRepository = require("./BaseRepository");
const Personality = require("../models/Personality");

class PersonalityRepository extends BaseRepository {
    constructor() {
        super(Personality);
    }

    async findByUser(userId) {
        return this.model.find({ userId }).sort({ createdAt: -1 });
    }

    async findAllWithUsers() {
        return this.model.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
    }
}

module.exports = new PersonalityRepository();
