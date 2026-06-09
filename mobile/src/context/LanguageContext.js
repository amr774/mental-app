import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const translations = {
  en: {
    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    sendResetLink: 'Send Reset Link',

    // Navigation
    home: 'Home',
    chat: 'Chat',
    mood: 'Mood',
    community: 'Community',
    profile: 'Profile',
    articles: 'Articles',
    journal: 'Journal',
    goals: 'Goals',
    pets: 'Pets',
    store: 'Store',
    breathe: 'Breathe',
    test: 'Test',
    admin: 'Admin',
    dashboard: 'Dashboard',

    // Dashboard
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    howAreYou: "How are you today?",
    recentMoods: 'Recent Moods',
    weeklyGoals: 'Weekly Goals',
    quickActions: 'Quick Actions',
    viewAll: 'View All',

    // Mood
    logMood: 'Log Mood',
    moodHistory: 'Mood History',
    howFeeling: 'How are you feeling?',
    addNote: 'Add a note (optional)',
    great: 'Great',
    good: 'Good',
    okay: 'Okay',
    bad: 'Bad',
    terrible: 'Terrible',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',

    // Chat
    aiCompanion: 'AI Companion',
    typeMessage: 'Type a message...',
    send: 'Send',
    thinking: 'Thinking...',

    // Journal
    newEntry: 'New Entry',
    title: 'Title',
    content: 'Content',
    writeThoughts: 'Write your thoughts...',
    noEntries: 'No journal entries yet',
    startJournal: 'Start journaling today',

    // Goals
    addGoal: 'Add Goal',
    goalTitle: 'Goal title',
    completed: 'Completed',
    active: 'Active',
    noGoals: 'No goals yet',
    setGoals: 'Set your first goal',

    // Community
    posts: 'Posts',
    createPost: 'Create Post',
    postContent: 'Share your thoughts...',
    anonymous: 'Post anonymously',
    likes: 'Likes',
    comments: 'Comments',
    addComment: 'Add a comment...',
    noPosts: 'No posts yet',
    beFirst: 'Be the first to post!',

    // Articles
    readMore: 'Read More',
    search: 'Search articles...',
    noArticles: 'No articles found',

    // Pets
    adopt: 'Adopt',
    adopted: 'Adopted',
    unadopt: 'Release',
    myPets: 'My Pets',
    availablePets: 'Available Pets',

    // Store
    price: 'Price',
    category: 'Category',
    description: 'Description',
    createListing: 'Create Listing',
    myListings: 'My Listings',
    markSold: 'Mark as Sold',
    sold: 'Sold',

    // Profile
    editProfile: 'Edit Profile',
    changePhoto: 'Change Photo',
    settings: 'Settings',
    darkMode: 'Dark Mode',
    language: 'Language',
    notifications: 'Notifications',
    about: 'About',

    // Common
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Retry',
    noData: 'No data available',
    success: 'Success',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    close: 'Close',
    or: 'or',
  },
  ar: {
    // Auth
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    name: 'الاسم',
    confirmPassword: 'تأكيد كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    resetPassword: 'إعادة تعيين كلمة المرور',
    dontHaveAccount: 'ليس لديك حساب؟',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    signIn: 'دخول',
    signUp: 'تسجيل',
    sendResetLink: 'إرسال رابط الاسترداد',

    // Navigation
    home: 'الرئيسية',
    chat: 'المحادثة',
    mood: 'المزاج',
    community: 'المجتمع',
    profile: 'الملف الشخصي',
    articles: 'المقالات',
    journal: 'اليوميات',
    goals: 'الأهداف',
    pets: 'الحيوانات',
    store: 'المتجر',
    breathe: 'التنفس',
    test: 'الاختبار',
    admin: 'الإدارة',
    dashboard: 'لوحة التحكم',

    // Dashboard
    goodMorning: 'صباح الخير',
    goodAfternoon: 'مساء الخير',
    goodEvening: 'مساء الخير',
    howAreYou: 'كيف حالك اليوم؟',
    recentMoods: 'المزاج الأخير',
    weeklyGoals: 'الأهداف الأسبوعية',
    quickActions: 'إجراءات سريعة',
    viewAll: 'عرض الكل',

    // Mood
    logMood: 'تسجيل المزاج',
    moodHistory: 'سجل المزاج',
    howFeeling: 'كيف تشعر؟',
    addNote: 'أضف ملاحظة (اختياري)',
    great: 'ممتاز',
    good: 'جيد',
    okay: 'عادي',
    bad: 'سيء',
    terrible: 'مروع',
    submit: 'إرسال',
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',

    // Chat
    aiCompanion: 'المساعد الذكي',
    typeMessage: 'اكتب رسالة...',
    send: 'إرسال',
    thinking: 'جاري التفكير...',

    // Journal
    newEntry: 'إدخال جديد',
    title: 'العنوان',
    content: 'المحتوى',
    writeThoughts: 'اكتب أفكارك...',
    noEntries: 'لا توجد إدخالات',
    startJournal: 'ابدأ اليوميات اليوم',

    // Goals
    addGoal: 'إضافة هدف',
    goalTitle: 'عنوان الهدف',
    completed: 'مكتمل',
    active: 'نشط',
    noGoals: 'لا توجد أهداف',
    setGoals: 'حدد هدفك الأول',

    // Community
    posts: 'المنشورات',
    createPost: 'إنشاء منشور',
    postContent: 'شارك أفكارك...',
    anonymous: 'نشر بشكل مجهول',
    likes: 'إعجابات',
    comments: 'تعليقات',
    addComment: 'أضف تعليقاً...',
    noPosts: 'لا توجد منشورات',
    beFirst: 'كن أول من ينشر!',

    // Articles
    readMore: 'اقرأ المزيد',
    search: 'ابحث في المقالات...',
    noArticles: 'لا توجد مقالات',

    // Pets
    adopt: 'تبني',
    adopted: 'تم التبني',
    unadopt: 'إعادة',
    myPets: 'حيواناتي',
    availablePets: 'الحيوانات المتاحة',

    // Store
    price: 'السعر',
    category: 'الفئة',
    description: 'الوصف',
    createListing: 'إنشاء إعلان',
    myListings: 'إعلاناتي',
    markSold: 'تحديد كمباع',
    sold: 'مباع',

    // Profile
    editProfile: 'تعديل الملف',
    changePhoto: 'تغيير الصورة',
    settings: 'الإعدادات',
    darkMode: 'الوضع الداكن',
    language: 'اللغة',
    notifications: 'الإشعارات',
    about: 'حول',

    // Common
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    retry: 'إعادة المحاولة',
    noData: 'لا توجد بيانات',
    success: 'نجح',
    confirm: 'تأكيد',
    yes: 'نعم',
    no: 'لا',
    back: 'رجوع',
    next: 'التالي',
    done: 'تم',
    close: 'إغلاق',
    or: 'أو',
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem('language').then((saved) => {
      if (saved) setLanguageState(saved);
    });
  }, []);

  const setLanguage = async (lang) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('language', lang);
    // RTL support for Arabic
    const isRTL = lang === 'ar';
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  };

  const t = (key) => translations[language]?.[key] || translations.en[key] || key;
  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
};

export default LanguageContext;
