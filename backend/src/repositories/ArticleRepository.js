const BaseRepository = require("./BaseRepository");
const Article = require("../models/Article");

class ArticleRepository extends BaseRepository {
    constructor() {
        super(Article);
    }

    async search(search, category, page = 1, limit = 10) {
        const filter = {};
        if (search) filter.title = { $regex: search, $options: "i" };
        if (category) filter.category = category;
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            this.model.countDocuments(filter),
        ]);
        return { items, total, page, pages: Math.ceil(total / limit) };
    }

    async findByCategory(category) {
        return this.model.find({
            category: { $regex: category, $options: "i" }
        }).limit(3);
    }
}

module.exports = new ArticleRepository();
