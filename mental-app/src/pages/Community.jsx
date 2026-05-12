import { useState, useEffect, useRef } from 'react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/api';
import './Community.css';

const MOOD_OPTIONS = ['😊','😌','😔','😢','😤','🤩','😴','🥰'];

function timeAgo(dateStr, t) {
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('community.justNow');
    if (mins < 60) return `${mins} ${t('community.minutesAgo')}`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ${t('community.hoursAgo')}`;
    return `${Math.floor(hrs / 24)} ${t('community.daysAgo')}`;
}

// ── Single post card ───────────────────────────────────────────────
function PostCard({ post, user, t, onLike, onDelete, onAddComment, onDeleteComment }) {
    const [showComments, setShowComments] = useState(false);
    const [commentText,  setCommentText]  = useState('');
    const [anonComment,  setAnonComment]  = useState(false);
    const [submitting,   setSubmitting]   = useState(false);
    const inputRef = useRef(null);

    const meId = user?.id || user?._id;

    function getAuthor(p) {
        if (p.anonymous) return { name: t('community.anonymous'), avatar: null };
        const u = p.userId;
        return { name: u?.name || '?', avatar: u?.avatar || null };
    }

    function isLiked() {
        return post.likes?.some(id =>
            id === meId || id?._id === meId || id?.toString?.() === meId
        );
    }

    function isOwner(authorId) {
        const aid = authorId?._id || authorId;
        return aid === meId || aid?.toString?.() === meId || user?.role === 'admin';
    }

    async function submitComment(e) {
        e.preventDefault();
        if (!commentText.trim()) return;
        setSubmitting(true);
        try {
            await onAddComment(post._id, commentText.trim(), anonComment);
            setCommentText('');
            setAnonComment(false);
        } finally {
            setSubmitting(false);
        }
    }

    const author = getAuthor(post);
    const liked  = isLiked();
    const owner  = isOwner(post.userId);

    return (
        <div className="comm-post-card">
            {/* Header */}
            <div className="comm-post-header">
                <div className="comm-avatar-circle">
                    {author.avatar
                        ? <img src={author.avatar} alt="" className="comm-avatar-img" />
                        : <span>{author.name[0]?.toUpperCase()}</span>
                    }
                </div>
                <div className="comm-post-meta">
                    <span className="comm-post-author">
                        {author.name}
                        {post.anonymous && <span className="comm-anon-tag">{t('community.anonymousTag')}</span>}
                    </span>
                    <span className="comm-post-time">{timeAgo(post.createdAt, t)}</span>
                </div>
                {post.mood && <span className="comm-post-mood">{post.mood}</span>}
            </div>

            {/* Content */}
            <p className="comm-post-content">{post.content}</p>

            {/* Footer actions */}
            <div className="comm-post-footer">
                <button className={`comm-like-btn ${liked ? 'liked' : ''}`} onClick={() => onLike(post._id)}>
                    {liked ? '❤️' : '🤍'} {post.likes?.length || 0}
                </button>

                <button
                    className="comm-comment-toggle"
                    onClick={() => { setShowComments(v => !v); setTimeout(() => inputRef.current?.focus(), 100); }}
                >
                    💬 {post.comments?.length || 0}
                </button>

                {owner && (
                    <button className="comm-delete-btn" onClick={() => onDelete(post._id)}>
                        {t('community.delete')}
                    </button>
                )}
            </div>

            {/* Comments section */}
            {showComments && (
                <div className="comm-comments">
                    {/* Existing comments */}
                    {post.comments?.length > 0 ? (
                        <div className="comm-comments-list">
                            {post.comments.map(c => {
                                const cAuthor = c.anonymous
                                    ? { name: t('community.anonymous'), avatar: null }
                                    : { name: c.userId?.name || '?', avatar: c.userId?.avatar || null };
                                const canDelete = isOwner(c.userId);
                                return (
                                    <div key={c._id} className="comm-comment">
                                        <div className="comm-comment-avatar">
                                            {cAuthor.avatar
                                                ? <img src={cAuthor.avatar} alt="" className="comm-avatar-img" />
                                                : <span>{cAuthor.name[0]?.toUpperCase()}</span>
                                            }
                                        </div>
                                        <div className="comm-comment-body">
                                            <div className="comm-comment-header">
                                                <span className="comm-comment-author">
                                                    {cAuthor.name}
                                                    {c.anonymous && <span className="comm-anon-tag">{t('community.anonymousTag')}</span>}
                                                </span>
                                                <span className="comm-comment-time">{timeAgo(c.createdAt, t)}</span>
                                                {canDelete && (
                                                    <button
                                                        className="comm-comment-del"
                                                        onClick={() => onDeleteComment(post._id, c._id)}
                                                    >✕</button>
                                                )}
                                            </div>
                                            <p className="comm-comment-text">{c.content}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="comm-no-comments">{t('community.noComments')}</p>
                    )}

                    {/* Add comment */}
                    <form className="comm-comment-form" onSubmit={submitComment}>
                        <div className="comm-comment-input-wrap">
                            <input
                                ref={inputRef}
                                className="comm-comment-input"
                                placeholder={t('community.commentPh')}
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                maxLength={500}
                            />
                            <button className="comm-comment-submit" type="submit" disabled={submitting || !commentText.trim()}>
                                {submitting ? '…' : '➤'}
                            </button>
                        </div>
                        <label className="comm-anon-label" style={{ fontSize: '0.8rem', marginTop: 4 }}>
                            <input type="checkbox" checked={anonComment} onChange={e => setAnonComment(e.target.checked)} />
                            {t('community.anonymous')}
                        </label>
                    </form>
                </div>
            )}
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────────
export default function Community() {
    const { t } = useLang();
    const { user } = useAuth();

    const [posts,     setPosts]     = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [content,   setContent]   = useState('');
    const [mood,      setMood]      = useState('');
    const [anon,      setAnon]      = useState(false);
    const [posting,   setPosting]   = useState(false);
    const [postError, setPostError] = useState('');

    useEffect(() => {
        postService.getAll()
            .then(setPosts)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    async function handlePost(e) {
        e.preventDefault();
        if (!content.trim()) { setPostError(t('community.errorEmpty')); return; }
        setPosting(true); setPostError('');
        try {
            const newPost = await postService.create(content.trim(), anon, mood);
            setPosts(prev => [newPost, ...prev]);
            setContent(''); setMood(''); setAnon(false);
        } catch (err) {
            setPostError(err.message || t('community.errorCreate'));
        } finally { setPosting(false); }
    }

    async function handleLike(postId) {
        try {
            await postService.toggleLike(postId);
            const meId = user?.id || user?._id;
            setPosts(prev => prev.map(p => {
                if (p._id !== postId) return p;
                const liked = p.likes?.some(id => id === meId || id?._id === meId || id?.toString?.() === meId);
                return {
                    ...p,
                    likes: liked
                        ? p.likes.filter(id => id !== meId && id?._id !== meId)
                        : [...(p.likes || []), meId],
                };
            }));
        } catch { /* ignore */ }
    }

    async function handleDelete(postId) {
        try {
            await postService.delete(postId);
            setPosts(prev => prev.filter(p => p._id !== postId));
        } catch { /* ignore */ }
    }

    async function handleAddComment(postId, text, anonFlag) {
        try {
            const comment = await postService.addComment(postId, text, anonFlag);
            setPosts(prev => prev.map(p =>
                p._id === postId
                    ? { ...p, comments: [...(p.comments || []), comment] }
                    : p
            ));
        } catch { /* ignore */ }
    }

    async function handleDeleteComment(postId, commentId) {
        try {
            await postService.deleteComment(postId, commentId);
            setPosts(prev => prev.map(p =>
                p._id === postId
                    ? { ...p, comments: p.comments.filter(c => c._id !== commentId) }
                    : p
            ));
        } catch { /* ignore */ }
    }

    return (
        <div className="comm-page">
            <div className="comm-header">
                <span className="comm-badge">{t('community.badge')}</span>
                <h1 className="comm-title">{t('community.heading')}</h1>
                <p className="comm-sub">{t('community.sub')}</p>
            </div>

            {/* Compose box */}
            <form className="comm-compose" onSubmit={handlePost}>
                <div className="comm-compose-top">
                    <div className="comm-avatar-circle">
                        {user?.avatar
                            ? <img src={user.avatar} alt="" className="comm-avatar-img" />
                            : <span>{user?.name?.[0]?.toUpperCase() || '?'}</span>
                        }
                    </div>
                    <textarea
                        className="comm-textarea"
                        placeholder={t('community.placeholder')}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={3}
                        maxLength={1000}
                    />
                </div>
                <div className="comm-mood-row">
                    {MOOD_OPTIONS.map(em => (
                        <button key={em} type="button"
                            className={`comm-mood-btn ${mood === em ? 'active' : ''}`}
                            onClick={() => setMood(m => m === em ? '' : em)}
                        >{em}</button>
                    ))}
                </div>
                <div className="comm-compose-actions">
                    <label className="comm-anon-label">
                        <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} />
                        {t('community.anonymous')}
                    </label>
                    <span className="comm-char-count">{content.length}/1000</span>
                    <button className="comm-post-btn" type="submit" disabled={posting}>
                        {posting ? '…' : t('community.post')}
                    </button>
                </div>
                {postError && <div className="comm-error">{postError}</div>}
            </form>

            {/* Feed */}
            {loading ? (
                <div className="comm-loading">{t('community.loading')}</div>
            ) : posts.length === 0 ? (
                <div className="comm-empty"><span>💬</span><p>{t('community.empty')}</p></div>
            ) : (
                <div className="comm-feed">
                    {posts.map(post => (
                        <PostCard
                            key={post._id}
                            post={post}
                            user={user}
                            t={t}
                            onLike={handleLike}
                            onDelete={handleDelete}
                            onAddComment={handleAddComment}
                            onDeleteComment={handleDeleteComment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
