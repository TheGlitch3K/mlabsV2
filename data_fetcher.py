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