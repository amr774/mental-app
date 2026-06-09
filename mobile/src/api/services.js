import apiClient from './client';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authService = {
  register: (data) => apiClient.post('/register', data),
  login: (data) => apiClient.post('/login', data),
  forgotPassword: (email) => apiClient.post('/forgot-password', { email }),
  resetPassword: (data) => apiClient.post('/reset-password', data),
};

// ─── User / Profile ──────────────────────────────────────────────────────────
export const userService = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data) => apiClient.put('/user/profile', data),
  uploadAvatar: (formData) =>
    apiClient.post('/user/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getWishlist: () => apiClient.get('/user/wishlist'),
  addToWishlist: (petId) => apiClient.post(`/user/wishlist/${petId}`),
  removeFromWishlist: (petId) => apiClient.delete(`/user/wishlist/${petId}`),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardService = {
  getData: () => apiClient.get('/dashboard'),
};

// ─── Mood ────────────────────────────────────────────────────────────────────
export const moodService = {
  logMood: (data) => apiClient.post('/moods', data),
  getHistory: () => apiClient.get('/moods/history'),
};

// ─── Journal ─────────────────────────────────────────────────────────────────
export const journalService = {
  getAll: () => apiClient.get('/journals'),
  getOne: (id) => apiClient.get(`/journals/${id}`),
  create: (data) => apiClient.post('/journals', data),
  update: (id, data) => apiClient.put(`/journals/${id}`, data),
  remove: (id) => apiClient.delete(`/journals/${id}`),
};

// ─── Goals ───────────────────────────────────────────────────────────────────
export const goalService = {
  getAll: () => apiClient.get('/goals'),
  create: (data) => apiClient.post('/goals', data),
  update: (id, data) => apiClient.put(`/goals/${id}`, data),
  toggle: (id) => apiClient.patch(`/goals/${id}/toggle`),
  remove: (id) => apiClient.delete(`/goals/${id}`),
};

// ─── Articles ────────────────────────────────────────────────────────────────
export const articleService = {
  getAll: (params) => apiClient.get('/articles', { params }),
  getOne: (id) => apiClient.get(`/articles/${id}`),
  create: (data) => apiClient.post('/articles', data),
  update: (id, data) => apiClient.put(`/articles/${id}`, data),
  remove: (id) => apiClient.delete(`/articles/${id}`),
};

// ─── Pets ────────────────────────────────────────────────────────────────────
export const petService = {
  getAll: (params) => apiClient.get('/pets', { params }),
  getOne: (id) => apiClient.get(`/pets/${id}`),
  adopt: (id) => apiClient.post(`/pets/${id}/adopt`),
  unadopt: (id) => apiClient.delete(`/pets/${id}/adopt`),
  getAdopted: () => apiClient.get('/pets/adopted'),
  create: (data) => apiClient.post('/pets', data),
  update: (id, data) => apiClient.put(`/pets/${id}`, data),
  remove: (id) => apiClient.delete(`/pets/${id}`),
};

// ─── Chatbot ─────────────────────────────────────────────────────────────────
export const chatService = {
  sendMessage: (message) => apiClient.post('/chat', { message }),
};

// ─── Personality Test ────────────────────────────────────────────────────────
export const personalityService = {
  submit: (answers) => apiClient.post('/personality-test', { answers }),
  getMyResult: () => apiClient.get('/personality-test/my'),
};

// ─── Community Posts ─────────────────────────────────────────────────────────
export const postService = {
  getAll: (params) => apiClient.get('/posts', { params }),
  getOne: (id) => apiClient.get(`/posts/${id}`),
  create: (data) => apiClient.post('/posts', data),
  update: (id, data) => apiClient.put(`/posts/${id}`, data),
  remove: (id) => apiClient.delete(`/posts/${id}`),
  like: (id) => apiClient.post(`/posts/${id}/like`),
  unlike: (id) => apiClient.delete(`/posts/${id}/like`),
  addComment: (id, data) => apiClient.post(`/posts/${id}/comments`, data),
  deleteComment: (postId, commentId) =>
    apiClient.delete(`/posts/${postId}/comments/${commentId}`),
};

// ─── Store / Marketplace ─────────────────────────────────────────────────────
export const storeService = {
  getAll: (params) => apiClient.get('/store', { params }),
  getMine: () => apiClient.get('/store/mine'),
  create: (formData) =>
    apiClient.post('/store', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => apiClient.put(`/store/${id}`, data),
  markSold: (id) => apiClient.patch(`/store/${id}/sold`),
  remove: (id) => apiClient.delete(`/store/${id}`),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orderService = {
  create: (data) => apiClient.post('/orders', data),
  getMyOrders: () => apiClient.get('/orders/my'),
  getOne: (id) => apiClient.get(`/orders/${id}`),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminService = {
  getStats: () => apiClient.get('/admin/stats'),
  getAllUsers: () => apiClient.get('/admin/users'),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getPersonalityResults: () => apiClient.get('/admin/personality-results'),
  getAllStoreItems: () => apiClient.get('/store/admin/all'),
};
