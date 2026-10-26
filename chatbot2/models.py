from sentence_transformers import SentenceTransformer
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline

model_id = "cardiffnlp/twitter-xlm-roberta-base-sentiment"

model = AutoModelForSequenceClassification.from_pretrained(model_id)
tokenizer = AutoTokenizer.from_pretrained(model_id)

save_path = "./models_weight/sentiment_model"
model.save_pretrained(save_path)
tokenizer.save_pretrained(save_path)

print(f"Model and Tokenizer saved successfully in {save_path}")

rag_model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
rag_model.save("./models_weight/rag_model")