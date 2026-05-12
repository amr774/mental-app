const BaseRepository = require("./BaseRepository");
const Pet = require("../models/Pet");

class PetRepository extends BaseRepository {
    constructor() {
        super(Pet);
    }

    async filter(type, personality, search) {
        const query = {};
        if (type)        query.type        = { $regex: type,        $options: "i" };
        if (personality) query.personality = { $regex: personality, $options: "i" };
        if (search) {
            query.$or = [
                { name:        { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { personality: { $regex: search, $options: "i" } },
                { type:        { $regex: search, $options: "i" } },
            ];
        }
        return this.model.find(query);
    }

    async findByPersonality(mood) {
        return this.model.find({
            personality: { $regex: mood, $options: "i" }
        }).limit(3);
    }

    async findAdoptedByUser(userId) {
        return this.model.find({ adoptedBy: userId });
    }
}

module.exports = new PetRepository();
