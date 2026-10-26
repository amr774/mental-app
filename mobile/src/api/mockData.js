// Demo mode mock data — mirrors the web frontend data shapes exactly

export const MOCK_USER = {
  _id: 'demo-user',
  name: 'Ahmed Mostafa',
  email: 'demo@mindful.app',
  role: 'user',
  avatar: null,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export const MOCK_DASHBOARD = {
  streak: 7,
  moodCount: 12,
  journalCount: 5,
  adoptedPetsCount: 2,
  goalsCompletedThisWeek: 3,
  postsCount: 4,
  personality: 'Calm',
};

export const MOCK_MOODS = [
  { _id: 'm1', mood: 5, note: 'Feeling great today!', createdAt: new Date(Date.now() - 0 * 86400000).toISOString() },
  { _id: 'm2', mood: 4, note: 'Good productive day', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
  { _id: 'm3', mood: 3, note: 'Just an okay day', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { _id: 'm4', mood: 4, note: 'Had coffee with friends', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { _id: 'm5', mood: 2, note: 'Stressful work meeting', createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { _id: 'm6', mood: 5, note: 'Weekend vibes!', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { _id: 'm7', mood: 4, note: 'Exercised in the morning', createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
];

export const MOCK_JOURNALS = [
  {
    _id: 'j1',
    title: 'A New Beginning',
    content: 'Today I decided to take my mental health seriously. I started journaling and it feels amazing to get my thoughts out. The day was productive and I managed to finish all my tasks.',
    mood: 5,
    tags: ['gratitude', 'productivity'],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    _id: 'j2',
    title: 'Mindfulness Practice',
    content: 'Spent 20 minutes meditating this morning. My mind was racing at first but gradually calmed down. I noticed how much anxiety I carry without even realizing it.',
    mood: 4,
    tags: ['mindfulness', 'meditation'],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    _id: 'j3',
    title: 'Dealing with Stress',
    content: 'Work has been overwhelming lately. I need to find better ways to manage my time. Maybe I should try the Pomodoro technique. On the bright side, I went for a walk and it helped.',
    mood: 2,
    tags: ['stress', 'work'],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    _id: 'j4',
    title: 'Grateful for Small Things',
    content: 'Had a wonderful conversation with my friend today. We talked for hours and I realized how important human connection is. Also tried a new recipe for dinner — turned out great!',
    mood: 5,
    tags: ['gratitude', 'friendship'],
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    _id: 'j5',
    title: 'Setting Intentions',
    content: 'Started the week with clear intentions. I want to exercise 3 times, journal daily, and limit screen time before bed. Small steps lead to big changes.',
    mood: 4,
    tags: ['goals', 'intentions'],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

export const MOCK_GOALS = [
  { _id: 'g1', title: 'Meditate for 10 minutes daily', completed: true, category: 'mindfulness', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { _id: 'g2', title: 'Exercise 3 times this week', completed: true, category: 'health', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { _id: 'g3', title: 'Read 20 pages before bed', completed: true, category: 'learning', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { _id: 'g4', title: 'Drink 8 glasses of water', completed: false, category: 'health', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { _id: 'g5', title: 'Write in journal every day', completed: false, category: 'mindfulness', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
  { _id: 'g6', title: 'No social media after 9 PM', completed: false, category: 'digital-detox', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
];

export const MOCK_ARTICLES = [
  {
    _id: 'a1',
    title: '5 Simple Breathing Exercises for Anxiety',
    summary: 'Discover how mindful breathing can help reduce anxiety and stress in just minutes.',
    content: 'Breathing exercises are one of the most powerful tools for managing anxiety...',
    category: 'anxiety',
    image: null,
    author: { name: 'Dr. Sarah Ahmed' },
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    readTime: 5,
  },
  {
    _id: 'a2',
    title: 'The Science of Sleep and Mental Health',
    summary: 'How quality sleep impacts your emotional wellbeing and cognitive function.',
    content: 'Sleep is not just rest — it is when our brain processes emotions and consolidates memories...',
    category: 'sleep',
    image: null,
    author: { name: 'Dr. Mohamed Ali' },
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    readTime: 7,
  },
  {
    _id: 'a3',
    title: 'Building Resilience: Bouncing Back from Setbacks',
    summary: 'Learn evidence-based strategies to build mental resilience and face challenges.',
    content: 'Resilience is not something you are born with — it is a skill that can be developed...',
    category: 'resilience',
    image: null,
    author: { name: 'Dr. Nour Hassan' },
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    readTime: 6,
  },
  {
    _id: 'a4',
    title: 'Mindfulness for Beginners: A Practical Guide',
    summary: 'Start your mindfulness journey with these simple and effective techniques.',
    content: 'Mindfulness is the practice of paying attention to the present moment without judgment...',
    category: 'mindfulness',
    image: null,
    author: { name: 'Dr. Layla Ibrahim' },
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    readTime: 8,
  },
];

export const MOCK_PETS = [
  { _id: 'p1', name: 'Luna', species: 'cat', type: 'cat', age: 2, description: 'A gentle and playful cat who loves cuddles.', traits: ['gentle', 'playful', 'loving'], adopted: true, adoptedBy: 'demo-user', price: 0, status: 'available' },
  { _id: 'p2', name: 'Max', species: 'dog', type: 'dog', age: 3, description: 'An energetic golden retriever who loves to play fetch.', traits: ['energetic', 'friendly', 'loyal'], adopted: true, adoptedBy: 'demo-user', price: 0, status: 'available' },
  { _id: 'p3', name: 'Coco', species: 'rabbit', type: 'rabbit', age: 1, description: 'A fluffy white rabbit who enjoys hopping around.', traits: ['fluffy', 'curious', 'quiet'], adopted: false, price: 0, status: 'available' },
  { _id: 'p4', name: 'Nemo', species: 'fish', type: 'fish', age: 1, description: 'A colorful clownfish who loves to swim.', traits: ['colorful', 'calm', 'peaceful'], adopted: false, price: 0, status: 'available' },
  { _id: 'p5', name: 'Tweety', species: 'bird', type: 'bird', age: 2, description: 'A cheerful yellow canary with a beautiful song.', traits: ['cheerful', 'musical', 'social'], adopted: false, price: 0, status: 'available' },
  { _id: 'p6', name: 'Hammy', species: 'hamster', type: 'hamster', age: 1, description: 'A tiny hamster who runs on his wheel all night.', traits: ['tiny', 'active', 'nocturnal'], adopted: false, price: 0, status: 'available' },
];

export const MOCK_POSTS = [
  {
    _id: 'post1',
    content: 'Today was tough but I made it through. Remember: progress, not perfection. 💙',
    author: { _id: 'u2', name: 'Sara M.', avatar: null },
    likes: ['u3', 'u4', 'demo-user'],
    comments: [
      { _id: 'c1', text: 'You got this! 💪', author: { name: 'Ali K.' }, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
      { _id: 'c2', text: 'So proud of you!', author: { name: 'Nour H.' }, createdAt: new Date(Date.now() - 1 * 3600000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    _id: 'post2',
    content: 'Just finished my first week of daily meditation. I cannot believe how much clearer my mind feels. Highly recommend starting with just 5 minutes! 🧘‍♀️',
    author: { _id: 'u3', name: 'Omar F.', avatar: null },
    likes: ['u2', 'u4'],
    comments: [
      { _id: 'c3', text: 'Meditation changed my life too!', author: { name: 'Sara M.' }, createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    _id: 'post3',
    content: 'Feeling anxious about an upcoming presentation. Any tips for managing nerves? 😰',
    author: { _id: 'u4', name: 'Layla R.', avatar: null },
    likes: ['demo-user'],
    comments: [
      { _id: 'c4', text: 'Deep breathing really helps before presentations!', author: { name: 'Ahmed T.' }, createdAt: new Date(Date.now() - 12 * 3600000).toISOString() },
      { _id: 'c5', text: 'Practice in front of a mirror 👍', author: { name: 'Omar F.' }, createdAt: new Date(Date.now() - 10 * 3600000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 14 * 3600000).toISOString(),
  },
  {
    _id: 'post4',
    content: 'Grateful for this community. Finding people who understand the mental health journey makes all the difference. 🌟',
    author: { _id: 'demo-user', name: 'Ahmed Mostafa', avatar: null },
    likes: ['u2', 'u3', 'u4'],
    comments: [],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const MOCK_STORE = [
  { _id: 's1', title: 'Mindfulness Journal - Barely Used', description: 'A beautiful leather journal with 200 pages. Used only a few times.', price: 85, category: 'books', seller: { _id: 'u2', name: 'Sara M.' }, image: null, sold: false, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { _id: 's2', title: 'Meditation Cushion Set', description: 'Purple zafu and zabuton set. Perfect condition, barely used.', price: 250, category: 'accessories', seller: { _id: 'u3', name: 'Omar F.' }, image: null, sold: false, createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { _id: 's3', title: 'Aromatherapy Diffuser', description: 'Ultrasonic essential oil diffuser with 7 LED colors.', price: 180, category: 'wellness', seller: { _id: 'u4', name: 'Layla R.' }, image: null, sold: false, createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  { _id: 's4', title: 'Yoga Mat - Premium Quality', description: 'Non-slip eco-friendly yoga mat, 6mm thickness.', price: 320, category: 'fitness', seller: { _id: 'u2', name: 'Sara M.' }, image: null, sold: false, createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
];

export const MOCK_PERSONALITY_RESULT = {
  result: 'Calm',
  description: 'You are a balanced and grounded individual. You handle stress well and tend to remain calm in difficult situations. Your emotional stability is a great strength.',
  createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
};

export const MOCK_ORDERS = [
  {
    _id: 'o1',
    item: { title: 'Mindfulness Journal', price: 85 },
    status: 'delivered',
    total: 85,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

export const MOCK_CHAT_RESPONSES = [
  "I hear you. It's completely normal to feel that way. Would you like to talk more about what's on your mind?",
  "That sounds challenging. Remember, it's okay to ask for help. What do you think might make things a little easier right now?",
  "Thank you for sharing that with me. Taking care of your mental health is one of the most important things you can do for yourself.",
  "I understand. Sometimes just talking about our feelings can help us process them. How long have you been feeling this way?",
  "That's a really insightful observation. Have you tried any relaxation techniques like deep breathing or mindfulness?",
];

// Helper to get a random chat response
export const getRandomChatResponse = () =>
  MOCK_CHAT_RESPONSES[Math.floor(Math.random() * MOCK_CHAT_RESPONSES.length)];

// Mock response wrapper — mirrors axios response shape
export const mockResponse = (data) => Promise.resolve({ data });
