# test_settings.py
from app.core.config import settings

print("GROQ_API_KEY:", settings.GROQ_API_KEY)
print("MODEL_NAME:", settings.MODEL_NAME)
print("SERPAPI_API_KEY:", settings.SERPAPI_API_KEY)