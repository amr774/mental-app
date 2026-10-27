require("dotenv").config();
const connectDB   = require("./src/config/db");
const Article     = require("./src/models/Article");
const Pet         = require("./src/models/Pet");
const StoreItem   = require("./src/models/StoreItem");
const mongoose    = require("mongoose");

// Official, research-backed mental health articles
const articles = [
    // ── Stress ────────────────────────────────────────────────────────
    {
        title: "Managing Stress: Evidence-Based Strategies",
        content: "Stress is the body's natural response to demands. Chronic stress can impair immune function, raise blood pressure, and increase the risk of heart disease. Evidence-based strategies include regular aerobic exercise (30 minutes, 5 days a week), progressive muscle relaxation, cognitive restructuring to challenge negative thoughts, and social support networks. The American Psychological Association recommends identifying stressors, setting limits on news and social media consumption, and practicing mindfulness-based stress reduction (MBSR), which has shown a 40% reduction in perceived stress in clinical trials (Khoury et al., 2015, Journal of Psychosomatic Research).",
        category: "stress",
    },
    {
        title: "The Science of Deep Breathing for Stress Relief",
        content: "Diaphragmatic breathing activates the parasympathetic nervous system, counteracting the fight-or-flight response. A study published in Frontiers in Human Neuroscience (2018) found that slow-paced breathing (6 breaths/minute) significantly reduces cortisol levels and improves mood. Techniques: Box breathing (inhale 4s, hold 4s, exhale 4s, hold 4s), 4-7-8 breathing, and alternate-nostril breathing. Even 5 minutes of daily practice can produce measurable physiological benefits within two weeks.",
        category: "stress",
    },
    {
        title: "How Exercise Protects Your Mental Health",
        content: "Physical activity is one of the most effective interventions for mental health. Exercise increases endorphins, serotonin, and BDNF (brain-derived neurotrophic factor), which promotes neuroplasticity. A landmark meta-analysis in JAMA Psychiatry (2019) found that people who exercised regularly had 43.2% fewer days of poor mental health per month. Even a 10-minute walk produces immediate mood improvements. The WHO recommends 150–300 minutes of moderate-intensity activity per week for adults.",
        category: "stress",
    },

    // ── Anxiety ───────────────────────────────────────────────────────
    {
        title: "Understanding Anxiety: Causes, Symptoms, and Treatment",
        content: "Anxiety disorders affect 284 million people worldwide, making them the most prevalent mental health condition (WHO, 2020). Symptoms include excessive worry, rapid heartbeat, muscle tension, and avoidance behaviour. First-line treatments are Cognitive Behavioural Therapy (CBT) and, when needed, SSRIs or SNRIs. CBT has a 60–80% success rate for generalised anxiety disorder. The 5-4-3-2-1 grounding technique (name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste) offers immediate relief during anxiety episodes.",
        category: "anxiety",
    },
    {
        title: "Mindfulness-Based Cognitive Therapy for Anxiety",
        content: "MBCT combines mindfulness practices with cognitive therapy to break cycles of anxiety and rumination. Published in Behaviour Research and Therapy, MBCT reduced anxiety disorder symptoms in 58% of participants after 8 weeks. Core practices include body-scan meditation, mindful breathing, and observing thoughts without judgment. Apps like Headspace and Calm offer guided MBCT programmes. Daily 10-minute sessions are sufficient to produce neurological changes visible on fMRI scans within 8 weeks.",
        category: "anxiety",
    },

    // ── Depression ────────────────────────────────────────────────────
    {
        title: "Depression: A Clinical Overview and Path to Recovery",
        content: "Major depressive disorder (MDD) affects 280 million people globally and is a leading cause of disability (WHO). It is characterised by persistent low mood, loss of interest, fatigue, and cognitive difficulties. Effective treatments include CBT, interpersonal therapy, antidepressants (SSRIs such as sertraline and fluoxetine), and for severe cases, electroconvulsive therapy (ECT). Lifestyle factors — sleep hygiene, regular exercise, omega-3 fatty acid intake, and social connection — are powerful adjuncts. Early intervention is critical: 80% of people with depression improve with treatment.",
        category: "sad",
    },
    {
        title: "Behavioural Activation: Fighting Depression Through Action",
        content: "Behavioural Activation (BA) is an evidence-based therapy for depression based on the premise that activity influences mood, not the other way around. By scheduling pleasant or meaningful activities even when you don't 'feel like it', you can interrupt the cycle of withdrawal and low mood. A Lancet study (2016) found BA as effective as CBT for depression. Start small: a 10-minute walk, cooking a meal, calling a friend. Track mood before and after each activity to identify mood-lifting patterns.",
        category: "sad",
    },
    {
        title: "The Connection Between Sleep and Depression",
        content: "Sleep disturbances — insomnia or hypersomnia — are both a symptom and a cause of depression. A 2021 Nature Genetics study identified shared genetic pathways between insomnia and depression. Sleep hygiene practices: maintain consistent sleep/wake times, limit blue light 90 minutes before bed, keep the bedroom cool (16–19°C), and avoid caffeine after 2 pm. Cognitive Behavioural Therapy for Insomnia (CBT-I) is the first-line treatment and has been shown to reduce depressive symptoms even without targeting depression directly.",
        category: "sad",
    },

    // ── Loneliness ────────────────────────────────────────────────────
    {
        title: "The Health Risks of Loneliness and How to Overcome It",
        content: "Loneliness is as harmful to health as smoking 15 cigarettes a day, according to former US Surgeon General Dr. Vivek Murthy. Chronic loneliness increases the risk of premature death by 26% (Holt-Lunstad, 2015, PLOS Medicine). Solutions are multi-layered: micro-connections (brief conversations with strangers), community activities, volunteering, pet ownership, and when needed, therapy. Social skills training in CBT helps people who find connection difficult. Animal-assisted therapy has shown measurable reductions in loneliness among older adults.",
        category: "lonely",
    },
    {
        title: "Building Meaningful Connections: A Research-Based Guide",
        content: "Meaningful social connection requires vulnerability, consistency, and reciprocity. Psychologist John Cacioppo's research identified that quality of relationships matters more than quantity. Strategies: join interest-based groups (sports, arts, volunteering), practice active listening, disclose personal information gradually to build trust, and invest in digital-free time with people you care about. Even 1–3 close relationships are sufficient for robust wellbeing. Shared activities strengthen bonds faster than conversation alone.",
        category: "lonely",
    },

    // ── Mindfulness ───────────────────────────────────────────────────
    {
        title: "What Is Mindfulness? Science and Practice",
        content: "Mindfulness is the practice of intentionally directing attention to the present moment without judgment. Research by Sara Lazar at Harvard showed that 8 weeks of mindfulness practice increases grey matter density in the hippocampus (learning and memory) and decreases it in the amygdala (stress response). Daily 10-minute meditation sessions are sufficient to produce measurable changes. Techniques: breath awareness, body scan, mindful walking, and mindful eating. Mindfulness-Based Stress Reduction (MBSR) is an 8-week structured programme with strong evidence for anxiety, depression, and chronic pain.",
        category: "Mindfulness",
    },
    {
        title: "Digital Detox: Protecting Your Mental Health in the Age of Social Media",
        content: "Excessive social media use is associated with increased anxiety, depression, and FOMO. A 2018 University of Pennsylvania study found that limiting social media to 30 minutes daily significantly reduced loneliness and depression. Recommended strategies: disable non-essential notifications, use app timers, designate phone-free zones (bedroom, dining table), and schedule intentional check-ins rather than passive scrolling. The key is mindful consumption, not total abstinence.",
        category: "Mindfulness",
    },

    // ── Self-Care ─────────────────────────────────────────────────────
    {
        title: "The Science of Self-Compassion",
        content: "Self-compassion — treating yourself with the same kindness you would offer a friend — is a stronger predictor of wellbeing than self-esteem, according to Dr. Kristin Neff's research at the University of Texas. Self-compassion has three components: self-kindness, common humanity (recognising suffering is universal), and mindfulness. Practices include writing a self-compassionate letter, using the 'self-compassion break' during difficult moments, and replacing self-critical inner dialogue with neutral or kind language.",
        category: "Self-Care",
    },
    {
        title: "Nutrition and Mental Health: The Gut-Brain Axis",
        content: "Emerging research confirms that diet profoundly influences mental health through the gut-brain axis. The gut microbiome produces 95% of the body's serotonin. A Mediterranean diet — rich in vegetables, fruits, legumes, whole grains, fish, and olive oil — is associated with a 33% lower risk of depression (Jacka et al., BMC Medicine, 2017). Key nutrients for mental health: omega-3 fatty acids (oily fish, walnuts), magnesium (leafy greens, nuts), B vitamins (whole grains, eggs), and probiotics (yogurt, kefir). Ultra-processed foods increase inflammation, which is linked to depression.",
        category: "Self-Care",
    },
    {
        title: "The Power of Journaling for Mental Health",
        content: "Expressive writing has been studied since Dr. James Pennebaker's landmark 1986 research. Writing about thoughts and feelings for 15–20 minutes, 3–4 days a week, reduces intrusive thoughts, improves immune function, and decreases depression symptoms. Gratitude journaling — writing 3 specific things you are grateful for daily — increases life satisfaction scores by 25% (Emmons & McCullough, 2003). Prompts to get started: 'Today I felt…', 'One thing I learned about myself this week…', 'What would I tell a friend in my situation?'",
        category: "Self-Care",
    },

    // ── General ───────────────────────────────────────────────────────
    {
        title: "When to Seek Professional Mental Health Help",
        content: "You should consider speaking to a mental health professional if symptoms persist for more than two weeks, interfere with daily functioning, or involve thoughts of self-harm. Mental health professionals include psychiatrists (who can prescribe medication), psychologists (who provide therapy), and counsellors. In many countries, a GP referral is the first step. Teletherapy platforms have removed barriers of distance and stigma. Remember: seeking help is a sign of self-awareness and strength, not weakness.",
        category: "Mental Health",
    },
    {
        title: "Resilience: Building Your Mental Immune System",
        content: "Resilience is the capacity to recover from adversity. It is not a fixed trait but a set of skills that can be developed. The American Psychological Association identifies key factors: maintaining positive relationships, accepting change as part of life, setting realistic goals, taking decisive action, and finding meaning in difficulty. Post-traumatic growth — positive psychological change following adversity — is documented in 50–70% of trauma survivors. Practices that build resilience include gratitude, mindfulness, physical exercise, helping others, and narrative therapy.",
        category: "Mental Health",
    },
];

