import json
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import random
from sklearn.metrics.pairwise import cosine_similarity

class RecSystem:
    def __init__(self, catalog_path, model_path="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"):
        self.catalog_path = catalog_path
        self.model = SentenceTransformer(model_path)
        self.suggested_ids = set()

        with open(catalog_path, 'r', encoding='utf-8') as f:
            self.catalog = json.load(f)
        
        descriptions = [item['description'] for item in self.catalog]
        embeddings = self.model.encode(descriptions)

        embeddings = np.array(embeddings).astype('float32')
        faiss.normalize_L2(embeddings)

        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(embeddings)
        
    
    def get_recommendation(self, refined_query, emotion):

        search_query = f"{refined_query} {emotion}"  
        query_vector = self.model.encode([search_query]).astype('float32')      
        faiss.normalize_L2(query_vector)

        distances, indices = self.index.search(query_vector, k=15)
        
        best_matches = [idx for idx in indices[0] if idx != -1]

        fresh_matches = [idx for idx in best_matches if idx not in self.suggested_ids]

        if not fresh_matches: return None

        chosen_idx = random.choice(fresh_matches[:5])
        self.suggested_ids.add(chosen_idx)
        
        return self.catalog[chosen_idx]