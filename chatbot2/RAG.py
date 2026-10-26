import os
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

class KnowledgeBase:
    def __init__(self, folder_path, model_path="./models_weight/rag_model", chunk_size=500, overlap=50):
        self.model = SentenceTransformer(model_path)
        self.folder_path = folder_path
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.model = SentenceTransformer(model_path)
        self.index_file = "kb_index.faiss"
        self.chunks_file = "chunks.json"
        self.chunks = []
        self.index = None
        self.load_knowledge()


    # Chunking
    def chunk_text(self, text):
        words = text.split()
        chunks = []
        for i in range(0, len(words), self.chunk_size - self.overlap):
            chunk = " ".join(words[i:i + self.chunk_size])
            if len(chunk.strip()) > 50: # Ignore small chunks
                chunks.append(chunk)
        return chunks

    def load_knowledge(self):
        if os.path.exists(self.index_file) and os.path.exists(self.chunks_file):
            self.index = faiss.read_index(self.index_file)
            with open(self.chunks_file, 'r', encoding='utf-8') as f:
                self.chunks = json.load(f)
            return
        
        # If chunks did not exist
        all_text = ""
        for filename in os.listdir(self.folder_path):
            file_path = os.path.join(self.folder_path, filename)
            with open(file_path, "r", encoding="utf-8") as f:
                all_text += f.read() + "\n"


        self.chunks = self.chunk_text(all_text)
        
        # Embeddings
        embeddings = self.model.encode(self.chunks, convert_to_numpy=True)
        dim = embeddings.shape[1]
        faiss.normalize_L2(embeddings)
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(embeddings.astype('float32')) # Create faiss index

        # Save index
        faiss.write_index(self.index, self.index_file)
        with open(self.chunks_file, 'w', encoding='utf-8') as f:
            json.dump(self.chunks, f)


    def get_relevant_context(self, query, k=3, threshold=0.5): 
        query_embedding = self.model.encode([query], convert_to_numpy=True)
        faiss.normalize_L2(query_embedding)
        distances, indices = self.index.search(query_embedding.astype('float32'), k)
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx != -1 and dist > threshold: 
                results.append(self.chunks[idx])
        
        return "\n\n".join(results) if results else ""