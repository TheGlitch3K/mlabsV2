# Project Code Overview

Generated on: Wed Sep 25 19:46:51 CDT 2024

## Table of Contents

- [./Stories/add_indicators_button_feature.md](#file---Stories-add-indicators-button-feature-md)
- [./ai_client.py](#file---ai-client-py)
- [./data_fetcher.py](#file---data-fetcher-py)
- [./main.py](#file---main-py)
- [./requirements.txt](#file---requirements-txt)
- [./static/css/ai-chat.css](#file---static-css-ai-chat-css)
- [./static/css/chart.css](#file---static-css-chart-css)
- [./static/css/components.css](#file---static-css-components-css)
- [./static/css/layout.css](#file---static-css-layout-css)
- [./static/css/main.css](#file---static-css-main-css)
- [./static/css/modal.css](#file---static-css-modal-css)
- [./static/css/responsive.css](#file---static-css-responsive-css)
- [./static/css/sidebar.css](#file---static-css-sidebar-css)
- [./static/css/styles.css](#file---static-css-styles-css)
- [./static/css/variables.css](#file---static-css-variables-css)
- [./static/css/watchlist.css](#file---static-css-watchlist-css)
- [./static/js/app.js](#file---static-js-app-js)
- [./static/js/chart.js](#file---static-js-chart-js)
- [./static/js/indicators.js](#file---static-js-indicators-js)
- [./t.md](#file---t-md)
- [./templates/index.html](#file---templates-index-html)

## File: ./Stories/add_indicators_button_feature.md {#file---Stories-add-indicators-button-feature-md}

```markdown
# Feature: Add Indicators Button to Chart Interface

## Branch: add-indicators-button

## Overview
This feature adds an "Indicators" button to the chart interface, allowing users to access and manage technical indicators for their trading analysis. The button is positioned alongside the timeframe selector buttons, providing easy access to a modal window for indicator selection and configuration.

## Purpose
The purpose of this feature is to enhance the trading platform's analytical capabilities by giving users quick access to various technical indicators. This addition aims to improve user experience and provide more comprehensive tools for market analysis directly within the chart interface.

## Implementation Details

### HTML Changes (index.html)
- Added a new button with id "indicators-button" to the timeframe selector div.
- Implemented a modal structure for the indicators selection interface.

### CSS Changes (styles.css)
- Styled the new Indicators button to match existing timeframe buttons.
- Added styles for the modal, including layout, positioning, and theme-consistent colors.
- Ensured responsive design for various screen sizes.

### JavaScript Changes (app.js)
- Implemented openIndicatorsModal() and closeIndicatorsModal() functions to handle the modal's display.
- Added fetchIndicators() function to retrieve indicator data from the server.
- Created updateIndicatorsList() to populate the modal with available indicators.
- Implemented filterIndicators() for search functionality within the indicators list.
- Added event listeners for the new Indicators button and modal interactions.

## Key Features
1. Indicators button integrated seamlessly with existing timeframe selectors.
2. Modal window for indicator selection and management.
3. Search functionality to easily find specific indicators.
4. Categorized view of indicators (Favorites, Personal, Technicals, Financials, Community).
5. Responsive design ensuring functionality across different devices and screen sizes.

## Technical Considerations
- The feature uses vanilla JavaScript for DOM manipulation and event handling.
- CSS variables are utilized for consistent theming and easy customization.
- The modal is designed to be non-blocking, allowing users to interact with the chart while it's open.
- Placeholder data is used for indicators, to be replaced with actual backend integration in future iterations.

## Future Enhancements
1. Implement backend API for fetching real indicator data.
2. Add functionality to apply selected indicators to the chart.
3. Develop a system for users to save and manage favorite indicators.
4. Introduce more advanced filtering and sorting options for indicators.
5. Implement indicator customization options (e.g., period, color).

## Testing Considerations
- Verify that the Indicators button appears correctly in various browser environments.
- Ensure the modal opens and closes as expected.
- Test the search functionality with various input scenarios.
- Confirm that the UI is responsive and functions correctly on mobile devices.
- Check for any potential conflicts with existing chart functionalities.

## Deployment Notes
- This feature is primarily front-end focused and doesn't require database migrations.
- Ensure that the new static files (updated CSS and JS) are properly cached and served.
- Monitor for any performance impacts, especially on mobile devices.

## Conclusion
The addition of the Indicators button and associated modal interface represents a significant enhancement to the trading platform's functionality. It provides users with easier access to technical analysis tools, potentially improving their trading decisions and overall satisfaction with the platform.

## Short-term Improvement Plan

To make this feature better and complete, we need to focus on the following steps:

1. Backend Integration:
   - Develop an API endpoint for fetching indicator data.
   - Implement server-side logic to manage and store indicator configurations.

2. Chart Integration:
   - Modify the chart.js file to support adding and removing indicators.
   - Implement rendering logic for different types of indicators (e.g., overlays, separate panels).

3. Indicator Customization:
   - Add UI elements in the modal for customizing indicator parameters.
   - Implement real-time preview of indicator changes on the chart.

4. Favorites System:
   - Add functionality to mark indicators as favorites.
   - Implement persistent storage of user preferences.

5. Performance Optimization:
   - Optimize indicator calculations for real-time updates.
   - Implement efficient data caching mechanisms.

6. Advanced Filtering:
   - Add sorting options for the indicator list.
   - Implement more advanced search and filter capabilities.

7. Testing and Bug Fixes:
   - Conduct thorough testing of all new functionalities.
   - Address any bugs or issues discovered during testing.

8. Documentation and Code Cleanup:
   - Update documentation to reflect new features and usage instructions.
   - Refactor and clean up code as necessary.

By completing these steps, we will transform the current UI-focused feature into a fully functional and integrated part of the trading platform, significantly enhancing its analytical capabilities.
```

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
import json

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

@app.route('/api/indicators')
def get_indicators():
    # Load indicators from a JSON file
    with open('indicators.json', 'r') as f:
        indicators = json.load(f)
    return jsonify(indicators)

@app.route('/api/indicators/favorite', methods=['POST'])
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

## File: ./static/css/ai-chat.css {#file---static-css-ai-chat-css}

```css
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
```

## File: ./static/css/chart.css {#file---static-css-chart-css}

```css
#chart-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--chart-bg);
}

#chart-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: var(--panel-bg);
}

#timeframe-selector {
    display: flex;
    overflow-x: auto;
    align-items: center;
}

.timeframe-btn {
    background-color: var(--panel-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    padding: 5px 10px;
    margin-right: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;
}

.timeframe-btn[selected], .timeframe-btn:hover {
    background-color: var(--button-bg);
    color: var(--button-text);
}

#chart-buttons {
    display: flex;
    gap: 10px;
}

.chart-btn {
    background-color: var(--button-bg);
    color: var(--button-text);
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 5px;
}

.chart-btn:hover {
    background-color: var(--hover-color);
}

#strategies-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: var(--panel-bg);
    border: 1px solid var(--border-color);
    border-top: none;
    z-index: 1000;
}

#symbol-info {
    padding: 10px 20px;
    background-color: var(--panel-bg);
    border-top: 1px solid var(--border-color);
}

#candlestick-chart {
    flex: 1;
}

#indicators-button, #strategies-dropdown-btn {
    font-size: 14px;
}

#indicators-button i, #strategies-dropdown-btn i {
    font-size: 16px;
}```

## File: ./static/css/components.css {#file---static-css-components-css}

```css
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

.dropdown-content {
    display: none;
    position: absolute;
    background-color: var(--panel-bg);
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
}

.dropdown-content a {
    color: var(--text-color);
    padding: 12px 16px;
    text-decoration: none;
    display: block;
}

.dropdown-content a:hover {
    background-color: var(--hover-color);
}

.show {
    display: block;
}```

## File: ./static/css/layout.css {#file---static-css-layout-css}

```css
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

.panel {
    width: 300px;
    background-color: var(--panel-bg);
    border-left: 1px solid var(--border-color);
    transition: width 0.3s ease;
}
```

## File: ./static/css/main.css {#file---static-css-main-css}

```css
@import 'variables.css';
@import 'layout.css';
@import 'components.css';
@import 'sidebar.css';
@import 'chart.css';
@import 'watchlist.css';
@import 'ai-chat.css';
@import 'modal.css';
@import 'responsive.css';

/* Global Styles */
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
```

## File: ./static/css/modal.css {#file---static-css-modal-css}

```css
/* ###### Modal Styles ###### */
.modal {
    display: none;
    position: fixed;
    z-index: 1001;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.4);
}

.modal-content {
    background-color: var(--modal-bg);
    margin: 15% auto;
    padding: 20px;
    border: 1px solid var(--border-color);
    width: 80%;
    max-width: 600px;
    border-radius: 5px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.close {
    color: var(--text-color);
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
}

.close:hover,
.close:focus {
    color: var(--button-bg);
    text-decoration: none;
    cursor: pointer;
}

/* ###### Indicator Modal Styles ###### */
#indicator-search {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-color);
    color: var(--text-color);
}

#indicator-categories {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.category-btn {
    background-color: var(--panel-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    padding: 5px 10px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.category-btn.active {
    background-color: var(--button-bg);
    color: var(--button-text);
}

#indicators-list {
    max-height: 300px;
    overflow-y: auto;
}

.indicator-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid var(--border-color);
}

.indicator-item:hover {
    background-color: var(--hover-color);
}

.add-indicator-btn, .favorite-btn {
    background-color: var(--button-bg);
    color: var(--button-text);
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.add-indicator-btn:hover, .favorite-btn:hover {
    background-color: var(--hover-color);
}

.favorite-btn {
    background-color: transparent;
    color: var(--text-color);
}

.favorite-btn.active {
    color: gold;
}
```

## File: ./static/css/responsive.css {#file---static-css-responsive-css}

```css
/* ###### Responsive Styles ###### */
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

    .modal-content {
        width: 95%;
        margin: 5% auto;
    }

    #indicator-categories {
        flex-wrap: wrap;
    }

    .category-btn {
        margin-bottom: 5px;
    }

    #timeframe-selector {
        flex-wrap: wrap;
    }

    .timeframe-btn {
        margin-bottom: 5px;
    }

    #chart-container {
        padding: 10px;
    }

    #watchlist-panel {
        position: fixed;
        top: 0;
        right: -100%;
        height: 100%;
        width: 100%;
        z-index: 1000;
        transition: right 0.3s ease;
    }

    #watchlist-panel.open {
        right: 0;
    }

    #watchlist-toggle {
        top: 10px;
        right: 10px;
        transform: none;
    }

    #ai-chat-icon {
        bottom: 10px;
        right: 10px;
    }

    .tool-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 480px) {
    header {
        flex-direction: column;
        align-items: flex-start;
    }

    #theme-toggle {
        margin-top: 10px;
    }

    .tool-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    #indicator-categories {
        flex-direction: column;
    }

    .category-btn {
        width: 100%;
        margin-bottom: 5px;
    }
}
```

## File: ./static/css/sidebar.css {#file---static-css-sidebar-css}

```css
#sidebar {
    width: 250px;
    background-color: var(--panel-bg);
    transition: width 0.3s ease;
    overflow-y: auto;
    padding: 10px;
}

#sidebar.collapsed {
    width: 50px;
}

.tool-category {
    margin-bottom: 20px;
}

.tool-category h3 {
    margin-bottom: 10px;
    font-size: 14px;
    color: var(--text-color);
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
    font-size: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.tool-button i {
    margin-bottom: 5px;
}

.tool-button:hover {
    background-color: var(--hover-color);
}

#indicators-button, #strategies-dropdown-btn {
    grid-column: span 4;
    display: flex;
    justify-content: center;
    align-items: center;
}

#strategies-dropdown {
    display: none;
    background-color: var(--panel-bg);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 5px 0;
    margin-top: 5px;
}

#strategies-dropdown button {
    display: block;
    width: 100%;
    padding: 8px 10px;
    background: none;
    border: none;
    text-align: left;
    color: var(--text-color);
    cursor: pointer;
}

#strategies-dropdown button:hover {
    background-color: var(--hover-color);
}

.show {
    display: block !important;
}```

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
   --modal-bg: #1e222d;
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
   --modal-bg: #f0f3fa;
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
   align-items: center;
}

.timeframe-btn {
   background-color: var(--panel-bg);
   color: var(--text-color);
   border: 1px solid var(--border-color);
   padding: 5px 10px;
   margin-right: 5px;
   cursor: pointer;
   transition: background-color 0.2s;
   white-space: nowrap;
}

.timeframe-btn[selected], .timeframe-btn:hover {
   background-color: var(--button-bg);
   color: var(--button-text);
}

#indicators-button {
   display: flex;
   align-items: center;
   gap: 5px;
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

.modal {
   display: none;
   position: fixed;
   z-index: 1001;
   left: 0;
   top: 0;
   width: 100%;
   height: 100%;
   overflow: auto;
   background-color: rgba(0,0,0,0.4);
}

.modal-content {
   background-color: var(--modal-bg);
   margin: 15% auto;
   padding: 20px;
   border: 1px solid var(--border-color);
   width: 80%;
   max-width: 600px;
   border-radius: 5px;
}

.modal-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 20px;
}

.close {
   color: var(--text-color);
   float: right;
   font-size: 28px;
   font-weight: bold;
   cursor: pointer;
}

.close:hover,
.close:focus {
   color: var(--button-bg);
   text-decoration: none;
   cursor: pointer;
}

#indicator-search {
   width: 100%;
   padding: 10px;
   margin-bottom: 20px;
   border: 1px solid var(--border-color);
   background-color: var(--bg-color);
   color: var(--text-color);
}

#indicator-categories {
   display: flex;
   justify-content: space-between;
   margin-bottom: 20px;
}

.category-btn {
   background-color: var(--panel-bg);
   color: var(--text-color);
   border: 1px solid var(--border-color);
   padding: 5px 10px;
   cursor: pointer;
   transition: background-color 0.2s;
}

.category-btn.active {
   background-color: var(--button-bg);
   color: var(--button-text);
}

#indicators-list {
   max-height: 300px;
   overflow-y: auto;
}

.indicator-item {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 10px;
   border-bottom: 1px solid var(--border-color);
}

.indicator-item:hover {
   background-color: var(--hover-color);
}

.add-indicator-btn {
   background-color: var(--button-bg);
   color: var(--button-text);
   border: none;
   padding: 5px 10px;
   cursor: pointer;
   transition: background-color 0.2s;
}

.add-indicator-btn:hover {
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

  .modal-content {
      width: 95%;
      margin: 5% auto;
  }

  #indicator-categories {
      flex-wrap: wrap;
  }

  .category-btn {
      margin-bottom: 5px;
  }
}

.indicator-item {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 10px;
   border-bottom: 1px solid var(--border-color);
}

.indicator-item:hover {
   background-color: var(--hover-color);
}

.add-indicator-btn, .favorite-btn {
   background-color: var(--button-bg);
   color: var(--button-text);
   border: none;
   padding: 5px 10px;
   cursor: pointer;
   transition: background-color 0.2s;
}

.add-indicator-btn:hover, .favorite-btn:hover {
   background-color: var(--hover-color);
}

.favorite-btn {
   background-color: transparent;
   color: var(--text-color);
}

.favorite-btn.active {
   color: gold;
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

#strategies-dropdown {
    display: none;
    position: absolute;
    background-color: var(--panel-bg);
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
}

#strategies-dropdown button {
    color: var(--text-color);
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    width: 100%;
    text-align: left;
    border: none;
    background: none;
    cursor: pointer;
}

#strategies-dropdown button:hover {
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
}```

## File: ./static/css/variables.css {#file---static-css-variables-css}

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
    --modal-bg: #1e222d;
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
    --modal-bg: #f0f3fa;
}
```

## File: ./static/css/watchlist.css {#file---static-css-watchlist-css}

```css
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

#watchlist-context-menu {
    position: absolute;
    background-color: var(--panel-bg);
    border: 1px solid var(--border-color);
    border-radius: 5px;
    padding: 5px 0;
    z-index: 1000;
    display: none;
}
```

## File: ./static/js/app.js {#file---static-js-app-js}

```javascript
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || ['EUR_USD', 'GBP_USD'];
let currentSymbol = 'EUR_USD';
let currentTimeframe = 'H1';
let strategies = ['Moving Average Crossover', 'RSI Overbought/Oversold', 'MACD Divergence'];
let activeStrategy = null;

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
    var chartContainer = document.getElementById('chart-container');
    var sidebar = document.getElementById('sidebar');
    var watchlistPanel = document.getElementById('watchlist-panel');
   
    var sidebarWidth = sidebar.classList.contains('collapsed') ? 50 : 250;
    var watchlistWidth = watchlistPanel.classList.contains('collapsed') ? 0 : 300;
   
    var newWidth = window.innerWidth - sidebarWidth - watchlistWidth;
    chartContainer.style.width = newWidth + 'px';
   
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

function initializeStrategiesDropdown() {
    const dropdown = document.getElementById('strategies-dropdown');
    const dropdownBtn = document.getElementById('strategies-dropdown-btn');

    // Populate dropdown with strategies
    strategies.forEach(strategy => {
        const button = document.createElement('button');
        button.textContent = strategy;
        button.addEventListener('click', () => selectStrategy(strategy));
        dropdown.appendChild(button);
    });

    // Toggle dropdown visibility
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    window.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });
}

function selectStrategy(strategy) {
    activeStrategy = strategy;
    console.log(`Selected strategy: ${strategy}`);
    // Here you would typically call a function to apply the strategy to the chart
    applyStrategyToChart(strategy);
}

function applyStrategyToChart(strategy) {
    // Remove any existing strategy indicators
    removeExistingStrategyIndicators();

    switch(strategy) {
        case 'Moving Average Crossover':
            addMovingAverageCrossover();
            break;
        case 'RSI Overbought/Oversold':
            addRSIStrategy();
            break;
        case 'MACD Divergence':
            addMACDDivergence();
            break;
    }
}

function removeExistingStrategyIndicators() {
    // Implement this function to remove existing strategy indicators from the chart
    console.log('Removing existing strategy indicators');
}

function addMovingAverageCrossover() {
    // Implement Moving Average Crossover strategy
    console.log('Adding Moving Average Crossover strategy');
    window.chartFunctions.addIndicator('sma', { period: 10, color: 'blue' });
    window.chartFunctions.addIndicator('sma', { period: 20, color: 'red' });
}

function addRSIStrategy() {
    // Implement RSI Overbought/Oversold strategy
    console.log('Adding RSI Overbought/Oversold strategy');
    window.chartFunctions.addIndicator('rsi', { period: 14, overbought: 70, oversold: 30 });
}

function addMACDDivergence() {
    // Implement MACD Divergence strategy
    console.log('Adding MACD Divergence strategy');
    window.chartFunctions.addIndicator('macd', { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 });
}

function initializeIndicatorsModal() {
    const modal = document.getElementById('indicators-modal');
    const btn = document.getElementById('indicators-button');
    const span = document.getElementsByClassName('close')[0];
    const indicatorsList = document.getElementById('indicators-list');
    const indicatorSearch = document.getElementById('indicator-search');
    const categoryButtons = document.querySelectorAll('.category-btn');

    btn.onclick = () => modal.style.display = 'block';
    span.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Populate indicators list
    const indicators = [
        { name: 'Simple Moving Average', category: 'trend' },
        { name: 'Exponential Moving Average', category: 'trend' },
        { name: 'Relative Strength Index', category: 'momentum' },
        { name: 'Moving Average Convergence Divergence', category: 'momentum' },
        { name: 'Bollinger Bands', category: 'volatility' },
        { name: 'Average True Range', category: 'volatility' },
        { name: 'On-Balance Volume', category: 'volume' },
    ];

    function renderIndicators(filteredIndicators) {
        indicatorsList.innerHTML = '';
        filteredIndicators.forEach(indicator => {
            const item = document.createElement('div');
            item.className = 'indicator-item';
            item.innerHTML = `
                <span>${indicator.name}</span>
                <button class="add-indicator-btn">Add</button>
                <button class="favorite-btn"><i class="far fa-star"></i></button>
            `;
            item.querySelector('.add-indicator-btn').addEventListener('click', () => addIndicator(indicator.name));
            item.querySelector('.favorite-btn').addEventListener('click', (e) => toggleFavorite(e.target));
            indicatorsList.appendChild(item);
        });
    }

    renderIndicators(indicators);

    indicatorSearch.addEventListener('input', () => {
        const searchTerm = indicatorSearch.value.toLowerCase();
        const filteredIndicators = indicators.filter(indicator => 
            indicator.name.toLowerCase().includes(searchTerm)
        );
        renderIndicators(filteredIndicators);
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.dataset.category;
            const filteredIndicators = category === 'all' 
                ? indicators 
                : indicators.filter(indicator => indicator.category === category);
            renderIndicators(filteredIndicators);
        });
    });
}

function addIndicator(indicatorName) {
    console.log(`Adding indicator: ${indicatorName}`);
    // Implement the logic to add the indicator to the chart
    // You might want to call a function from chartFunctions here
}

function toggleFavorite(button) {
    button.classList.toggle('active');
    // Implement the logic to save favorite indicators
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
    initializeStrategiesDropdown();
    initializeIndicatorsModal();
   
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

// Export functions to be used by other modules if needed
window.appFunctions = {
    toggleTheme,
    toggleSidebar,
    toggleWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleChatPanel,
    maximizeChatPanel,
    sendChatMessage,
    selectStrategy,
    addIndicator
};```

## File: ./static/js/chart.js {#file---static-js-chart-js}

```javascript
let chart;
let candleSeries;
let activeDrawingTool = null;
let drawings = [];
let indicators = [];

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

    contextMenu.innerHTML = `
        <div class="context-menu-item" onclick="toggleLogScale()">Toggle Log Scale</div>
        <div class="context-menu-item" onclick="showChartSettings()">Chart Settings</div>
        <div class="context-menu-item" onclick="clearAllDrawings()">Clear All Drawings</div>
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

function clearAllDrawings() {
    drawings.forEach(drawing => chart.removeSeries(drawing));
    drawings = [];
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

function addIndicator(type, params = {}) {
    let indicator;
    switch (type) {
        case 'sma':
            indicator = chart.addLineSeries({
                color: 'rgba(4, 111, 232, 1)',
                lineWidth: 2,
            });
            // Calculate SMA values
            break;
        case 'ema':
            indicator = chart.addLineSeries({
                color: 'rgba(255, 82, 82, 1)',
                lineWidth: 2,
            });
            // Calculate EMA values
            break;
        // Add more indicator types as needed
    }
    indicators.push({ type, series: indicator, params });
    // Calculate and set data for the indicator
}

function removeIndicator(index) {
    if (index >= 0 && index < indicators.length) {
        chart.removeSeries(indicators[index].series);
        indicators.splice(index, 1);
    }
}

document.addEventListener('DOMContentLoaded', createChart);

// Expose functions to be used in app.js
window.chartFunctions = {
    switchTimeframe,
    switchSymbol,
    fetchLatestData,
    setActiveDrawingTool,
    getLastPrice,
    addIndicator,
    removeIndicator
};
```

## File: ./static/js/indicators.js {#file---static-js-indicators-js}

```javascript
const IndicatorManager = (function() {
    let indicators = [];

    function fetchIndicators() {
        return fetch('/api/indicators')
            .then(response => response.json())
            .then(data => {
                indicators = data;
                return data;
            });
    }

    function updateIndicatorsList(containerSelector, category = 'all') {
        const container = document.querySelector(containerSelector);
        container.innerHTML = '';
        const filteredIndicators = category === 'all' 
            ? indicators 
            : indicators.filter(indicator => indicator.category === category);
        
        filteredIndicators.forEach(indicator => {
            const item = document.createElement('div');
            item.className = 'indicator-item';
            item.innerHTML = `
                <span class="indicator-name">${indicator.name}</span>
                <span class="indicator-author">${indicator.author}</span>
                <button class="favorite-btn ${indicator.isFavorite ? 'active' : ''}" data-id="${indicator.id}">
                    <i class="fas fa-star"></i>
                </button>
                <button class="add-indicator-btn" data-id="${indicator.id}">Add</button>
            `;
            item.querySelector('.add-indicator-btn').addEventListener('click', () => addIndicator(indicator));
            item.querySelector('.favorite-btn').addEventListener('click', (e) => toggleFavorite(e, indicator));
            container.appendChild(item);
        });
    }

    function filterIndicators(query) {
        const filteredIndicators = indicators.filter(indicator => 
            indicator.name.toLowerCase().includes(query.toLowerCase()) ||
            indicator.author.toLowerCase().includes(query.toLowerCase())
        );
        updateIndicatorsList('#indicators-list', filteredIndicators);
    }

    function addIndicator(indicator) {
        console.log(`Adding indicator: ${indicator.name}`);
        // TODO: Implement actual indicator addition to the chart
    }

    function toggleFavorite(event, indicator) {
        const button = event.currentTarget;
        const isFavorite = !indicator.isFavorite;
        button.classList.toggle('active');
        
        fetch('/api/indicators/favorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: indicator.id, isFavorite: isFavorite }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                indicator.isFavorite = isFavorite;
            }
        })
        .catch(error => console.error('Error:', error));
    }

    return {
        fetchIndicators,
        updateIndicatorsList,
        filterIndicators,
        addIndicator
    };
})();

export default IndicatorManager;
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Myriad Labs</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/main.css') }}">
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
                <div id="chart-controls">
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
                    <div id="chart-buttons">
                        <button id="indicators-button" class="chart-btn"><i class="fas fa-chart-line"></i> Indicators</button>
                        <button id="strategies-dropdown-btn" class="chart-btn"><i class="fas fa-brain"></i> Strategies</button>
                    </div>
                </div>
                <div id="strategies-dropdown" class="dropdown-content">
                    <!-- Strategy options will be dynamically added here -->
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
    
    <!-- Indicators Modal -->
    <div id="indicators-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add Indicator</h2>
                <span class="close">&times;</span>
            </div>
            <input type="text" id="indicator-search" placeholder="Search indicators...">
            <div id="indicator-categories">
                <button class="category-btn active" data-category="all">All</button>
                <button class="category-btn" data-category="trend">Trend</button>
                <button class="category-btn" data-category="momentum">Momentum</button>
                <button class="category-btn" data-category="volatility">Volatility</button>
                <button class="category-btn" data-category="volume">Volume</button>
            </div>
            <div id="indicators-list">
                <!-- Indicator items will be dynamically added here -->
            </div>
        </div>
    </div>

    <script src="{{ url_for('static', filename='js/chart.js') }}"></script>
    <script src="{{ url_for('static', filename='js/app.js') }}"></script>
</body>
</html>```

