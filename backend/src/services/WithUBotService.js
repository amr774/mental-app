const Groq = require("groq-sdk");
const fs   = require("fs");
const path = require("path");

// ── Crisis keywords ───────────────────────────────────────────────
const CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die", "hurt myself",
    "انتحار", "أقتل نفسي", "اقتل نفسي", "نهاية حياتي", "أؤذي نفسي", "اوذي نفسي",
];

// ── Emotion keywords ──────────────────────────────────────────────
const EMOTION_MAP = {
    sad:      ["sad","depressed","unhappy","hopeless","grief","crying","حزين","مكتئب","بكاء","يأس","حزن"],
    anxious:  ["anxious","anxiety","worried","nervous","panic","stress","قلق","خايف","توتر","ضغط","متوتر"],
    angry:    ["angry","mad","furious","rage","frustrated","زعلان","غاضب","معصب","محبط"],
    lonely:   ["lonely","alone","isolated","no one","وحيد","وحده","عزلة","محدش"],
    happy:    ["happy","great","good","amazing","excited","سعيد","تمام","زين","ممتاز","مبسوط"],
};

// ── Knowledge Base loader ─────────────────────────────────────────
const KB_DIR       = path.join(__dirname, "../data/knowledgeBase");
const CATALOG_PATH = path.join(__dirname, "../data/catalog.json");
const PETS_PATH    = path.join(__dirname, "../data/pets.json");

let kbDocs  = null;
let catalog = null;
let petsDB  = null;

function loadKB() {
    if (kbDocs) return;
    kbDocs = fs.readdirSync(KB_DIR)
        .filter(f => f.endsWith(".txt"))
        .map(f => ({
            name:    f.replace(".txt", ""),
            content: fs.readFileSync(path.join(KB_DIR, f), "utf-8"),
        }));
    catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));
    petsDB  = JSON.parse(fs.readFileSync(PETS_PATH,    "utf-8"));
}

function getRelevantContext(query, topK = 2) {
    loadKB();
    const words = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    return kbDocs
        .map(doc => ({
            ...doc,
            score: words.reduce((s, w) => s + (doc.content.toLowerCase().includes(w) ? 1 : 0), 0),
        }))
        .sort((a, b) => b.score - a.score)
        .filter(d => d.score > 0)
        .slice(0, topK)
        .map(d => `[${d.name}]: ${d.content.slice(0, 600)}`)
        .join("\n\n");
}

// Article recommendation — seenIds prevents repeats within a single session (passed per call)
function getArticleRecommendation(emotion, query, seenIds = new Set()) {
    loadKB();
    const words = `${query} ${emotion}`.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const best = catalog
        .filter(item => !seenIds.has(item.id))
        .map(item => ({
            ...item,
            score: words.reduce((s, w) => s + (item.description.toLowerCase().includes(w) ? 1 : 0), 0),
        }))
        .sort((a, b) => b.score - a.score)[0];

    if (best && best.score > 0) return best;
    return null;
}

// Pet recommendation — pick based on emotion traits
const EMOTION_PET_TRAITS = {
    sad:     ["affectionate", "loving", "gentle", "companion", "loyal", "friendly"],
    anxious: ["calm", "gentle", "adaptable", "loyal", "easygoing"],
    lonely:  ["affectionate", "companion", "playful", "friendly", "family"],
    angry:   ["calm", "gentle", "easygoing", "adaptable"],
    happy:   ["playful", "energetic", "fun", "active"],
};

// Pet recommendation — seenNames prevents repeats within a single session (passed per call)
function getPetRecommendation(emotion, seenNames = new Set()) {
    loadKB();
    const traits = EMOTION_PET_TRAITS[emotion] || EMOTION_PET_TRAITS.sad;
    const scored = petsDB
        .filter(p => !seenNames.has(p.pet_name))
        .map(p => {
            const text  = (p.description + " " + p["Characteristics & Personality"]).toLowerCase();
            const score = traits.reduce((s, t) => s + (text.includes(t) ? 1 : 0), 0);
            return { ...p, score };
        })
        .sort((a, b) => b.score - a.score);

    const best = scored[0];
    if (best) return { name: best.pet_name, category: best.category, description: best.description.slice(0, 200) + "..." };
    return null;
}

function detectEmotion(text) {
    const lower = text.toLowerCase();
    for (const [emotion, keywords] of Object.entries(EMOTION_MAP)) {
        if (keywords.some(k => lower.includes(k))) return emotion;
    }
    return "neutral";
}

