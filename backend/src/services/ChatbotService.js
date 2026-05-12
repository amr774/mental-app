const Groq = require("groq-sdk");
const articleRepository = require("../repositories/ArticleRepository");
const petRepository     = require("../repositories/PetRepository");

// ── Crisis keywords (hardcoded – bypasses AI for safety) ──────────
const CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die", "hurt myself",
    "انتحار", "أقتل نفسي", "نهاية حياتي", "أؤذي نفسي",
];

// ── Mood keywords for recommendations ────────────────────────────
const MOOD_KEYWORDS = {
    stress:  ["stress", "stressed", "overwhelmed", "burnout", "pressure", "ضغط", "متوتر", "مرهق", "إرهاق"],
    sad:     ["sad", "depressed", "unhappy", "depression", "hopeless", "حزين", "مكتئب", "اكتئاب", "يأس"],
    lonely:  ["lonely", "alone", "isolated", "no one", "وحيد", "وحدة", "عزلة", "محدش"],
    anxious: ["anxious", "anxiety", "worried", "nervous", "panic", "قلق", "خايف", "خوف", "توتر"],
};

// ── System prompt ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Mindful, a warm and compassionate mental health support companion built into a wellness app.

Your role:
- Listen empathetically and provide emotional support
- Offer practical coping strategies, breathing techniques, and mindfulness tips
- Be warm, non-judgmental, encouraging, and hopeful
- Keep responses concise (2–4 sentences) — clear and easy to read
- Respond in the SAME language the user writes in (Arabic → Arabic, English → English)
- Never diagnose medical conditions or prescribe treatment
- Gently encourage professional help for serious issues
- If the user seems in crisis, show genuine concern and mention helplines

You are NOT a replacement for professional mental health care. You are a caring companion.
Do not use excessive emojis — be natural and human.`;

class ChatbotService {
    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (apiKey && apiKey !== "your_groq_api_key_here") {
            this.groq  = new Groq({ apiKey });
            this.ready = true;
            console.log("✅ Groq AI chatbot ready");
        } else {
            this.groq  = null;
            this.ready = false;
            console.warn("⚠️  GROQ_API_KEY not set — chatbot will use fallback replies");
        }
    }

    detectMood(text) {
        const lower = text.toLowerCase();
        for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
            if (keywords.some(k => lower.includes(k))) return mood;
        }
        return null;
    }

    async respond(message, history = []) {
        if (!message) throw { status: 400, message: "Message is required" };

        const lower = message.toLowerCase();

        // 1. Crisis check — always hardcoded, never delegated to AI
        if (CRISIS_KEYWORDS.some(k => lower.includes(k))) {
            return {
                mood:    "crisis",
                reply:   "أنا قلقان عليك جداً. من فضلك تواصل مع خط دعم الأزمات الآن — أنت لست وحدك. 💙\nI'm very concerned about you. Please reach out to a crisis helpline right now. You are not alone.",
                crisis:  true,
                helpline: "Egypt: 08008880700 | International: 988 (US) | befrienders.org",
                recommendedArticles: [],
                recommendedPets:     [],
            };
        }

        // 2. Detect mood for recommendations
        const mood = this.detectMood(lower);

        // 3. Generate reply with Groq
        let reply;
        if (this.ready) {
            try {
                // Build conversation history for Groq (last 10 messages)
                const chatHistory = history
                    .slice(-10)
                    .filter(m => m.text && m.sender)
                    .map(m => ({
                        role:    m.sender === "user" ? "user" : "assistant",
                        content: m.text,
                    }));

                const completion = await this.groq.chat.completions.create({
                    model:       "llama-3.1-8b-instant",   // fast & free
                    messages:    [
                        { role: "system",  content: SYSTEM_PROMPT },
                        ...chatHistory,
                        { role: "user",    content: message },
                    ],
                    max_tokens:  300,
                    temperature: 0.7,
                });

                reply = completion.choices[0]?.message?.content?.trim()
                    || "I'm here for you. Can you tell me more?";
            } catch (err) {
                console.error("Groq error:", err.message);
                reply = "I'm here for you. Can you tell me more about how you're feeling?";
            }
        } else {
            // Fallback replies when no API key is configured
            const FALLBACKS = {
                stress:  "It sounds like you're under a lot of pressure. Try taking a few slow deep breaths.",
                sad:     "I'm really sorry you're feeling this way. You're not alone.",
                lonely:  "Feeling lonely is hard. Reaching out is a brave first step.",
                anxious: "Anxiety can be overwhelming. Try focusing on 5 things you can see around you right now.",
            };
            reply = FALLBACKS[mood] || "I'm here to listen. Tell me more about how you're feeling.";
        }

        // 4. Fetch recommendations only when a mood is detected
        let articles = [], pets = [];
        if (mood) {
            [articles, pets] = await Promise.all([
                articleRepository.findByCategory(mood),
                petRepository.findByPersonality(mood),
            ]);
        }

        // 5. If suggestions exist → ask the user instead of auto-showing
        const hasSuggestions = articles.length > 0 || pets.length > 0;
        if (hasSuggestions) {
            const isArabic = /[؀-ۿ]/.test(message);
            const question = isArabic
                ? '\n\nهل تريد أن أقترح لك بعض المقالات أو الحيوانات التي قد تساعدك؟'
                : '\n\nWould you like me to suggest some articles or companion animals that might help?';
            reply = reply.trimEnd() + question;
        }

        return {
            mood:   mood || "general",
            reply,
            crisis: false,
            hasSuggestions,
            recommendedArticles: articles.slice(0, 2),
            recommendedPets:     pets.slice(0, 2),
        };
    }
}

module.exports = new ChatbotService();
