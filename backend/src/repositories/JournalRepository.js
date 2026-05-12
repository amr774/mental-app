const BaseRepository = require("./BaseRepository");
const Journal = require("../models/Journal");

class JournalRepository extends BaseRepository {
    constructor() {
        super(Journal);
    }

    async findByUser(userId) {
        return this.model.find({ userId }).sort({ createdAt: -1 });
    }
}

module.exports = new JournalRepository();