// ── WithUBot system prompt ────────────────────────────────────────
const SYSTEM_PROMPT = `You are "WithUBot", a highly empathetic digital companion and mental health support bot.

1. PERSONALITY & TONE:
   - Act as a calm, supportive, and listening friend. Use emotional intelligence.
   - Balance empathy (60%) with practical advice (40%).
   - Keep responses brief and meaningful (2-4 sentences max). Avoid overly dramatic phrases.

2. CONVERSATIONAL RULES:
   - LANGUAGE: Always strictly mirror the user's language (English, Arabic "Egyptian", French, etc.). NEVER switch languages unless the user does first.
   - Casual Chat: If the user talks about hobbies, food, or daily life, chat normally — don't force mental health topics.
   - PETS: Warmly suggest spending time with a pet ONLY if the user is lonely or stressed.
   - NO REPETITION: Do not repeat "I am here to listen" or "I feel you" every message.

3. SAFETY (CRITICAL):
   - NO DIAGNOSIS: Never provide medical diagnoses or prescribe medications.
   - SELF-HARM: Provide Egypt hotline (16328) ONLY if the user explicitly mentions self-harm or suicide. Do NOT mention it for general sadness.

4. RECOMMENDATIONS:
   - If [KNOWLEDGE CONTEXT] is provided, weave it naturally: "I was reading something that might help..."
   - If [RECOMMENDED ARTICLE] is provided, mention the article name and summary naturally.

5. OUTPUT: Ensure every response is a complete thought. Do not stop mid-sentence.`;

// ── Main service ──────────────────────────────────────────────────
class WithUBotService {
    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (apiKey && apiKey !== "your_groq_api_key_here") {
            this.groq  = new Groq({ apiKey });
            this.ready = true;
            console.log("✅ WithUBot (Groq/Llama) ready");
        } else {
            this.groq  = null;
            this.ready = false;
            console.warn("⚠️  GROQ_API_KEY not set — WithUBot will use fallback replies");
        }
    }

    async respond(message, history = []) {
        if (!message) throw { status: 400, message: "Message is required" };

        const lower = message.toLowerCase();

        // 1. Crisis check
        if (CRISIS_KEYWORDS.some(k => lower.includes(k))) {
            return {
                reply:   "أنا قلقان عليك جداً. من فضلك تواصل مع خط نجدة الطفل والأسرة على 16328 — أنت لست وحدك. 💙\nI'm very concerned. Please call Egypt's crisis line: 16328. You are not alone.",
                emotion: "crisis",
                crisis:  true,
                hotline: "Egypt: 16328",
                recommendedArticle: null,
                recommendedPet: null,
            };
        }

        // 2. Detect emotion
        const emotion = detectEmotion(lower);

        // 3. Knowledge context
        const context = getRelevantContext(message);

        // 4. Article + Pet recommendation — build seen sets from conversation history
        const seenArticleIds = new Set(
            history.filter(m => m.rec?.id).map(m => m.rec.id)
        );
        const seenPetNames = new Set(
            history.filter(m => m.petRec?.name).map(m => m.petRec.name)
        );
        const needsRec = emotion !== "neutral" && emotion !== "happy";
        const rec    = needsRec ? getArticleRecommendation(emotion, message, seenArticleIds) : null;
        const petRec = needsRec ? getPetRecommendation(emotion, seenPetNames)                : null;

        let reply;
        if (this.ready) {
            const contextBlock = context ? `\n[KNOWLEDGE CONTEXT]:\n${context}\n` : "";
            const recBlock     = rec ? `\n[RECOMMENDED ARTICLE]: "${rec.name}": ${rec.description}\n` : "";
            const emotionBlock = `\n[USER MOOD]: ${emotion}\n`;

            const chatHistory = history
                .slice(-10)
                .filter(m => m.text && m.sender)
                .map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));

            try {
                const completion = await this.groq.chat.completions.create({
                    model:    "llama-3.1-8b-instant",
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        ...chatHistory,
                        { role: "user", content: `${emotionBlock}${contextBlock}${recBlock}\nUSER MESSAGE: ${message}` },
                    ],
                    max_tokens:  400,
                    temperature: 0.5,
                });
                reply = completion.choices[0]?.message?.content?.trim() || "I'm here for you. Tell me more.";
            } catch (err) {
                console.error("Groq error:", err.message);
                reply = "I'm here for you. Can you tell me more about how you're feeling?";
            }
        } else {
            const FALLBACKS = {
                sad:     "I'm really sorry you're feeling this way. You're not alone in this.",
                anxious: "Anxiety can be overwhelming. Try focusing on slow, deep breaths right now.",
                angry:   "It's okay to feel angry. Let's talk through what's bothering you.",
                lonely:  "Feeling lonely is hard. Reaching out like this is a brave first step.",
                happy:   "That's wonderful! Tell me more about what made your day great.",
                neutral: "I'm here to listen. Tell me more about how you're feeling.",
            };
            reply = FALLBACKS[emotion] || FALLBACKS.neutral;
        }

        return { reply, emotion, crisis: false, hotline: null, recommendedArticle: rec || null, recommendedPet: petRec || null };
    }
}

module.exports = new WithUBotService();
