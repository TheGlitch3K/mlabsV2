import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Flask settings
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')

# API keys
OANDA_API_KEY = os.getenv('OANDA_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Other settings
CANDLESTICK_DATA_COUNT = 1000
DEFAULT_SYMBOL = 'EUR_USD'
DEFAULT_TIMEFRAME = 'H1'
