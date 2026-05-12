const articleRepository = require("../repositories/ArticleRepository");

class ArticleService {

    async getAll(search, category, page, limit) {
        return articleRepository.search(search, category, page, limit);
    }

    async create(title, content, category) {
        if (!title || !content || !category)
            throw { status: 400, message: "Title, content, and category are required" };
        return articleRepository.create({ title, content, category });
    }

    async update(id, data) {
        const article = await articleRepository.updateById(id, data);
        if (!article) throw { status: 404, message: "Article not found" };
        return article;
    }

    async delete(id) {
        const article = await articleRepository.deleteById(id);
        if (!article) throw { status: 404, message: "Article not found" };
        return { message: "Article deleted successfully" };
    }
}

module.exports = new ArticleService();
