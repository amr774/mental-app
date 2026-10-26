import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

class PetRecSystem:
    def __init__(self, pets_catalog_file):
        self.model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')

        with open(pets_catalog_file, 'r', encoding='utf-8') as f:
            self.pets_catalog = json.load(f)

        descriptions = []
        for p in self.pets_catalog: 
            full_info = (
                f"{p['pet_name']} is a {p['category']}. "
                f"Description: {p['description']} "
                f"Characteristics: {p.get('Characteristics & Personality', '')}"
            )
            descriptions.append(full_info)
        
        embeddings = self.model.encode(descriptions)
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(np.array(embeddings).astype('float32'))

    def get_pet_recommendation(self, user_history_file):
        try:
            with open(user_history_file, 'r', encoding='utf-8') as f:
                sessions = json.load(f)
            
            extracted_texts = []
            for session in sessions:
                if "summary" in session:
                    extracted_texts.append(session["summary"])
                
                if "user_facts" in session and "interests" in session["user_facts"]:
                    interests = " ".join(session["user_facts"]["interests"])
                    extracted_texts.append(interests)
                
                if "user_facts" in session and "pet_info" in session["user_facts"]:
                    extracted_texts.append(session["user_facts"]["pet_info"])

            user_context = " ".join(extracted_texts)
            
            if not user_context.strip():
                return {"error": "The user log does not contain enough data"}

            query_vector = self.model.encode([user_context]).astype('float32')
            distances, indices = self.index.search(query_vector, k=3)
            
            return self.pets_catalog[indices[0][0]]
            
        except Exception as e:
            return {"error": f"Error processing history: {str(e)}"}