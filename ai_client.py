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