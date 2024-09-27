from flask import Blueprint, request, jsonify
import os
import json
from src.data.data_fetcher import OandaDataFetcher
from src.ai.ai_client import AIClient

api_bp = Blueprint('api', __name__)

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

@api_bp.route('/candlestick_data')
def candlestick_data():
    symbol = request.args.get('symbol', 'EUR_USD')
    timeframe = request.args.get('timeframe', 'H1')
    count = int(request.args.get('count', 1000))
    try:
        data = data_fetcher.fetch_candlestick_data(instrument=symbol, granularity=timeframe, count=count)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/price_data')
def price_data():
    symbol = request.args.get('symbol', 'EUR_USD')
    try:
        data = data_fetcher.fetch_price_data(symbol)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/search_instruments')
def search_instruments():
    query = request.args.get('query', '').upper()
    category = request.args.get('category', 'all')
    try:
        instruments = data_fetcher.search_instruments(query, category)
        return jsonify(instruments)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/ai_chat', methods=['POST'])
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
        return jsonify({'error': str(e)}), 500

@api_bp.route('/indicators')
def get_indicators():
    # Load indicators from a JSON file
    with open('indicators.json', 'r') as f:
        indicators = json.load(f)
    return jsonify(indicators)

@api_bp.route('/indicators/favorite', methods=['POST'])
def favorite_indicator():
    data = request.get_json()
    indicator_id = data.get('id')
    is_favorite = data.get('isFavorite')
    
    # Load current indicators
    with open('indicators.json', 'r') as f:
        indicators = json.load(f)
    
    # Update the favorite status
    for indicator in indicators:
        if indicator['id'] == indicator_id:
            indicator['isFavorite'] = is_favorite
            break
    
    # Save updated indicators
    with open('indicators.json', 'w') as f:
        json.dump(indicators, f)
    
    return jsonify({'success': True})
