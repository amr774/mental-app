const BASE_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
    try {
        const user = JSON.parse(localStorage.getItem('mh_user') || '{}');
        return user?.token || '';
    } catch { return ''; }
}

async function request(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
            ...options.headers
        },
    });

    // Token expired or invalid → dispatch event so AuthContext handles logout
    if (res.status === 401) {
        localStorage.removeItem('mh_user');
        window.dispatchEvent(new Event('auth:expired'));
        throw new Error('Session expired. Please log in again.');
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
}

// Auth
export const authService = {
    async login(email, password) {
        return await request('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    async register(name, email, password) {
        return await request('/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
    },

    async forgotPassword(email) {
        return await request('/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    async resetPassword(email, resetToken, newPassword) {
        return await request('/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, resetToken, newPassword }),
        });
    },
};

// Articles
export const articleService = {
    async getAll(search = '', category = '', page = 1, limit = 10) {
        return await request(`/articles?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`);
    },
    async create(title, content, category) {
        return await request('/articles', {
            method: 'POST',
            body: JSON.stringify({ title, content, category }),
        });
    },
    async update(id, data) {
        return await request(`/articles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    async remove(id) {
        return await request(`/articles/${id}`, { method: 'DELETE' });
    },
};

// Mood
export const moodService = {
    async log(mood, note = '') {
        return await request('/moods', {
            method: 'POST',
            body: JSON.stringify({ mood, note }),
        });
    },
    async getHistory() {
        return await request('/moods/history');
    },
};

// Chatbot
export const chatService = {
    async send(message, history = []) {
        return await request('/chat', {
            method: 'POST',
            body: JSON.stringify({ message, history }),
        });
    },
};

// Pets
export const petService = {
    async getAll(type = '', personality = '', search = '') {
        return await request(`/pets?type=${encodeURIComponent(type)}&personality=${encodeURIComponent(personality)}&search=${encodeURIComponent(search)}`);
    },
    async create(data) {
        return await request('/pets', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    async update(id, data) {
        return await request(`/pets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    async remove(id) {
        return await request(`/pets/${id}`, { method: 'DELETE' });
    },
    async adopt(id) {
        return await request(`/pets/${id}/adopt`, { method: 'POST' });
    },
    async unadopt(id) {
        return await request(`/pets/${id}/adopt`, { method: 'DELETE' });
    },
    async getAdopted() {
        return await request('/pets/adopted');
    },
};

// Wishlist
export const wishlistService = {
    async get() {
        return await request('/wishlist');
    },
    async add(petId) {
        return await request(`/wishlist/${petId}`, { method: 'POST' });
    },
    async remove(petId) {
        return await request(`/wishlist/${petId}`, { method: 'DELETE' });
    },
};

// Profile
export const profileService = {
    async get() {
        return await request('/profile');
    },
    async update(data) {
        return await request('/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    async uploadAvatar(file) {
        const form = new FormData();
        form.append('avatar', file);
        const res = await fetch(`${BASE_URL}/profile/avatar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getToken()}` },
            body: form,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `HTTP ${res.status}`);
        }
        return res.json();
    },
};

// Personality
export const personalityService = {
    async submit(answers) {
        return await request('/personality-test', {
            method: 'POST',
            body: JSON.stringify({ answers }),
        });
    },
    async getMyResults() {
        return await request('/personality-test/my');
    },
};

// Journal
export const journalService = {
    async getAll() {
        return await request('/journal');
    },
    async create(data) {
        return await request('/journal', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    async delete(id) {
        return await request(`/journal/${id}`, { method: 'DELETE' });
    },
};

// Store / Marketplace
export const storeService = {
    async getAll(search = '', category = '') {
        return await request(`/store?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
    },
    async getMine() {
        return await request('/store/mine');
    },
    async getAllAdmin(search = '', category = '') {
        return await request(`/store/admin/all?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
    },
    async create(data) {
        return await request('/store', { method: 'POST', body: JSON.stringify(data) });
    },
    async update(id, data) {
        return await request(`/store/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    async markSold(id) {
        return await request(`/store/${id}/sold`, { method: 'PATCH' });
    },
    async remove(id) {
        return await request(`/store/${id}`, { method: 'DELETE' });
    },
};

// Community Posts
export const postService = {
    async getAll() {
        return await request('/posts');
    },
    async create(content, anonymous, mood) {
        return await request('/posts', {
            method: 'POST',
            body: JSON.stringify({ content, anonymous, mood }),
        });
    },
    async delete(id) {
        return await request(`/posts/${id}`, { method: 'DELETE' });
    },
    async toggleLike(id) {
        return await request(`/posts/${id}/like`, { method: 'POST' });
    },
    async addComment(id, content, anonymous) {
        return await request(`/posts/${id}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content, anonymous }),
        });
    },
    async deleteComment(postId, commentId) {
        return await request(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
    },
};

// Goals
export const goalService = {
    async getAll() {
        return await request('/goals');
    },
    async create(data) {
        return await request('/goals', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    async toggleDay(id, date) {
        return await request(`/goals/${id}/toggle`, {
            method: 'PATCH',
            body: JSON.stringify({ date }),
        });
    },
    async delete(id) {
        return await request(`/goals/${id}`, { method: 'DELETE' });
    },
};

// Dashboard
export const dashboardService = {
    async get() {
        return await request('/dashboard');
    },
};

// Orders
export const orderService = {
    async create(data) {
        return await request('/orders', { method: 'POST', body: JSON.stringify(data) });
    },
    async getMine() {
        return await request('/orders/mine');
    },
    async getAll() {
        return await request('/admin/orders');
    },
    async updateStatus(id, status) {
        return await request(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    },
};

// Admin
export const adminService = {
    async getStats() {
        return await request('/admin/stats');
    },
    async getUsers() {
        return await request('/admin/users');
    },
    async deleteUser(id) {
        return await request(`/admin/users/${id}`, { method: 'DELETE' });
    },
    async getPersonalityResults() {
        return await request('/admin/personality-results');
    },
};

// Use the authenticated backend proxy; never contact a visitor's localhost.
export const emotionService = {
    async predict(base64Image) {
        return request('/emotion/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_base64: base64Image }),
        });
    },
    async health() {
        return request('/emotion/health');
    },
};
// WithUBot (Gemini-powered chatbot)
export const withUBotService = {
    async send(message, history = []) {
        return await request('/withubot/chat', {
            method: 'POST',
            body: JSON.stringify({ message, history }),
        });
    },
};
