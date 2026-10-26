import os
import json
from dotenv import load_dotenv

import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

import google.generativeai as genai
from transformers import pipeline
from datetime import datetime
from RAG import KnowledgeBase
from ArticlesRec import RecSystem
from PetsRec import PetRecSystem

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") 
genai.configure(api_key=GOOGLE_API_KEY)


# Emotion Detection 
emotion_classifier = pipeline(
    "sentiment-analysis", 
    model="./models_weight/sentiment_model", 
    tokenizer="./models_weight/sentiment_model",
    use_fast=False
)

# Loading Files
kb_system = KnowledgeBase("./models_weight/rag_model")


# System Instruction
system_instruction = """
You are "WithUBot", a highly empathetic digital companion.

1. PERSONALITY & TONE:
    - Act as a calm, supportive, and listening friend. Use your emotional intelligence to absorb the user's anger or sadness.
    - Balance empathy (60%) with practical conversation (40%). 
    - Keep responses brief and meaningful (2-4 sentences max). Avoid overly dramatic phrases.
    - If the user write an empty message, ask about the day and feeling.

2. CONVERSATIONAL RULES:
    - LANGUAGE: Always strictly mirror the user's dialect (English, Arabic "Egyptian", French,...), NEVER switch languages unless the user does so first.
    - Casual Chat: If the user is talking about hobbies, food, or daily life, DO NOT mention mental health articles. Just chat normally.
    - PETS: Warmly suggest spending time with a pet ONLY if the user is lonely or stressed. Do not force this suggestion.
    - NO REPETITION: Do not repeat "I am here to listen" or "I feel you" in every message, Just replay normally.

3. SAFETY & MEDICAL (CRITICAL):
    - NO DIAGNOSIS: Strictly prohibited to provide medical diagnoses or prescribe medications.
    - SELF-HARM & CRISIS: Provide the Egypt hotline (16328) ONLY if the user explicitly mentions self-harm, suicide, or wanting to end their life. 
    - DO NOT provide the hotline for general sadness, grief, or daily stress. In those cases, just be supportive.

4. RECOMMENDATIONS & RAG:
    - ARTICLES: If [recommendation_info] is provided, you MUST mention the 'Article Name' and 'Summary' clearly. Don't just give general advice; give the specific resource provided.   
    - Do not mention "Mayo Clinc" just say the article name.
    - INTEGRATION: Use the [KNOWLEDGE CONTEXT] as your primary source. Weave suggestions naturally (e.g., "I read something that might help...").
    - Seamless Integration: Don't say "I read an article." Instead, say "I was reading something that might help..." only when appropriate.

5. OUTPUT CONTROL:
    - Ensure every response is a complete thought. Do not stop mid-sentence.
"""

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]

generation_config = {
    "temperature": 0.5,
    "top_p": 0.8,
    "top_k": 40,
    "max_output_tokens": 800,
}

model = genai.GenerativeModel(
    model_name="gemini-3.1-flash-lite-preview",
    system_instruction=system_instruction,
    safety_settings=safety_settings,
    generation_config=generation_config
)

chat_history=[]
rec_engine = RecSystem("catalog.json", model_path="./models_weight/rag_model")

def get_chatbot_response(user_text, past_history_data=None):
    global chat_history
    
    emotion_result = emotion_classifier(user_text)[0]
    detected_emotion = emotion_result['label']
    track_mood(detected_emotion)

    # RAG
    context = kb_system.get_relevant_context(user_text)

    # Current Chat Context
    current_chat_context = ""
    for msg in chat_history[-6:]:
        role = "Friend" if msg["role"] == "user" else "WithUBot"
        current_chat_context += f"{role}: {msg['content']}\n"

    # Get User History
    cumulative_context = ""
    if past_history_data:
        cumulative_context = f"\n[PAST MEMORY]: {past_history_data}\n"


    search_query_generation = model.generate_content(
        f"Based on this chat history: {current_chat_context[-1000:]}, "
        f"and the user's latest message: '{user_text}', "
        f"extract the main psychological topic."
        f"Respond only with the keywords"
    )
    refined_search_query = search_query_generation.text.strip()


    recommended_item = rec_engine.get_recommendation(refined_search_query, detected_emotion)
    recommendation_info = ""
    if recommended_item:
        recommendation_info = f"\n[RECOMMENDED]: {recommended_item['name']}: {recommended_item['description']}\n"

    # Full Prompt
    full_prompt = f"""
    [STRICT RULE]: Respond ONLY in the language used by the user in the 'USER MESSAGE' section.
    {cumulative_context}
    [CURRENT CONTEXT]: {current_chat_context}
    [KNOWLEDGE]: {context}
    [USER MOOD]: {detected_emotion}
    {recommendation_info}

    USER MESSAGE: {user_text}
    """

    response = model.generate_content(full_prompt)
    reply = response.text
    
    chat_history.append({"role": "user", "content": user_text})
    chat_history.append({"role": "assistant", "content": reply})
    
    if len(chat_history) > 20:
        chat_history = chat_history[-20:]

    return reply, detected_emotion

# Mood Tracking 
def track_mood(emotion):
    log_entry = {
    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "emotion": emotion
    }
    with open("mood_history.json", "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry) + "\n")

# Mood History (when session ended)
def get_last_mood_summary(limit=5):
    try:
        import json
        with open("mood_history.json", "r", encoding="utf-8") as f:
            lines = f.readlines()
            last_moods = [json.loads(line)['emotion'] for line in lines[-limit:]]
            if last_moods:
                return f"Note: In the last few sessions, the user's emotions were: {', '.join(last_moods)}."
    except (FileNotFoundError, json.JSONDecodeError):
        return ""
    return ""

# Extract User Data
def generate_session_summary(history_list):
    formatted_history = "\n".join([f"{m['role']}: {m['content'][:200]}" for m in history_list[-10:]])

    summary_prompt = f"""
    Return ONLY a JSON object. No explanation before or after.
    Format:
    {{
      "session_date": "{datetime.now().strftime('%Y-%m-%d')}",
      "summary": ""،
      "dominant_mood": "",
      "user_facts": {{ "has_pets": false, "pet_info": "", "interests": [] }}
    }}
    Conversation:
    {formatted_history}
    """
    try:
        response = model.generate_content(summary_prompt)         
        return json.loads(response.text.replace('```json', '').replace('```', ''))
    except Exception as e:
        print(f"Summary Error: {e}")
        return None

if __name__ == "__main__":
    all_past_sessions = []
    memory_context = ""
    try:
        with open("user_history_log.json", "r", encoding="utf-8") as f:
            all_past_sessions = json.load(f)
            last_three = all_past_sessions[-3:] 
            if last_three:
                memory_context = "Summary of our most recent meetings:\n"
                for session in last_three:
                    memory_context += f"- Date {session['session_date']}: {session['summary']} (Mood: {session['dominant_mood']})\n"
            else:
                memory_context = "No prior history."
    except (FileNotFoundError, json.JSONDecodeError):
        memory_context = "First time user."

    print("WithUBot is ready! (Type 'exit' to stop)")

    while True:
        user_input = input("You: ")
        if user_input.lower() == "exit":
            new_session_data = generate_session_summary(chat_history)
            if new_session_data:
                all_past_sessions.append(new_session_data)
                with open("user_history_log.json", "w", encoding="utf-8") as f:
                    json.dump(all_past_sessions, f, indent=4, ensure_ascii=False)
            break

        reply, mood = get_chatbot_response(user_input, past_history_data=memory_context)
        print(f"\nWithUBot: {reply}\n")