const pets = [
    { name: "Rex",    type: "dog",    personality: "stress",  price: 1800, contact: "+20 100 123 4567", description: "A calm golden retriever — ideal for stress relief through daily walks and cuddles.",     image: "https://loremflickr.com/400/300/golden+retriever?lock=1" },
    { name: "Mimi",   type: "cat",    personality: "sad",     price:  900, contact: "+20 101 234 5678", description: "A gentle, affectionate cat whose purring has a medically documented calming effect.",     image: "https://loremflickr.com/400/300/cute+cat?lock=2" },
    { name: "Fluffy", type: "rabbit", personality: "anxious", price:  600, contact: "+20 102 345 6789", description: "A soft white rabbit — stroking her fur lowers heart rate within minutes.",                image: "https://loremflickr.com/400/300/white+rabbit?lock=3" },
    { name: "Lolo",   type: "dog",    personality: "lonely",  price: 2200, contact: "+20 103 456 7890", description: "An energetic husky who ensures you are never truly alone.",                               image: "https://loremflickr.com/400/300/siberian+husky?lock=4" },
    { name: "Sokar",  type: "cat",    personality: "general", price:  800, contact: "+20 100 123 4567", description: "A playful, curious cat that brings joy to any household.",                                image: "https://loremflickr.com/400/300/kitten?lock=5" },
    { name: "Coco",   type: "bird",   personality: "sad",     price:  500, contact: "+20 104 567 8901", description: "A cheerful cockatiel whose songs lift mood and reduce feelings of isolation.",             image: "https://loremflickr.com/400/300/cockatiel+bird?lock=6" },
    { name: "Nemo",   type: "fish",   personality: "anxious", price:  350, contact: "+20 105 678 9012", description: "Watching fish swim has been shown to reduce anxiety by 12% in clinical settings.",        image: "https://loremflickr.com/400/300/aquarium+fish?lock=7" },
    { name: "Biscuit",type: "dog",    personality: "stress",  price: 2000, contact: "+20 106 789 0123", description: "A friendly labrador — perfect for outdoor therapy walks and emotional support.",           image: "https://loremflickr.com/400/300/labrador+retriever?lock=8" },
    { name: "Luna",   type: "cat",    personality: "lonely",  price: 1100, contact: "+20 107 890 1234", description: "A sociable British Shorthair who loves cuddles and company.",                              image: "https://loremflickr.com/400/300/british+shorthair+cat?lock=9" },
    { name: "Pip",    type: "hamster",personality: "general", price:  300, contact: "+20 108 901 2345", description: "A tiny bundle of energy — watching Pip explore brings a smile every time.",               image: "https://loremflickr.com/400/300/hamster?lock=10" },
];

