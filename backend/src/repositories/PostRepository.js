const BaseRepository = require('./BaseRepository');
const Post = require('../models/Post');

class PostRepository extends BaseRepository {
    constructor() {
        super(Post);
    }

    async getAll() {
        return this.model
            .find()
            .sort({ createdAt: -1 })
            .populate('userId', 'name avatar')
            .populate('comments.userId', 'name avatar');
    }

    async getById(id) {
        return this.model
            .findById(id)
            .populate('userId', 'name avatar')
            .populate('comments.userId', 'name avatar');
    }

    async getByUser(userId) {
        return this.model
            .find({ userId })
            .sort({ createdAt: -1 })
            .populate('userId', 'name avatar')
            .populate('comments.userId', 'name avatar');
    }
}

module.exports = new PostRepository();
