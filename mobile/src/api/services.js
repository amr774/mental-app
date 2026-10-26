import apiClient from './client';
import {
  mockResponse,
  MOCK_DASHBOARD,
  MOCK_MOODS,
  MOCK_JOURNALS,
  MOCK_GOALS,
  MOCK_ARTICLES,
  MOCK_PETS,
  MOCK_POSTS,
  MOCK_STORE,
  MOCK_PERSONALITY_RESULT,
  MOCK_ORDERS,
  MOCK_USER,
  getRandomChatResponse,
} from './mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isDemo = async () => {
  const token = await AsyncStorage.getItem('authToken');
  return token === 'demo-token';
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authService = {
  register: (data) => apiClient.post('/register', data),
  login: (data) => apiClient.post('/login', data),
  forgotPassword: (email) => apiClient.post('/forgot-password', { email }),
  resetPassword: (data) => apiClient.post('/reset-password', data),
};

// ─── User / Profile ──────────────────────────────────────────────────────────
export const userService = {
  getProfile: async () => {
    if (await isDemo()) return mockResponse({ user: MOCK_USER });
    return apiClient.get('/profile');
  },
  updateProfile: async (data) => {
    if (await isDemo()) return mockResponse({ user: { ...MOCK_USER, ...data } });
    return apiClient.put('/profile', data);
  },
  uploadAvatar: async (formData) => {
    if (await isDemo()) return mockResponse({ user: MOCK_USER });
    return apiClient.post('/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getWishlist: async () => {
    if (await isDemo()) return mockResponse([]);
    return apiClient.get('/wishlist');
  },
  addToWishlist: async (petId) => {
    if (await isDemo()) return mockResponse({ success: true });
    return apiClient.post(`/wishlist/${petId}`);
  },
  removeFromWishlist: async (petId) => {
    if (await isDemo()) return mockResponse({ success: true });
    return apiClient.delete(`/wishlist/${petId}`);
  },
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardService = {
  getData: async () => {
    if (await isDemo()) return mockResponse(MOCK_DASHBOARD);
    return apiClient.get('/dashboard');
  },
};

// ─── Mood ────────────────────────────────────────────────────────────────────
export const moodService = {
  logMood: async (data) => {
    // Backend expects { mood: string, note? }
    // Mobile sends { value: 1-5, note } — map numeric value to label string
    const VALUE_TO_LABEL = { 1: 'terrible', 2: 'bad', 3: 'okay', 4: 'good', 5: 'great' };
    const moodStr = data.mood || data.label || VALUE_TO_LABEL[data.value] || 'okay';
    const payload = { mood: moodStr, note: data.note || '' };
    if (await isDemo()) {
      const newMood = { _id: 'new-' + Date.now(), ...payload, value: data.value, createdAt: new Date().toISOString() };
      MOCK_MOODS.unshift(newMood);
      return mockResponse(newMood);
    }
    return apiClient.post('/moods', payload);
  },
  getHistory: async () => {
    if (await isDemo()) return mockResponse(MOCK_MOODS);
    return apiClient.get('/moods/history');
  },
};

// ─── Journal ─────────────────────────────────────────────────────────────────
export const journalService = {
  getAll: async () => {
    if (await isDemo()) return mockResponse(MOCK_JOURNALS);
    return apiClient.get('/journal');
  },
  getOne: async (id) => {
    if (await isDemo()) {
      const entry = MOCK_JOURNALS.find(j => j._id === id) || MOCK_JOURNALS[0];
      return mockResponse(entry);
    }
    return apiClient.get(`/journal/${id}`);
  },
  create: async (data) => {
    if (await isDemo()) {
      const newEntry = { _id: 'j-' + Date.now(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      MOCK_JOURNALS.unshift(newEntry);
      return mockResponse(newEntry);
    }
    return apiClient.post('/journal', data);
  },
  update: async (id, data) => {
    if (await isDemo()) {
      const idx = MOCK_JOURNALS.findIndex(j => j._id === id);
      if (idx >= 0) Object.assign(MOCK_JOURNALS[idx], data);
      return mockResponse(MOCK_JOURNALS[idx] || data);
    }
    return apiClient.put(`/journal/${id}`, data);
  },
  remove: async (id) => {
    if (await isDemo()) {
      const idx = MOCK_JOURNALS.findIndex(j => j._id === id);
      if (idx >= 0) MOCK_JOURNALS.splice(idx, 1);
      return mockResponse({ success: true });
    }
    return apiClient.delete(`/journal/${id}`);
  },
};

// ─── Goals ───────────────────────────────────────────────────────────────────
export const goalService = {
  getAll: async () => {
    if (await isDemo()) return mockResponse(MOCK_GOALS);
    return apiClient.get('/goals');
  },
  create: async (data) => {
    if (await isDemo()) {
      const newGoal = { _id: 'g-' + Date.now(), ...data, completed: false, createdAt: new Date().toISOString() };
      MOCK_GOALS.push(newGoal);
      return mockResponse(newGoal);
    }
    return apiClient.post('/goals', data);
  },
  update: async (id, data) => {
    if (await isDemo()) {
      const idx = MOCK_GOALS.findIndex(g => g._id === id);
      if (idx >= 0) Object.assign(MOCK_GOALS[idx], data);
      return mockResponse(MOCK_GOALS[idx]);
    }
    return apiClient.put(`/goals/${id}`, data);
  },
  toggle: async (id) => {
    if (await isDemo()) {
      const idx = MOCK_GOALS.findIndex(g => g._id === id);
      if (idx >= 0) MOCK_GOALS[idx].completed = !MOCK_GOALS[idx].completed;
      return mockResponse(MOCK_GOALS[idx]);
    }
    return apiClient.patch(`/goals/${id}/toggle`);
  },
  remove: async (id) => {
    if (await isDemo()) {
      const idx = MOCK_GOALS.findIndex(g => g._id === id);
      if (idx >= 0) MOCK_GOALS.splice(idx, 1);
      return mockResponse({ success: true });
    }
    return apiClient.delete(`/goals/${id}`);
  },
};

// ─── Articles ────────────────────────────────────────────────────────────────
export const articleService = {
  getAll: async (params) => {
    if (await isDemo()) return mockResponse(MOCK_ARTICLES);
    return apiClient.get('/articles', { params });
  },
  getOne: async (id) => {
    if (await isDemo()) {
      const article = MOCK_ARTICLES.find(a => a._id === id) || MOCK_ARTICLES[0];
      return mockResponse(article);
    }
    return apiClient.get(`/articles/${id}`);
  },
  create: async (data) => {
    if (await isDemo()) return mockResponse({ _id: 'a-new', ...data });
    return apiClient.post('/articles', data);
  },
  update: async (id, data) => {
    if (await isDemo()) return mockResponse({ _id: id, ...data });
    return apiClient.put(`/articles/${id}`, data);
  },
  remove: async (id) => {
    if (await isDemo()) return mockResponse({ success: true });
    return apiClient.delete(`/articles/${id}`);
  },
};

// ─── Pets ────────────────────────────────────────────────────────────────────
export const petService = {
  getAll: async (params) => {
    if (await isDemo()) return mockResponse(MOCK_PETS);
    return apiClient.get('/pets', { params });
  },
  getOne: async (id) => {
    if (await isDemo()) {
      const pet = MOCK_PETS.find(p => p._id === id) || MOCK_PETS[0];
      return mockResponse(pet);
    }
    return apiClient.get(`/pets/${id}`);
  },
  adopt: async (id) => {
    if (await isDemo()) {
      const idx = MOCK_PETS.findIndex(p => p._id === id);
      if (idx >= 0) { MOCK_PETS[idx].adopted = true; MOCK_PETS[idx].adoptedBy = 'demo-user'; }
      return mockResponse(MOCK_PETS[idx]);
    }
    return apiClient.post(`/pets/${id}/adopt`);
  },
  unadopt: async (id) => {
    if (await isDemo()) {
      const idx = MOCK_PETS.findIndex(p => p._id === id);
      if (idx >= 0) { MOCK_PETS[idx].adopted = false; MOCK_PETS[idx].adoptedBy = null; }
      return mockResponse({ success: true });
    }
    return apiClient.delete(`/pets/${id}/adopt`);
  },
  getAdopted: async () => {
    if (await isDemo()) return mockResponse(MOCK_PETS.filter(p => p.adopted && p.adoptedBy === 'demo-user'));
    return apiClient.get('/pets/adopted');
  },
  create: async (data) => {
    if (await isDemo()) return mockResponse({ _id: 'p-new', ...data });
    return apiClient.post('/pets', data);
  },
  update: async (id, data) => {
    if (await isDemo()) return mockResponse({ _id: id, ...data });
    return apiClient.put(`/pets/${id}`, data);
  },
  remove: async (id) => {
    if (await isDemo()) return mockResponse({ success: true });
    return apiClient.delete(`/pets/${id}`);
  },
};

// ─── Chatbot ─────────────────────────────────────────────────────────────────
export const chatService = {
  sendMessage: async (message) => {
    if (await isDemo()) {
      await new Promise(r => setTimeout(r, 800));
      return mockResponse({ reply: getRandomChatResponse() });
    }
    return apiClient.post('/chat', { message });
  },
};

// ─── WithUBot ─────────────────────────────────────────────────────────────────
export const withUBotService = {
  sendMessage: async (message, history = []) => {
    if (await isDemo()) {
      await new Promise(r => setTimeout(r, 800));
      return mockResponse({ reply: getRandomChatResponse(), emotion: 'neutral', crisis: false, recommendedArticle: null, recommendedPet: null });
    }
    return apiClient.post('/withubot/chat', { message, history });
  },
};

// ─── Personality Test ────────────────────────────────────────────────────────
export const personalityService = {
  submit: async (answers) => {
    if (await isDemo()) return mockResponse(MOCK_PERSONALITY_RESULT);
    return apiClient.post('/personality-test', { answers });
  },
  getMyResult: async () => {
    if (await isDemo()) return mockResponse(MOCK_PERSONALITY_RESULT);
    return apiClient.get('/personality-test/my');
  },
};

// ─── Community Posts ─────────────────────────────────────────────────────────
export const postService = {
  getAll: async (params) => {
    if (await isDemo()) return mockResponse(MOCK_POSTS);
    return apiClient.get('/posts', { params });
  },
  getOne: async (id) => {
    if (await isDemo()) {
      const post = MOCK_POSTS.find(p => p._id === id) || MOCK_POSTS[0];
      return mockResponse(post);
    }
    return apiClient.get(`/posts/${id}`);
  },
  create: async (data) => {
    if (await isDemo()) {
      const newPost = {
        _id: 'post-' + Date.now(),
        ...data,
        author: { _id: 'demo-user', name: 'Ahmed Mostafa', avatar: null },
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
      };
      MOCK_POSTS.unshift(newPost);
      return mockResponse(newPost);
    }
    return apiClient.post('/posts', data);
  },
  update: async (id, data) => {
    if (await isDemo()) return mockResponse({ _id: id, ...data });
    return apiClient.put(`/posts/${id}`, data);
  },
  remove: async (id) => {
    if (await isDemo()) {
      const idx = MOCK_POSTS.findIndex(p => p._id === id);
      if (idx >= 0) MOCK_POSTS.splice(idx, 1);
      return mockResponse({ success: true });
    }
    return apiClient.delete(`/posts/${id}`);
  },
  like: async (id) => {
    if (await isDemo()) {
      const post = MOCK_POSTS.find(p => p._id === id);
      if (post && !post.likes.includes('demo-user')) post.likes.push('demo-user');
      return mockResponse(post);
    }
    return apiClient.post(`/posts/${id}/like`);
  },
  unlike: async (id) => {
    if (await isDemo()) {
      const post = MOCK_POSTS.find(p => p._id === id);
      if (post) post.likes = post.likes.filter(l => l !== 'demo-user');
      return mockResponse(post);
    }
    // Backend exposes a single POST toggle for likes (no DELETE route)
    return apiClient.post(`/posts/${id}/like`);
  },
  addComment: async (id, data) => {
    if (await isDemo()) {
      const post = MOCK_POSTS.find(p => p._id === id);
      const comment = { _id: 'c-' + Date.now(), ...data, author: { name: 'Ahmed Mostafa' }, createdAt: new Date().toISOString() };
      if (post) post.comments.push(comment);
      return mockResponse(comment);
    }
    return apiClient.post(`/posts/${id}/comments`, data);
  },
  deleteComment: async (postId, commentId) => {
    if (await isDemo()) return mockResponse({ success: true });
    return apiClient.delete(`/posts/${postId}/comments/${commentId}`);
  },
};

// ─── Store / Marketplace ─────────────────────────────────────────────────────
export const storeService = {
  getAll: async (params) => {
    if (await isDemo()) return mockResponse(MOCK_STORE);
    return apiClient.get('/store', { params });
  },
  getMine: async () => {
    if (await isDemo()) return mockResponse([]);
    return apiClient.get('/store/mine');
  },
  create: async (formData) => {
    if (await isDemo()) return mockResponse({ _id: 's-new', title: 'New Item', price: 100 });
    return apiClient.post('/store', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  update: async (id, data) => {
    if (await isDemo()) return mockResponse({ _id: id, ...data });
    return apiClient.put(`/store/${id}`, data);
  },
  markSold: async (id) => {
    if (await isDemo()) return mockResponse({ success: true });
    return apiClient.patch(`/store/${id}/sold`);
  },
  remove: async (id) => {
    if (await isDemo()) return mockResponse({ success: true });
    return apiClient.delete(`/store/${id}`);
  },
};

// ─── Emotion AI ──────────────────────────────────────────────────────────────
export const emotionService = {
  checkHealth: async () => {
    return apiClient.get('/emotion/health');
  },
  predict: async (imageBase64) => {
    if (await isDemo()) {
      await new Promise(r => setTimeout(r, 1200));
      const emotions = ['happy', 'sad', 'neutral', 'angry', 'surprise', 'fear', 'disgust'];
      const emotion = emotions[Math.floor(Math.random() * emotions.length)];
      const conf = 0.55 + Math.random() * 0.35;
      const others = emotions.filter(e => e !== emotion).map(e => [e, Math.random() * (1 - conf) / 6]);
      const scores = Object.fromEntries([[emotion, conf], ...others]);
      return mockResponse({ emotion, confidence: conf, scores, face_detected: true });
    }
    return apiClient.post('/emotion/predict', { image_base64: imageBase64 });
  },
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orderService = {
  create: async (data) => {
    if (await isDemo()) return mockResponse({ _id: 'o-new', ...data, status: 'pending' });
    return apiClient.post('/orders', data);
  },
  getMyOrders: async () => {
    if (await isDemo()) return mockResponse(MOCK_ORDERS);
    return apiClient.get('/orders/mine');
  },
  getOne: async (id) => {
    if (await isDemo()) return mockResponse(MOCK_ORDERS[0]);
    return apiClient.get(`/orders/${id}`);
  },
  getAll: async () => {
    if (await isDemo()) return mockResponse(MOCK_ORDERS);
    return apiClient.get('/admin/orders');
  },
  updateStatus: async (id, status) => {
    if (await isDemo()) return mockResponse({ _id: id, status });
    return apiClient.patch(`/admin/orders/${id}/status`, { status });
  },
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminService = {
  getStats: async () => {
    if (await isDemo()) return mockResponse({ totalUsers: 128, totalPosts: 340, totalMoods: 892, totalJournals: 456 });
    return apiClient.get('/admin/stats');
  },
  getAllUsers: async () => {
    if (await isDemo()) return mockResponse([MOCK_USER]);
    return apiClient.get('/admin/users');
  },
  getUsers: async () => {
    if (await isDemo()) return mockResponse({ users: [MOCK_USER] });
    return apiClient.get('/admin/users');
  },
  deleteUser: async (id) => {
    if (await isDemo()) return mockResponse({ success: true });
    return apiClient.delete(`/admin/users/${id}`);
  },
  getPersonalityResults: async () => {
    if (await isDemo()) return mockResponse([]);
    return apiClient.get('/admin/personality-results');
  },
  getAllStoreItems: async () => {
    if (await isDemo()) return mockResponse(MOCK_STORE);
    return apiClient.get('/store/admin/all');
  },
  createStoreItem: async (data) => {
    if (await isDemo()) return mockResponse({ _id: 's-admin-new', ...data });
    return apiClient.post('/store', data);
  },
};
