import os
from flask import Flask, render_template, request, jsonify
from data_fetcher import OandaDataFetcher
from ai_client import AIClient
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OandaDataFetcher with API key
OANDA_API_KEY = os.getenv('OANDA_API_KEY')
if not OANDA_API_KEY:
   raise ValueError("OANDA_API_KEY is not set in environment variables.")
data_fetcher = OandaDataFetcher(api_key=OANDA_API_KEY)

# Initialize AI client with API key
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
   raise ValueError("OPENAI_API_KEY is not set in environment variables.")
ai_client = AIClient(api_key=OPENAI_API_KEY)

@app.route('/')
def index():
   return render_template('index.html')

@app.route('/api/candlestick_data')
def candlestick_data():
   symbol = request.args.get('symbol', 'EUR_USD')
   timeframe = request.args.get('timeframe', 'H1')
   count = int(request.args.get('count', 1000))
   try:
       data = data_fetcher.fetch_candlestick_data(instrument=symbol, granularity=timeframe, count=count)
       return jsonify(data)
   except Exception as e:
       logger.error(f"Error fetching candlestick data: {e}")
       return jsonify({'error': str(e)}), 500

@app.route('/api/price_data')
def price_data():
   symbol = request.args.get('symbol', 'EUR_USD')
   try:
       data = data_fetcher.fetch_price_data(symbol)
       return jsonify(data)
   except Exception as e:
       logger.error(f"Error fetching price data: {e}")
       return jsonify({'error': str(e)}), 500

@app.route('/api/search_instruments')
def search_instruments():
   query = request.args.get('query', '').upper()
   category = request.args.get('category', 'all')
   try:
       instruments = data_fetcher.search_instruments(query, category)
       return jsonify(instruments)
   except Exception as e:
       logger.error(f"Error searching instruments: {e}")
       return jsonify({'error': str(e)}), 500

@app.route('/api/ai_chat', methods=['POST'])
def ai_chat():
   data = request.get_json()
   user_input = data.get('message', '')
   chart_context = data.get('chartContext', {})
   if not user_input:
       return jsonify({'error': 'No message provided'}), 400
   try:
       ai_response = ai_client.generate_response(prompt=user_input, chart_context=chart_context)
       return jsonify({'response': ai_response})
   except Exception as e:
       logger.error(f"Error generating AI response: {e}")
       return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
   app.run(debug=True)