// ── Mental Health Store Items ─────────────────────────────────────
// These are "official" items listed by the system (Mindful Store)
const SYSTEM_ID = new mongoose.Types.ObjectId("000000000000000000000001");

const storeItems = [
    // ── Wearables / Tech ──────────────────────────────────────────
    {
        sellerId:    SYSTEM_ID,
        sellerName:  "Mindful Store",
        title:       "Fitbit Sense 2 – Stress & Heart Rate Monitor",
        description: "Advanced smartwatch with EDA (electrodermal activity) sensor to detect stress levels, continuous heart-rate monitoring, SpO2, and built-in guided breathing sessions. Clinically shown to help users identify stress patterns.",
        price:       4500,
        category:    "electronics",
        condition:   "new",
        contact:     "mindfulstore@support.com",
        status:      "available",
        image:       "https://loremflickr.com/400/250/fitbit+smartwatch?lock=11",
    },
    {
        sellerId:    SYSTEM_ID,
        sellerName:  "Mindful Store",
        title:       "Apple Watch SE – Heart Rate & Mental Wellness",
        description: "Tracks heart rate, heart-rate variability (HRV), and sleep quality. Includes Breathe & Mindfulness app for guided exercises. Perfect for those monitoring their stress response throughout the day.",
        price:       7200,
        category:    "electronics",
        condition:   "new",
        contact:     "mindfulstore@support.com",
        status:      "available",
        image:       "https://loremflickr.com/400/250/apple+watch?lock=12",
    },
    {
        sellerId:    SYSTEM_ID,
        sellerName:  "Mindful Store",
        title:       "Muse S Headband – Brain-Sensing Meditation",
        description: "EEG headband that measures brain activity during meditation and provides real-time audio feedback (nature sounds guide you to calm). Proven in studies to improve meditation depth and reduce anxiety within 4 weeks.",
        price:       3800,
        category:    "electronics",
        condition:   "new",
        contact:     "mindfulstore@support.com",
        status:      "available",
        image:       "https://loremflickr.com/400/250/meditation+headband?lock=13",
    },
    {
        sellerId:    SYSTEM_ID,
        sellerName:  "Mindful Store",
        title:       "Apollo Neuro – Wearable Stress Relief Device",
        description: "Wearable that delivers gentle vibrations to calm your nervous system. Clinical trials show a 40% reduction in stress & anxiety and improved HRV. Worn on wrist or ankle.",
        price:       2900,
        category:    "electronics",
        condition:   "new",
        contact:     "mindfulstore@support.com",
        status:      "available",
        image:       "https://loremflickr.com/400/250/wearable+wellness?lock=14",
    },
    // ── Relaxation & Therapy Tools ────────────────────────────────
    {
        sellerId:    SYSTEM_ID,
        sellerName:  "Mindful Store",
        title:       "Weighted Blanket 7kg – Anxiety & Sleep Aid",
        description: "Deep-pressure stimulation blanket that mimics the feeling of a hug. Research shows it reduces cortisol by up to 31% and improves sleep quality in people with anxiety and insomnia (Journal of Sleep Medicine, 2020).",
        price:       850,
        category:    "general",
        condition:   "new",
        contact:     "mindfulstore@support.com",
        status:      "available",
        image:       "https://loremflickr.com/400/250/blanket+cozy?lock=15",
    },
    {
        sellerId:    SYSTEM_ID,
        sellerName:  "Mindful Store",
        title:       "Aromatherapy Diffuser + Lavender Essential Oil Set",
        description: "Ultrasonic diffuser with 7-colour LED light and timer. Includes pure lavender, chamomile, and eucalyptus essential oils. Lavender aromatherapy has been shown to reduce anxiety scores by 45% in pre-operative patients (Phytomedicine Journal).",
        price:       420,
        category:    "general",
        condition:   "new",
        contact:     "mindfulstore@support.com",
        status:      "available",
        image:       "https://loremflickr.com/400/250/aromatherapy+diffuser?lock=16",
    },
    {
        sellerId:    SYSTEM_ID,
        sellerName:  "Mindful Store",
        title:       "Therapy Stress Ball Set – Anxiety & Focus",
        description: "Set of 3 stress balls with different resistance levels. Squeezing activates the parasympathetic nervous system and releases muscle tension. Used in occupational therapy and mindfulness practices.",
        price:       120,
        category:    "toys",
        condition:   "new",
        contact:     "mindfulstore@support.com",
        status:      "available",
        image:       "https://loremflickr.com/400/250/stress+relief+ball?lock=17",
    },
    {
        sellerId:    SYSTEM_ID,
        sellerName:  "Mindful Store",
        title:       "Light Therapy Lamp 10,000 Lux – Seasonal Depression",
        description: "Bright light therapy box that mimics natural sunlight. Recommended by psychiatrists for Seasonal Affective Disorder (SAD) and depression. 20–30 minutes daily use shown to improve mood in 1–2 weeks (APA guidelines).",
        price:       950,
        category:    "general",
        condition:   "new",
        contact:     "mindfulstore@support.com",
        status:      "available",
        image:       "https://loremflickr.com/400/250/light+therapy+lamp?lock=18",
    },
    // ── Books ─────────────────────────────────────────────────────
    {
        sellerId:    SYSTEM_ID,
        sellerName:  "Mindful Store",
        title:       "The Body Keeps the Score – Bessel van der Kolk",
        description: "International bestseller on how trauma affects the body and brain. Explores EMDR, yoga, neurofeedback, and other evidence-based therapies. Essential reading for anyone dealing with trauma, PTSD, or chronic stress.",
        price:       280,
        category:    "books",
        condition:   "new",
        contact:     "mindfulstore@support.com",
        status:      "available",
        image:       "https://loremflickr.com/400/250/psychology+book?lock=19",
    },
    {
        sellerId:    SYSTEM_ID,
        sellerName:  "Mindful Store",
        title:       "Feeling Good: The New Mood Therapy – David Burns",
        description: "The best-selling CBT (Cognitive Behavioural Therapy) self-help book. Clinically proven to reduce depression and anxiety. Contains practical exercises used by therapists worldwide. Over 5 million copies sold.",
        price:       220,
        category:    "books",
        condition:   "new",
        contact:     "mindfulstore@support.com",
        status:      "available",
        image:       "https://loremflickr.com/400/250/self+help+book?lock=20",
    },
    {
        sellerId:    SYSTEM_ID,
        sellerName:  "Mindful Store",
        title:       "The Mindfulness & Acceptance Workbook for Anxiety",
        description: "ACT (Acceptance and Commitment Therapy) workbook with exercises for anxiety. Teaches mindfulness, values clarification, and psychological flexibility. Backed by decades of research at Harvard and Stanford.",
        price:       195,
        category:    "books",
        condition:   "new",
        contact:     "mindfulstore@support.com",
        status:      "available",
        image:       "https://loremflickr.com/400/250/mindfulness+book?lock=21",
    },
    // ── Journaling ────────────────────────────────────────────────
    {
        sellerId:    SYSTEM_ID,
        sellerName:  "Mindful Store",
        title:       "The Five-Minute Journal – Gratitude & Mindfulness",
        description: "Structured daily journal with morning and evening prompts to build gratitude, focus, and positivity habits. Used by thousands of therapists and coaches. Studies show gratitude journaling reduces depression by 28% over 4 weeks.",
        price:       340,
        category:    "books",
        condition:   "new",
        contact:     "mindfulstore@support.com",
        status:      "available",
        image:       "https://loremflickr.com/400/250/journal+notebook+gratitude?lock=22",
    },
    // ── Sleep ─────────────────────────────────────────────────────
    {
        sellerId:    SYSTEM_ID,
        sellerName:  "Mindful Store",
        title:       "Sleep Sound Machine – White Noise & Nature Sounds",
        description: "30 soothing sounds including white noise, rain, ocean waves, and binaural beats. Designed to mask anxiety-inducing thoughts and improve sleep onset. Recommended by CBT-I (Cognitive Behavioural Therapy for Insomnia) practitioners.",
        price:       580,
        category:    "electronics",
        condition:   "new",
        contact:     "mindfulstore@support.com",
        status:      "available",
        image:       "https://loremflickr.com/400/250/white+noise+sleep?lock=23",
    },
    {
        sellerId:    SYSTEM_ID,
        sellerName:  "Mindful Store",
        title:       "Acupressure Mat & Pillow Set – Stress Relief",
        description: "Stimulates pressure points to release endorphins and promote deep relaxation. 20 minutes of daily use shown to reduce cortisol levels, relieve muscle tension, and improve sleep quality. Used in integrative medicine.",
        price:       390,
        category:    "general",
        condition:   "new",
        contact:     "mindfulstore@support.com",
        status:      "available",
        image:       "https://loremflickr.com/400/250/acupressure+yoga+mat?lock=24",
    },
];

const seed = async () => {
    try {
        if (process.env.NODE_ENV === 'production' || process.env.ALLOW_LEGACY_SEED !== 'true')
            throw new Error('Legacy catalog seed is disabled. Use npm run seed:demo for a separate demo database.');
        await connectDB();
        if (await Article.exists({}) || await Pet.exists({}) || await StoreItem.exists({}))
            throw new Error('Refusing to seed a non-empty catalog. Existing data is preserved.');
        await Article.insertMany(articles);
        await Pet.insertMany(pets);
        await StoreItem.insertMany(storeItems);
        console.log(`✅ Seeded ${articles.length} articles, ${pets.length} pets, and ${storeItems.length} store items!`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error.message);
        process.exit(1);
    }
};

seed();
