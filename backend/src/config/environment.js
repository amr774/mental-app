function validateEnvironment(env = process.env) {
    if (!env.JWT_SECRET || env.JWT_SECRET.length < 32 || env.JWT_SECRET.startsWith('REPLACE_')) {
        throw new Error('Set JWT_SECRET to at least 32 random characters');
    }
    if (env.NODE_ENV === 'production') {
        if (!env.MONGO_URI) throw new Error('Production requires MONGO_URI');
        const origins = (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim());
        if (!origins.length || origins.some(value => {
            try { return new URL(value).origin !== value || !value.startsWith('https://'); }
            catch { return true; }
        })) throw new Error('Production requires exact HTTPS ALLOWED_ORIGINS');
        if (!env.UPLOAD_DIR) throw new Error('Production requires a persistent UPLOAD_DIR');
    }
}
module.exports = { validateEnvironment };
