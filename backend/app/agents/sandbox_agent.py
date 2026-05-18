from google_adk.agents import Agent
from google_adk.tools import tool
from .config import agent_settings

@tool
def lint_code(code: str, language: str) -> str:
    """
    Analyzes code for syntax errors and style issues.
    Call this tool when the user asks you to review or check their code.
    """
    # Mock implementation
    if "console.log" not in code and language.lower() in ["js", "javascript"]:
         return "Linting result: Missing a console log statement. Otherwise looks okay."
    elif language.lower() in ["js", "javascript"]:
         return "Linting result: 0 errors, 0 warnings. Code is clean."
    return "Linting result: Unable to determine language context."

@tool
def execute_code(code: str, language: str) -> str:
    """
    Executes the user's code in a secure sandbox.
    Call this tool to see the output of the student's code.
    """
    # Mock implementation
    if language.lower() in ["js", "javascript"]:
        return "Execution Output: Hello from Ada's mock sandbox!"
    return f"Execution Output: Mock execution completed for {language}."

# Define the Sandbox Agent
sandbox_agent = Agent(
    name="Sandbox Code Analyst Agent",
    instructions=(
        "You are the Ada Tutor Sandbox Agent. "
        "Your job is to analyze, lint, and run the student's code. "
        "Use the `lint_code` tool to check for errors, and the `execute_code` tool to run it. "
        "Explain the results to the student clearly, guiding them to fix errors themselves."
    ),
    model=agent_settings.MODEL_NAME,
    tools=[lint_code, execute_code]
)
