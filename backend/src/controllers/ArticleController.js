const articleService = require("../services/ArticleService");

class ArticleController {

    async getAll(req, res) {
        try {
            const { search, category, page = 1, limit = 10 } = req.query;
            const result = await articleService.getAll(search, category, Number(page), Number(limit));
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async create(req, res) {
        try {
            const { title, content, category } = req.body;
            const article = await articleService.create(title, content, category);
            res.status(201).json(article);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async update(req, res) {
        try {
            const article = await articleService.update(req.params.id, req.body);
            res.json(article);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await articleService.delete(req.params.id);
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }
}

module.exports = new ArticleController();
