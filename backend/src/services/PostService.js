const postRepository = require('../repositories/PostRepository');

class PostService {

    async getAll() {
        return postRepository.getAll();
    }

    async getOne(postId) {
        const post = await postRepository.getById(postId);
        if (!post) throw { status: 404, message: 'Post not found' };
        return post;
    }

    async create(userId, content, anonymous, mood) {
        if (!content || !content.trim())
            throw { status: 400, message: 'Post content is required' };
        return postRepository.create({ userId, content: content.trim(), anonymous: !!anonymous, mood: mood || '' });
    }

    async delete(postId, userId, role) {
        const post = await postRepository.findById(postId);
        if (!post) throw { status: 404, message: 'Post not found' };
        if (post.userId.toString() !== userId.toString() && role !== 'admin')
            throw { status: 403, message: 'Not authorized' };
        await postRepository.deleteById(postId);
        return { message: 'Post deleted' };
    }

    async toggleLike(postId, userId) {
        const post = await postRepository.findById(postId);
        if (!post) throw { status: 404, message: 'Post not found' };

        const alreadyLiked = post.likes.some(id => id.toString() === userId.toString());
        if (alreadyLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            post.likes.push(userId);
        }
        await post.save();
        return { liked: !alreadyLiked, likesCount: post.likes.length };
    }

    async addComment(postId, userId, content, anonymous) {
        if (!content || !content.trim())
            throw { status: 400, message: 'Comment cannot be empty' };
        const post = await postRepository.findById(postId);
        if (!post) throw { status: 404, message: 'Post not found' };

        post.comments.push({ userId, content: content.trim(), anonymous: !!anonymous });
        await post.save();
        // Populate the last comment's userId before returning
        await post.populate('comments.userId', 'name avatar');
        return post.comments[post.comments.length - 1];
    }

    async deleteComment(postId, commentId, userId, role) {
        const post = await postRepository.findById(postId);
        if (!post) throw { status: 404, message: 'Post not found' };

        const comment = post.comments.id(commentId);
        if (!comment) throw { status: 404, message: 'Comment not found' };
        if (comment.userId.toString() !== userId.toString() && role !== 'admin')
            throw { status: 403, message: 'Not authorized' };

        comment.deleteOne();
        await post.save();
        return { message: 'Comment deleted' };
    }
}

module.exports = new PostService();
