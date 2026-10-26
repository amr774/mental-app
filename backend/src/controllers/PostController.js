const postService = require('../services/PostService');

class PostController {

    async getAll(req, res) {
        try {
            const posts = await postService.getAll();
            res.json(posts);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async getOne(req, res) {
        try {
            const post = await postService.getOne(req.params.id);
            res.json(post);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async create(req, res) {
        try {
            const { content, anonymous, mood } = req.body;
            const post = await postService.create(req.user.id, content, anonymous, mood);
            res.status(201).json(post);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await postService.delete(req.params.id, req.user.id, req.user.role);
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async toggleLike(req, res) {
        try {
            const result = await postService.toggleLike(req.params.id, req.user.id);
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async addComment(req, res) {
        try {
            const { content, anonymous } = req.body;
            const comment = await postService.addComment(req.params.id, req.user.id, content, anonymous);
            res.status(201).json(comment);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async deleteComment(req, res) {
        try {
            const result = await postService.deleteComment(
                req.params.id, req.params.commentId, req.user.id, req.user.role
            );
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }
}

module.exports = new PostController();
