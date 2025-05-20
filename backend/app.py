from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS for cross-origin support
from walmart_api import WalmartAPI
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

config_path = os.path.join(os.path.dirname(__file__), "config", "walmart_config.json")
walmart_api = WalmartAPI(config_path)

@app.route('/api/search')
def search():
    query = request.args.get('query')
    if not query:
        return jsonify({'error': 'Missing query'}), 400
    
    # Add debug print statements
    print(f"Received search request for: {query}")
    
    result = walmart_api.search_products(query)
    
    # Add debug print statements for the result
    print(f"Search results count: {len(result.get('items', [])) if result and 'items' in result else 0}")
    
    return jsonify(result)

@app.route('/api/product/<product_id>')
def get_product(product_id):
    result = walmart_api.get_product_details(product_id)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5001)