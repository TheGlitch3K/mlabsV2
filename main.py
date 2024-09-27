import os
from flask import Flask
from dotenv import load_dotenv
import logging
from src.routes.main_routes import main_bp
from src.routes.api_routes import api_bp

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__, static_folder='static', template_folder='templates')

    # Initialize logging
    logging.basicConfig(level=logging.INFO)

    # Register blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix='/api')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)