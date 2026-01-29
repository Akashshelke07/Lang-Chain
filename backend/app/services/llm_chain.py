# backend/app/services/llm_chain.py
from typing import Dict, List, Optional

from langchain_groq import ChatGroq
from langchain import hub
from langchain.agents import AgentExecutor, create_react_agent
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_community.tools.wikipedia.tool import WikipediaQueryRun
from langchain_community.utilities import SerpAPIWrapper
from langchain_experimental.tools.python.tool import PythonREPLTool
from app.core.config import settings

# LLM setup
llm = ChatGroq(
    model=settings.MODEL_NAME,
    temperature=0.75,
    max_tokens=1200,
    api_key=settings.GROQ_API_KEY,
)

# Tools
wikipedia = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper(top_k_results=3))

# SerpAPI is optional — only add if key exists
search: Optional[SerpAPIWrapper] = None
if settings.SERPAPI_API_KEY:
    search = SerpAPIWrapper(serpapi_api_key=settings.SERPAPI_API_KEY)

python_repl = PythonREPLTool()

tools = [wikipedia, python_repl]
if search:
    tools.append(search)

# ReAct prompt from LangChain hub
react_prompt = hub.pull("hwchase17/react")

# Create the ReAct agent
agent = create_react_agent(
    llm=llm,
    tools=tools,
    prompt=react_prompt,
)

# Agent executor
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,                     # Logs reasoning steps in terminal
    handle_parsing_errors=True,
    max_iterations=15,
    return_intermediate_steps=True,   # Useful for debugging
)

# In-memory chat history store (session_id → list of messages)
chat_histories: Dict[str, List[Dict[str, str]]] = {}

def get_chat_history(session_id: str) -> List[Dict[str, str]]:
    if session_id not in chat_histories:
        chat_histories[session_id] = []
    return chat_histories[session_id]

def chat_with_agent(
    message: str,
    session_id: str = "default"
) -> str:
    history = get_chat_history(session_id)
    # Format history for ReAct prompt (simple string concatenation)
    history_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history])

    try:
        # Run the agent
        result = agent_executor.invoke({
            "input": message,
            "chat_history": history_str,
        })

        output = result["output"]

        # Save to history
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": output})

        return output

    except Exception as e:
        return f"Agent execution failed: {str(e)}"