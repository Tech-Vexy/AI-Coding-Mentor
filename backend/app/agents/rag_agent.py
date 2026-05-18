from google_adk.agents import Agent
from google_adk.tools import tool
from pymongo import MongoClient
from google import genai
from .config import agent_settings

# Initialize clients
genai_client = genai.Client(api_key=agent_settings.GEMINI_API_KEY)
db_client = MongoClient(agent_settings.MONGO_URI)
db = db_client["ada_tutor"]
collection = db["curriculum"]

@tool
def query_curriculum(query: str) -> str:
    """
    Searches the MongoDB vector database for curriculum documents matching the user's query.
    Call this tool when the user asks a theoretical question about programming or course materials.
    """
    try:
        # Generate embedding for the query
        response = genai_client.models.embed_content(
            model="text-embedding-004",
            contents=query,
        )
        query_embedding = response.embeddings[0].values

        # Perform vector search in MongoDB
        # Note: This requires a vector search index to be configured in Atlas
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": 10,
                    "limit": 3
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "text": 1,
                    "source": 1,
                    "score": { "$meta": "vectorSearchScore" }
                }
            }
        ]

        results = list(collection.aggregate(pipeline))

        if not results:
            return "No relevant curriculum materials found."

        formatted_results = "Found the following course materials:\n\n"
        for res in results:
            formatted_results += f"[Source: {res.get('source')}]\n{res.get('text')}\n\n"

        return formatted_results

    except Exception as e:
        return f"Error retrieving curriculum: {str(e)}"

# Define the RAG Agent
rag_agent = Agent(
    name="Curriculum RAG Agent",
    instructions=(
        "You are the Ada Tutor Curriculum Agent. "
        "Your job is to answer the student's questions by querying the course materials. "
        "Always use the `query_curriculum` tool to find accurate information. "
        "Synthesize the retrieved information clearly and concisely using the Socratic method."
    ),
    model=agent_settings.MODEL_NAME,
    tools=[query_curriculum]
)
