import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/nyx_db")
SECRET_KEY = os.getenv("SECRET_KEY", "generate_a_secure_random_key_for_production")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "test-key-or-mock")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

