import os
import re
from pymongo import MongoClient
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not set. Embedding generation will fail.")

client = genai.Client(api_key=GEMINI_API_KEY)
db_client = MongoClient(MONGO_URI)
db = db_client["ada_tutor"]
collection = db["curriculum"]

def chunk_markdown(text, max_length=1000):
    """
    A simple custom chunker that splits markdown by headers or double newlines,
    ensuring chunks don't exceed max_length.
    """
    chunks = []
    # Split roughly by paragraphs or headers
    raw_chunks = re.split(r'\n(?=#)|\n\n+', text)

    current_chunk = ""
    for raw in raw_chunks:
        raw = raw.strip()
        if not raw:
            continue

        if len(current_chunk) + len(raw) < max_length:
             current_chunk += "\n\n" + raw if current_chunk else raw
        else:
             if current_chunk:
                 chunks.append(current_chunk.strip())
             current_chunk = raw

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks

def generate_embedding(text):
    """Generates an embedding vector using Gemini."""
    try:
        response = client.models.embed_content(
            model="text-embedding-004",
            contents=text,
        )
        return response.embeddings[0].values
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None

def ingest_file(filepath):
    print(f"Ingesting {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    chunks = chunk_markdown(content)
    print(f"Generated {len(chunks)} chunks.")

    documents = []
    for i, chunk in enumerate(chunks):
        print(f"Embedding chunk {i+1}/{len(chunks)}...")
        embedding = generate_embedding(chunk)
        if embedding:
            documents.append({
                "source": os.path.basename(filepath),
                "chunk_index": i,
                "text": chunk,
                "embedding": embedding
            })

    if documents:
        # In a production app, you might want to use update_one with upsert
        # or clear existing docs for this source to avoid duplicates
        collection.delete_many({"source": os.path.basename(filepath)})
        collection.insert_many(documents)
        print(f"Successfully inserted {len(documents)} document chunks into MongoDB.")
    else:
        print("No documents were inserted.")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sample_file = os.path.join(script_dir, "sample.md")
    if os.path.exists(sample_file):
        ingest_file(sample_file)
    else:
        print(f"Sample file not found at {sample_file}")
