from google_adk.agents import Agent
from .config import agent_settings
from .rag_agent import rag_agent
from .sandbox_agent import sandbox_agent

# The Root Router Agent delegates tasks to the sub-agents
root_router_agent = Agent(
    name="Ada Root Router Agent",
    instructions=(
        "You are Ada, the master AI tutor orchestrator. "
        "You receive requests from the student. You MUST decide which sub-agent is best equipped to handle the request "
        "and delegate to them.\n"
        "- If the student asks a conceptual question about programming or course material, delegate to the 'Curriculum RAG Agent'.\n"
        "- If the student asks you to check, run, or debug their code, delegate to the 'Sandbox Code Analyst Agent'.\n"
        "- If it is a general greeting or casual chat, you can answer directly using a friendly, encouraging tutor persona."
    ),
    model=agent_settings.MODEL_NAME,
    tools=[rag_agent, sandbox_agent] # ADK allows agents to act as tools for routing
)
