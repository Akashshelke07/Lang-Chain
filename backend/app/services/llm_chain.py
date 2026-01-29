# backend/app/services/llm_chain.py
from typing import Dict, List

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.utilities import SerpAPIWrapper

from app.core.config import settings

# LLM setup - low temperature for better reasoning
llm = ChatGroq(
    model=settings.MODEL_NAME,
    temperature=0.3,
    max_tokens=1500,
    api_key=settings.GROQ_API_KEY,
)

# Google Search tool (SerpAPI)
search = SerpAPIWrapper(serpapi_api_key=settings.SERPAPI_API_KEY)

# System prompt for a high-capability assistant
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a highly capable AI assistant with strong problem-solving abilities.
You excel at:
- Complex reasoning and logical analysis
- Mathematical calculations and problem-solving
- Coding and technical explanations
- Research and information synthesis
- Creative problem-solving

You have access to web search for current information, facts, news, statistics, and verification.
Always think step-by-step for complex problems and provide clear, well-reasoned answers."""),
    ("human", "{input}")
])

# Create a simple chain
chain = prompt | llm

# In-memory chat history
chat_histories: Dict[str, List[Dict[str, str]]] = {}

def get_chat_history(session_id: str) -> List[Dict[str, str]]:
    if session_id not in chat_histories:
        chat_histories[session_id] = []
    return chat_histories[session_id]

def chat_with_agent(message: str, session_id: str = "default") -> str:
    history = get_chat_history(session_id)
    
    try:
        # Build context with history
        context = ""
        if history:
            context = "Previous conversation:\n"
            for msg in history[-5:]:  # Last 5 messages for context
                context += f"{msg['role']}: {msg['content']}\n"
            context += "\n"
        
        full_input = context + message
        
        # Check if we need to search
        # Simple heuristic: if message asks about current/recent info
        search_keywords = ["current", "latest", "recent", "today", "now", "price", "news", "weather", "2024", "2025"]
        should_search = any(keyword in message.lower() for keyword in search_keywords)
        
        if should_search:
            try:
                search_result = search.run(message)
                full_input += f"\n\nSearch results: {search_result}"
            except Exception as e:
                print(f"Search error: {e}")
        
        # Get response from LLM
        response = chain.invoke({"input": full_input})
        output = response.content
        
        # Save to history
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": output})
        
        return output
        
    except Exception as e:
        return f"Error: {str(e)}"