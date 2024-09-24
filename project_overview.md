# Project Code Overview

Generated on: Tue Sep 24 07:14:44 CDT 2024

## Table of Contents

- [./ai_client.py](#file---ai-client-py)
- [./data_fetcher.py](#file---data-fetcher-py)
- [./main.py](#file---main-py)
- [./requirements.txt](#file---requirements-txt)
- [./static/css/styles.css](#file---static-css-styles-css)
- [./static/js/app.js](#file---static-js-app-js)
- [./static/js/chart.js](#file---static-js-chart-js)
- [./t.md](#file---t-md)
- [./templates/index.html](#file---templates-index-html)

## File: ./ai_client.py {#file---ai-client-py}

```python
import openai
import logging

logger = logging.getLogger(__name__)

class AIClient:
   def __init__(self, api_key):
       openai.api_key = api_key
       self.system_prompt = (
           "You are an AI assistant specializing in forex trading analysis and strategy.\n"
           "Provide concise, informative responses to trading-related queries.\n"
           "Offer insights on market trends, technical analysis, and risk management,\n"
           "but avoid giving specific financial advice. Always remind users to do their own research\n"
           "and consult with licensed financial advisors for personalized advice.\n"
           "When provided with chart context, use this information to give more accurate and relevant responses.\n"
           "Consider the current symbol, timeframe, price, and active indicators when formulating your answers."
       )

   def generate_response(self, prompt, chart_context=None):
       try:
           messages = [
               {"role": "system", "content": self.system_prompt}
           ]
           if chart_context:
               context_message = (
                   f"Chart Context:\n"
                   f"Symbol: {chart_context.get('symbol', 'N/A')}\n"
                   f"Timeframe: {chart_context.get('timeframe', 'N/A')}\n"
                   f"Price: {chart_context.get('price', 'N/A')}\n"
                   f"Indicators: {', '.join(chart_context.get('indicators', [])) if chart_context.get('indicators') else 'None'}"
               )
               messages.append({"role": "user", "content": context_message})
           messages.append({"role": "user", "content": prompt})

           response = openai.ChatCompletion.create(
               model="gpt-3.5-turbo",
               messages=messages,
               max_tokens=150,
               n=1,
               stop=None,
               temperature=0.7,
           )
           message = response.choices[0].message['content'].strip()
           logger.info(f"AI response generated successfully")
           return message
       except Exception as e:
           logger.error(f"Error generating AI response: {str(e)}")
           raise Exception(f"Error generating AI response: {str(e)}")
```

## File: ./data_fetcher.py {#file---data-fetcher-py}

```python
import requests
import pandas as pd
import logging
import traceback
import threading
import time

logger = logging.getLogger(__name__)

class OandaDataFetcher:
   def __init__(self, api_key):
       self.base_url = "https://api-fxtrade.oanda.com/v3"
       self.api_key = api_key
       if not self.api_key:
           raise ValueError("OANDA API key is not provided. Please provide a valid API key.")
       self.headers = {
           "Authorization": f"Bearer {self.api_key}",
           "Content-Type": "application/json"
       }
       self.cache = {}
       self.cache_lock = threading.Lock()
       self.instruments = self._fetch_instruments()
       logger.info("OandaDataFetcher initialized.")

   def _fetch_instruments(self):
       endpoint = f"{self.base_url}/accounts"
       response = requests.get(endpoint, headers=self.headers)
       response.raise_for_status()
       account_id = response.json()['accounts'][0]['id']
      
       endpoint = f"{self.base_url}/accounts/{account_id}/instruments"
       response = requests.get(endpoint, headers=self.headers)
       response.raise_for_status()
       return {inst['name']: inst for inst in response.json()['instruments']}

   def fetch_candlestick_data(self, instrument, granularity, count=1000):
       cache_key = f"{instrument}_{granularity}_{count}"
       with self.cache_lock:
           if cache_key in self.cache:
               logger.info(f"Returning cached data for {cache_key}")
               return self.cache[cache_key]

       endpoint = f"{self.base_url}/instruments/{instrument}/candles"
       params = {
           "count": count,
           "granularity": granularity,
           "price": "M"
       }
       try:
           logger.info(f"Fetching candlestick data for {instrument} with granularity {granularity}")
           response = requests.get(endpoint, headers=self.headers, params=params, timeout=10)
           response.raise_for_status()
           data = response.json()
           candles = data['candles']
           df = pd.DataFrame(candles)
           df['time'] = pd.to_datetime(df['time'])
           df['open'] = df['mid'].apply(lambda x: float(x['o']))
           df['high'] = df['mid'].apply(lambda x: float(x['h']))
           df['low'] = df['mid'].apply(lambda x: float(x['l']))
           df['close'] = df['mid'].apply(lambda x: float(x['c']))
           df = df[['time', 'open', 'high', 'low', 'close', 'volume']]
           result = df.to_dict(orient='records')

           with self.cache_lock:
               self.cache[cache_key] = result

           logger.info(f"Successfully processed {len(df)} candlesticks")
           return result
       except requests.exceptions.HTTPError as e:
           logger.error(f"HTTP Error: {e}")
           logger.error(f"Response: {e.response.text}")
           if e.response.status_code == 401:
               raise ValueError("Invalid OANDA API key. Please check your credentials.")
           else:
               raise
       except Exception as e:
           logger.error(f"An error occurred: {e}")
           logger.error(f"Stack trace: {traceback.format_exc()}")
           raise

   def fetch_price_data(self, instrument):
       endpoint = f"{self.base_url}/instruments/{instrument}/candles"
       params = {
           "count": 2,
           "granularity": "M1",
           "price": "M"
       }
       try:
           logger.info(f"Fetching price data for {instrument}")
           response = requests.get(endpoint, headers=self.headers, params=params, timeout=5)
           response.raise_for_status()
           data = response.json()
           candles = data['candles']
           if len(candles) < 2:
               raise Exception("Not enough data to calculate price change.")
           latest = candles[-1]['mid']
           previous = candles[-2]['mid']
           latest_close = float(latest['c'])
           previous_close = float(previous['c'])
           price_change = ((latest_close - previous_close) / previous_close) * 100
           return {'price': latest_close, 'change': price_change}
       except Exception as e:
           logger.error(f"Error fetching price data: {e}")
           raise

   def search_instruments(self, query, category='all'):
       results = []
       for name, instrument in self.instruments.items():
           if query in name:
               if category == 'all' or category.lower() in instrument['type'].lower():
                   results.append(name)
       return results

   def clear_cache(self):
       with self.cache_lock:
           self.cache.clear()
```

## File: ./main.py {#file---main-py}

```python
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
```

## File: ./requirements.txt {#file---requirements-txt}

```plaintext
Flask==2.3.2
Werkzeug==2.3.6
pandas==1.3.3
requests==2.26.0
python-dotenv==0.19.0
openai==0.27.0
```

## File: ./static/css/styles.css {#file---static-css-styles-css}

```css
:root {
   --bg-color: #131722;
   --text-color: #d1d4dc;
   --border-color: #2a2e39;
   --panel-bg: #1e222d;
   --button-bg: #2962ff;
   --button-text: white;
   --chart-bg: #131722;
   --hover-color: #364156;
   --ai-chat-bg: #1a1e2e;
}

.light-theme {
   --bg-color: #ffffff;
   --text-color: #131722;
   --border-color: #e0e3eb;
   --panel-bg: #f0f3fa;
   --button-bg: #2962ff;
   --button-text: white;
   --chart-bg: #ffffff;
   --hover-color: #e6e9f0;
   --ai-chat-bg: #f5f5f5;
}

body {
   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
   margin: 0;
   padding: 0;
   background-color: var(--bg-color);
   color: var(--text-color);
   transition: background-color 0.3s, color 0.3s;
}

#app {
   display: flex;
   flex-direction: column;
   height: 100vh;
}

header {
   background-color: var(--panel-bg);
   padding: 10px 20px;
   display: flex;
   justify-content: space-between;
   align-items: center;
   box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

main {
   display: flex;
   flex: 1;
   overflow: hidden;
}

#sidebar {
   width: 250px;
   background-color: var(--panel-bg);
   transition: width 0.3s ease;
   overflow-y: auto;
}

#sidebar.collapsed {
   width: 50px;
}

.tool-category {
   padding: 10px;
}

.tool-grid {
   display: grid;
   grid-template-columns: repeat(4, 1fr);
   gap: 5px;
}

.tool-button {
   background-color: var(--button-bg);
   color: var(--button-text);
   border: none;
   padding: 10px;
   cursor: pointer;
   transition: background-color 0.2s;
}

.tool-button:hover {
   background-color: var(--hover-color);
}

#chart-container {
   flex: 1;
   padding: 20px;
   background-color: var(--chart-bg);
}

#timeframe-selector {
   display: flex;
   overflow-x: auto;
   margin-bottom: 10px;
}

.timeframe-btn {
   background-color: var(--panel-bg);
   color: var(--text-color);
   border: 1px solid var(--border-color);
   padding: 5px 10px;
   margin-right: 5px;
   cursor: pointer;
   transition: background-color 0.2s;
}

.timeframe-btn[selected] {
   background-color: var(--button-bg);
   color: var(--button-text);
}

#candlestick-chart {
   height: calc(100% - 50px);
   width: 100%;
}

.panel {
   width: 300px;
   background-color: var(--panel-bg);
   border-left: 1px solid var(--border-color);
   transition: width 0.3s ease;
}

#watchlist-panel {
   display: flex;
   flex-direction: column;
}

#watchlist-panel h3 {
   padding: 10px;
   margin: 0;
   display: flex;
   justify-content: space-between;
   align-items: center;
}

#watchlist-search-container {
   position: relative;
   margin: 10px;
}

#watchlist-search {
   width: 100%;
   padding: 5px;
   background-color: var(--bg-color);
   color: var(--text-color);
   border: 1px solid var(--border-color);
}

#instrument-category-dropdown {
   position: relative;
   display: inline-block;
   width: 100%;
   margin-top: 5px;
}

#instrument-category-button {
   width: 100%;
   padding: 5px;
   background-color: var(--panel-bg);
   color: var(--text-color);
   border: 1px solid var(--border-color);
   cursor: pointer;
}

#instrument-category-content {
   display: none;
   position: absolute;
   background-color: var(--panel-bg);
   min-width: 160px;
   box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
   z-index: 1;
   width: 100%;
}

#instrument-category-content a {
   color: var(--text-color);
   padding: 12px 16px;
   text-decoration: none;
   display: block;
}

#instrument-category-content a:hover {
   background-color: var(--hover-color);
}

.show {
   display: block !important;
}

#search-results {
   position: absolute;
   top: 100%;
   left: 0;
   right: 0;
   background-color: var(--panel-bg);
   border: 1px solid var(--border-color);
   border-top: none;
   max-height: 200px;
   overflow-y: auto;
   z-index: 1000;
}

.search-result-item {
   padding: 5px 10px;
   cursor: pointer;
   display: flex;
   justify-content: space-between;
   align-items: center;
}

.search-result-item:hover {
   background-color: var(--hover-color);
}

.search-result-item .add-btn {
   background: none;
   border: none;
   color: var(--text-color);
   cursor: pointer;
   font-size: 1.2em;
   padding: 0 5px;
}

#watchlist-container {
   flex: 1;
   overflow-y: auto;
   padding: 10px;
}

.watchlist-item {
   padding: 5px 0;
   border-bottom: 1px solid var(--border-color);
   cursor: pointer;
   transition: background-color 0.2s;
   display: flex;
   justify-content: space-between;
   align-items: center;
}

.watchlist-item:hover {
   background-color: var(--hover-color);
}

.watchlist-item .remove-btn {
   background: none;
   border: none;
   color: var(--text-color);
   cursor: pointer;
   font-size: 1.2em;
   padding: 0 5px;
}

#ai-chat-icon {
   position: fixed;
   bottom: 20px;
   right: 20px;
   background-color: var(--button-bg);
   color: var(--button-text);
   width: 50px;
   height: 50px;
   border-radius: 50%;
   display: flex;
   justify-content: center;
   align-items: center;
   cursor: pointer;
   transition: transform 0.2s;
}

#ai-chat-icon:hover {
   transform: scale(1.1);
}

#ai-chat-panel {
   position: fixed;
   right: -300px;
   bottom: 80px;
   width: 300px;
   height: 400px;
   transition: right 0.3s, height 0.3s;
   display: flex;
   flex-direction: column;
   background-color: var(--ai-chat-bg);
   border: 1px solid var(--border-color);
   border-radius: 10px;
   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

#ai-chat-panel.open {
   right: 20px;
}

#ai-chat-panel.maximized {
   height: calc(100% - 100px);
}

#ai-chat-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 10px;
   border-bottom: 1px solid var(--border-color);
   background-color: var(--panel-bg);
   border-radius: 10px 10px 0 0;
}

#chat-messages {
   flex: 1;
   overflow-y: auto;
   padding: 10px;
}

#chat-input-container {
   display: flex;
   padding: 10px;
   border-top: 1px solid var(--border-color);
   background-color: var(--panel-bg);
   border-radius: 0 0 10px 10px;
}

#user-input {
   flex: 1;
   margin-right: 5px;
   padding: 5px;
   background-color: var(--bg-color);
   color: var(--text-color);
   border: 1px solid var(--border-color);
   border-radius: 5px;
}

.icon-button {
   background: none;
   border: none;
   color: var(--text-color);
   cursor: pointer;
   padding: 5px;
   transition: color 0.2s;
}

.icon-button:hover {
   color: var(--button-bg);
}

#theme-toggle {
   display: flex;
   align-items: center;
}

.switch {
   position: relative;
   display: inline-block;
   width: 60px;
   height: 34px;
   background-color: var(--panel-bg);
   border-radius: 34px;
   cursor: pointer;
}

.switch input {
   opacity: 0;
   width: 0;
   height: 0;
}

.switch i {
   position: absolute;
   top: 7px;
   transition: .4s;
}

.switch .fa-sun {
   left: 7px;
   color: #f39c12;
   opacity: 0;
}

.switch .fa-moon {
   right: 7px;
   color: #f1c40f;
}

input:checked + .switch .fa-sun {
   opacity: 1;
}

input:checked + .switch .fa-moon {
   opacity: 0;
}

.switch::before {
   content: "";
   position: absolute;
   height: 26px;
   width: 26px;
   left: 4px;
   bottom: 4px;
   background-color: var(--button-bg);
   transition: .4s;
   border-radius: 50%;
}

input:checked + .switch::before {
   transform: translateX(26px);
}

#watchlist-toggle {
   position: fixed;
   top: 50%;
   right: 0;
   transform: translateY(-50%);
   background-color: var(--panel-bg);
   border: 1px solid var(--border-color);
   border-right: none;
   border-radius: 5px 0 0 5px;
   padding: 10px 5px;
   z-index: 1000;
   transition: right 0.3s ease;
}

#watchlist-panel.collapsed + #watchlist-toggle {
   right: 300px;
}

#watchlist-panel.collapsed {
   width: 0;
}

#chart-context-menu, #watchlist-context-menu {
   position: absolute;
   background-color: var(--panel-bg);
   border: 1px solid var(--border-color);
   border-radius: 5px;
   padding: 5px 0;
   z-index: 1000;
   display: none;
}

.context-menu-item {
   padding: 5px 10px;
   cursor: pointer;
}

.context-menu-item:hover {
   background-color: var(--hover-color);
}

@media (max-width: 768px) {
   main {
       flex-direction: column;
   }

   #sidebar, .panel {
       width: 100%;
       height: auto;
   }

   #sidebar.collapsed {
       height: 50px;
   }

   #ai-chat-panel {
       width: 100%;
       right: -100%;
   }

   #ai-chat-panel.open {
       right: 0;
   }
}
```

## File: ./static/js/app.js {#file---static-js-app-js}

```javascript
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || ['EUR_USD', 'GBP_USD'];
let currentSymbol = 'EUR_USD';
let currentTimeframe = 'H1';

function toggleTheme() {
   document.body.classList.toggle('light-theme');
   localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
   updateChartTheme();
}

function updateChartTheme() {
   if (typeof chart !== 'undefined' && chart) {
       chart.applyOptions({
           layout: {
               backgroundColor: getComputedStyle(document.body).getPropertyValue('--chart-bg').trim(),
               textColor: getComputedStyle(document.body).getPropertyValue('--text-color').trim(),
           }
       });
   }
}

function toggleSidebar() {
   const sidebar = document.getElementById('sidebar');
   sidebar.classList.toggle('collapsed');
   adjustChartSize();
}

function toggleWatchlist() {
   const watchlistPanel = document.getElementById('watchlist-panel');
   watchlistPanel.classList.toggle('collapsed');
   const toggleButton = document.getElementById('watchlist-toggle');
   toggleButton.classList.toggle('hidden');
   adjustChartSize();
}

function adjustChartSize() {
   const chartContainer = document.getElementById('chart-container');
   const sidebar = document.getElementById('sidebar');
   const watchlistPanel = document.getElementById('watchlist-panel');
  
   const sidebarWidth = sidebar.classList.contains('collapsed') ? 50 : 250;
   const watchlistWidth = watchlistPanel.classList.contains('collapsed') ? 0 : 300;
  
   const newWidth = window.innerWidth - sidebarWidth - watchlistWidth;
   chartContainer.style.width = `${newWidth}px`;
  
   if (typeof chart !== 'undefined' && chart) {
       chart.applyOptions({ width: newWidth });
   }
}

function addToWatchlist(symbol) {
   if (!watchlist.includes(symbol)) {
       watchlist.push(symbol);
       saveWatchlist();
       updateWatchlistUI();
   }
}

function removeFromWatchlist(symbol) {
   watchlist = watchlist.filter(s => s !== symbol);
   saveWatchlist();
   updateWatchlistUI();
}

function saveWatchlist() {
   localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

function updateWatchlistUI() {
   const container = document.getElementById('watchlist-container');
   container.innerHTML = '';
   watchlist.forEach(symbol => {
       const item = document.createElement('div');
       item.className = 'watchlist-item';
       item.setAttribute('draggable', true);
       item.dataset.symbol = symbol;
       item.innerHTML = `
           <span class="symbol">${symbol}</span>
           <span class="price">--</span>
           <span class="change">--</span>
           <button class="remove-btn">-</button>
       `;
       item.querySelector('.remove-btn').addEventListener('click', (e) => {
           e.stopPropagation();
           removeFromWatchlist(symbol);
       });
       item.addEventListener('click', () => {
           currentSymbol = symbol;
           window.chartFunctions.switchSymbol(symbol);
       });
       container.appendChild(item);
   });
   updateWatchlistData();
}

function toggleChatPanel() {
   const chatPanel = document.getElementById('ai-chat-panel');
   chatPanel.classList.toggle('open');
}

function maximizeChatPanel() {
   const chatPanel = document.getElementById('ai-chat-panel');
   chatPanel.classList.toggle('maximized');
}

function sendChatMessage() {
   const input = document.getElementById('user-input');
   const message = input.value.trim();
   if (message) {
       appendChatMessage('User', message);
       input.value = '';
       fetch('/api/ai_chat', {
           method: 'POST',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({
               message: message,
               chartContext: {
                   symbol: currentSymbol,
                   timeframe: currentTimeframe,
                   price: window.chartFunctions.getLastPrice(),
                   indicators: getActiveIndicators()
               }
           })
       })
       .then(response => response.json())
       .then(data => {
           if (data.response) {
               appendChatMessage('AI', data.response);
           } else {
               appendChatMessage('AI', 'Error: Unable to get a response.');
           }
       })
       .catch(error => {
           console.error('Error:', error);
           appendChatMessage('AI', 'Error: Unable to get a response.');
       });
   }
}

function appendChatMessage(sender, message) {
   const chatMessages = document.getElementById('chat-messages');
   const messageElement = document.createElement('div');
   messageElement.className = `chat-message ${sender.toLowerCase()}-message`;
   messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
   chatMessages.appendChild(messageElement);
   chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getActiveIndicators() {
   // Implement this function to return active indicators
   return [];
}

function initializeWatchlist() {
   const watchlistSearch = document.getElementById('watchlist-search');
   const categoryButton = document.getElementById('instrument-category-button');
   const categoryContent = document.getElementById('instrument-category-content');

   watchlistSearch.addEventListener('input', debounce(handleSearch, 300));

   categoryButton.addEventListener('click', () => {
       categoryContent.classList.toggle('show');
   });

   document.querySelectorAll('#instrument-category-content a').forEach(item => {
       item.addEventListener('click', (e) => {
           e.preventDefault();
           categoryButton.textContent = item.textContent;
           categoryContent.classList.remove('show');
           handleSearch();
       });
   });

   // Close the dropdown if the user clicks outside of it
   window.addEventListener('click', (e) => {
       if (!e.target.matches('#instrument-category-button')) {
           categoryContent.classList.remove('show');
       }
   });

   updateWatchlistUI();
}

function handleSearch() {
   const query = document.getElementById('watchlist-search').value.trim();
   const category = document.getElementById('instrument-category-button').textContent.toLowerCase();
  
   if (query.length > 0 || category !== 'all') {
       searchInstruments(query, category);
   } else {
       document.getElementById('search-results').innerHTML = '';
   }
}

function searchInstruments(query, category) {
   fetch(`/api/search_instruments?query=${query}&category=${category}`)
       .then(response => response.json())
       .then(data => {
           updateSearchResults(data);
       })
       .catch(error => console.error('Error searching instruments:', error));
}

function updateSearchResults(results) {
   const searchResults = document.getElementById('search-results');
   searchResults.innerHTML = '';
   results.forEach(instrument => {
       const item = document.createElement('div');
       item.className = 'search-result-item';
       item.innerHTML = `
           <span class="instrument-name">${instrument}</span>
           <button class="add-btn">${watchlist.includes(instrument) ? '-' : '+'}</button>
       `;
       item.querySelector('.instrument-name').addEventListener('click', () => {
           window.chartFunctions.switchSymbol(instrument);
       });
       item.querySelector('.add-btn').addEventListener('click', (e) => {
           e.stopPropagation();
           if (watchlist.includes(instrument)) {
               removeFromWatchlist(instrument);
           } else {
               addToWatchlist(instrument);
           }
           e.target.textContent = watchlist.includes(instrument) ? '-' : '+';
       });
       searchResults.appendChild(item);
   });
}

function updateWatchlistData() {
   watchlist.forEach(symbol => {
       fetch(`/api/price_data?symbol=${symbol}`)
           .then(response => response.json())
           .then(data => {
               const item = document.querySelector(`.watchlist-item[data-symbol="${symbol}"]`);
               if (item && data.price) {
                   item.querySelector('.price').textContent = data.price.toFixed(5);
                   item.querySelector('.change').textContent = data.change.toFixed(2) + '%';
               }
           })
           .catch(error => console.error('Error fetching price data:', error));
   });
}

function debounce(func, wait) {
   let timeout;
   return function executedFunction(...args) {
       const later = () => {
           clearTimeout(timeout);
           func(...args);
       };
       clearTimeout(timeout);
       timeout = setTimeout(later, wait);
   };
}

document.addEventListener('DOMContentLoaded', () => {
   const savedTheme = localStorage.getItem('theme');
   if (savedTheme === 'light') {
       document.body.classList.add('light-theme');
   }
  
   document.getElementById('theme-switch').addEventListener('change', toggleTheme);
   document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
   document.getElementById('watchlist-toggle').addEventListener('click', toggleWatchlist);
   document.getElementById('ai-chat-icon').addEventListener('click', toggleChatPanel);
   document.getElementById('close-chat').addEventListener('click', toggleChatPanel);
   document.getElementById('maximize-chat').addEventListener('click', maximizeChatPanel);
   document.getElementById('send-message').addEventListener('click', sendChatMessage);
   document.getElementById('user-input').addEventListener('keypress', (e) => {
       if (e.key === 'Enter') {
           sendChatMessage();
       }
   });
  
   initializeWatchlist();
  
   document.querySelectorAll('.timeframe-btn').forEach(btn => {
       btn.addEventListener('click', (e) => {
           document.querySelector('.timeframe-btn[selected]').removeAttribute('selected');
           e.target.setAttribute('selected', '');
           currentTimeframe = e.target.dataset.timeframe;
           window.chartFunctions.switchTimeframe(e.target.dataset.timeframe);
       });
   });

   document.querySelectorAll('.tool-button').forEach(btn => {
       btn.addEventListener('click', (e) => {
           const tool = e.target.closest('.tool-button').dataset.tool;
           window.chartFunctions.setActiveDrawingTool(tool);
       });
   });

   window.addEventListener('resize', adjustChartSize);
   adjustChartSize();
});

setInterval(updateWatchlistData, 60000);
```

## File: ./static/js/chart.js {#file---static-js-chart-js}

```javascript
let chart;
let candleSeries;
let activeDrawingTool = null;
let drawings = [];

function createChart() {
   const chartContainer = document.getElementById('candlestick-chart');
   chart = LightweightCharts.createChart(chartContainer, {
       width: chartContainer.offsetWidth,
       height: chartContainer.offsetHeight,
       layout: {
           backgroundColor: getComputedStyle(document.body).getPropertyValue('--chart-bg').trim(),
           textColor: getComputedStyle(document.body).getPropertyValue('--text-color').trim(),
       },
       grid: {
           vertLines: { color: 'rgba(197, 203, 206, 0.5)' },
           horzLines: { color: 'rgba(197, 203, 206, 0.5)' },
       },
       crosshair: {
           mode: LightweightCharts.CrosshairMode.Normal,
       },
       rightPriceScale: {
           borderColor: 'rgba(197, 203, 206, 0.8)',
       },
       timeScale: {
           borderColor: 'rgba(197, 203, 206, 0.8)',
           timeVisible: true,
           secondsVisible: false,
       },
   });

   candleSeries = chart.addCandlestickSeries({
       upColor: '#26a69a',
       downColor: '#ef5350',
       borderVisible: false,
       wickUpColor: '#26a69a',
       wickDownColor: '#ef5350',
   });

   chart.subscribeCrosshairMove(param => {
       if (param.time) {
           const data = param.seriesData.get(candleSeries);
           if (data) {
               const symbolInfo = document.getElementById('symbol-info');
               symbolInfo.innerHTML = `O: ${data.open.toFixed(5)} H: ${data.high.toFixed(5)} L: ${data.low.toFixed(5)} C: ${data.close.toFixed(5)}`;
           }
       }
   });

   chart.timeScale().fitContent();

   chartContainer.addEventListener('mousedown', handleMouseDown);
   chartContainer.addEventListener('mousemove', handleMouseMove);
   chartContainer.addEventListener('mouseup', handleMouseUp);
   chartContainer.addEventListener('contextmenu', handleContextMenu);

   window.addEventListener('resize', () => {
       chart.applyOptions({
           width: chartContainer.offsetWidth,
           height: chartContainer.offsetHeight
       });
   });

   fetchLatestData();
}

function fetchLatestData() {
   fetch(`/api/candlestick_data?symbol=${currentSymbol}&timeframe=${currentTimeframe}&count=1000`)
       .then(response => response.json())
       .then(data => {
           if (data && data.length > 0) {
               const formattedData = data.map(d => ({
                   time: new Date(d.time).getTime() / 1000,
                   open: parseFloat(d.open),
                   high: parseFloat(d.high),
                   low: parseFloat(d.low),
                   close: parseFloat(d.close)
               }));
               candleSeries.setData(formattedData);
               updateSymbolInfo(currentSymbol, formattedData[formattedData.length - 1]);
           }
       })
       .catch(error => console.error('Error fetching candlestick data:', error));
}

function updateSymbolInfo(symbol, lastCandle) {
   const symbolInfo = document.getElementById('symbol-info');
   symbolInfo.innerHTML = `${symbol} O: ${lastCandle.open.toFixed(5)} H: ${lastCandle.high.toFixed(5)} L: ${lastCandle.low.toFixed(5)} C: ${lastCandle.close.toFixed(5)}`;
}

function switchTimeframe(timeframe) {
   currentTimeframe = timeframe;
   fetchLatestData();
}

function switchSymbol(symbol) {
   currentSymbol = symbol;
   fetchLatestData();
}

let drawingStartPoint = null;
let currentDrawing = null;

function handleMouseDown(e) {
   if (activeDrawingTool) {
       const coords = chart.timeScale().coordinateToLogical(e.clientX);
       const price = chart.priceScale('right').coordinateToPrice(e.clientY);
       drawingStartPoint = { time: coords, price: price };
   }
}

function handleMouseMove(e) {
   if (activeDrawingTool && drawingStartPoint) {
       const coords = chart.timeScale().coordinateToLogical(e.clientX);
       const price = chart.priceScale('right').coordinateToPrice(e.clientY);

       if (currentDrawing) {
           chart.removeSeries(currentDrawing);
       }

       if (activeDrawingTool === 'trendline') {
           currentDrawing = chart.addLineSeries({
               color: '#2962FF',
               lineWidth: 2,
           });
           currentDrawing.setData([
               { time: drawingStartPoint.time, value: drawingStartPoint.price },
               { time: coords, value: price }
           ]);
       } else if (activeDrawingTool === 'horizontalLine') {
           currentDrawing = chart.addLineSeries({
               color: '#2962FF',
               lineWidth: 2,
               priceLineVisible: false,
           });
           currentDrawing.setData([
               { time: chart.timeScale().getVisibleLogicalRange().from, value: drawingStartPoint.price },
               { time: chart.timeScale().getVisibleLogicalRange().to, value: drawingStartPoint.price }
           ]);
       }
   }
}

function handleMouseUp(e) {
   if (activeDrawingTool && drawingStartPoint) {
       const coords = chart.timeScale().coordinateToLogical(e.clientX);
       const price = chart.priceScale('right').coordinateToPrice(e.clientY);

       if (currentDrawing) {
           drawings.push(currentDrawing);
           currentDrawing = null;
       }

       drawingStartPoint = null;
   }
}

function handleContextMenu(e) {
   e.preventDefault();
   showChartContextMenu(e.clientX, e.clientY);
}

function showChartContextMenu(x, y) {
   const contextMenu = document.getElementById('chart-context-menu');
   contextMenu.style.display = 'block';
   contextMenu.style.left = `${x}px`;
   contextMenu.style.top = `${y}px`;

   // Populate context menu options
   contextMenu.innerHTML = `
       <div class="context-menu-item" onclick="toggleLogScale()">Toggle Log Scale</div>
       <div class="context-menu-item" onclick="showChartSettings()">Chart Settings</div>
   `;
}

function toggleLogScale() {
   const currentScale = chart.priceScale('right').mode();
   chart.priceScale('right').applyOptions({
       mode: currentScale === 0 ? 1 : 0, // 0 for normal, 1 for logarithmic
   });
   hideChartContextMenu();
}

function showChartSettings() {
   // Implement chart settings dialog
   console.log("Chart settings clicked");
   hideChartContextMenu();
}

function hideChartContextMenu() {
   const contextMenu = document.getElementById('chart-context-menu');
   contextMenu.style.display = 'none';
}

function setActiveDrawingTool(tool) {
   activeDrawingTool = tool;
}

function getLastPrice() {
   const visibleData = candleSeries.visibleData();
   if (visibleData.length > 0) {
       return visibleData[visibleData.length - 1].close;
   }
   return null;
}

document.addEventListener('DOMContentLoaded', createChart);

// Expose functions to be used in app.js
window.chartFunctions = {
   switchTimeframe,
   switchSymbol,
   fetchLatestData,
   setActiveDrawingTool,
   getLastPrice
};
```

## File: ./t.md {#file---t-md}

```markdown
static/css/styles.css
static/js/app.js
static/js/chart.js
templates/index.html
.env
ai_client.py
data_fetcher.py
main.py
requirements.txt```

## File: ./templates/index.html {#file---templates-index-html}

```html
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <title>Myriad Labs</title>
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <link rel="stylesheet" href="{{ url_for('static', filename='css/styles.css') }}">
   <script src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"></script>
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body class="dark-theme">
   <div id="app">
       <header>
           <button id="sidebar-toggle" class="icon-button"><i class="fas fa-bars"></i></button>
           <h1>Myriad Labs</h1>
           <div id="theme-toggle">
               <input type="checkbox" id="theme-switch">
               <label for="theme-switch" class="switch">
                   <i class="fas fa-sun"></i>
                   <i class="fas fa-moon"></i>
               </label>
           </div>
       </header>
       <main>
           <aside id="sidebar">
               <div class="tool-category">
                   <h3>Drawing Tools</h3>
                   <div class="tool-grid">
                       <button class="tool-button" data-tool="trendline"><i class="fas fa-chart-line"></i></button>
                       <button class="tool-button" data-tool="horizontalLine"><i class="fas fa-minus"></i></button>
                       <button class="tool-button" data-tool="verticalLine"><i class="fas fa-grip-lines-vertical"></i></button>
                       <button class="tool-button" data-tool="rectangle"><i class="far fa-square"></i></button>
                       <button class="tool-button" data-tool="ellipse"><i class="far fa-circle"></i></button>
                       <button class="tool-button" data-tool="fibonacciRetracement"><i class="fas fa-project-diagram"></i></button>
                       <button class="tool-button" data-tool="text"><i class="fas fa-font"></i></button>
                       <button class="tool-button" data-tool="arrow"><i class="fas fa-arrow-right"></i></button>
                   </div>
               </div>
               <div class="tool-category">
                   <h3>Indicators</h3>
                   <div class="tool-grid">
                       <button class="tool-button" data-indicator="ma"><i class="fas fa-wave-square"></i></button>
                       <button class="tool-button" data-indicator="rsi"><i class="fas fa-chart-area"></i></button>
                       <button class="tool-button" data-indicator="macd"><i class="fas fa-signal"></i></button>
                       <button class="tool-button" data-indicator="bollinger"><i class="fas fa-braille"></i></button>
                       <button class="tool-button" data-indicator="stochastic"><i class="fas fa-percent"></i></button>
                       <button class="tool-button" data-indicator="volume"><i class="fas fa-chart-bar"></i></button>
                   </div>
               </div>
               <div class="tool-category">
                   <h3>Zoom Tools</h3>
                   <div class="tool-grid">
                       <button class="tool-button" data-zoom="in"><i class="fas fa-search-plus"></i></button>
                       <button class="tool-button" data-zoom="out"><i class="fas fa-search-minus"></i></button>
                       <button class="tool-button" data-zoom="fit"><i class="fas fa-compress-arrows-alt"></i></button>
                   </div>
               </div>
               <div class="tool-category">
                   <h3>Actions</h3>
                   <div class="tool-grid">
                       <button class="tool-button" id="undo-button"><i class="fas fa-undo"></i></button>
                       <button class="tool-button" id="redo-button"><i class="fas fa-redo"></i></button>
                   </div>
               </div>
           </aside>
           <div id="chart-container">
               <div id="timeframe-selector">
                   <button class="timeframe-btn" data-timeframe="M1">1m</button>
                   <button class="timeframe-btn" data-timeframe="M5">5m</button>
                   <button class="timeframe-btn" data-timeframe="M15">15m</button>
                   <button class="timeframe-btn" data-timeframe="M30">30m</button>
                   <button class="timeframe-btn" data-timeframe="H1" selected>1h</button>
                   <button class="timeframe-btn" data-timeframe="H4">4h</button>
                   <button class="timeframe-btn" data-timeframe="D">1D</button>
                   <button class="timeframe-btn" data-timeframe="W">1W</button>
                   <button class="timeframe-btn" data-timeframe="M">1M</button>
               </div>
               <div id="symbol-info"></div>
               <div id="candlestick-chart"></div>
           </div>
           <aside id="watchlist-panel" class="panel">
               <h3>Watchlist <button id="watchlist-toggle" class="icon-button"><i class="fas fa-chevron-right"></i></button></h3>
               <div id="watchlist-search-container">
                   <input type="text" id="watchlist-search" placeholder="Search instruments...">
                   <div id="instrument-category-dropdown">
                       <button id="instrument-category-button">All</button>
                       <div id="instrument-category-content">
                           <a href="#" data-category="all">All</a>
                           <a href="#" data-category="forex">Forex</a>
                           <a href="#" data-category="commodities">Commodities</a>
                           <a href="#" data-category="indices">Indices</a>
                       </div>
                   </div>
                   <div id="search-results"></div>
               </div>
               <div id="watchlist-container"></div>
           </aside>
       </main>
       <div id="ai-chat-icon"><i class="fas fa-robot"></i></div>
       <div id="ai-chat-panel" class="panel">
           <div id="ai-chat-header">
               <h3>AI Trading Assistant</h3>
               <button id="maximize-chat" class="icon-button"><i class="fas fa-expand"></i></button>
               <button id="close-chat" class="icon-button"><i class="fas fa-times"></i></button>
           </div>
           <div id="chat-messages"></div>
           <div id="chat-input-container">
               <input type="text" id="user-input" placeholder="Ask about trading or chart analysis...">
               <button id="send-message" class="icon-button"><i class="fas fa-paper-plane"></i></button>
           </div>
       </div>
   </div>
   <div id="chart-context-menu"></div>
   <div id="watchlist-context-menu"></div>
   <script src="{{ url_for('static', filename='js/chart.js') }}"></script>
   <script src="{{ url_for('static', filename='js/app.js') }}"></script>
</body>
</html>
```

