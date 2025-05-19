from flask import Flask, request, jsonify
from walmart_api import WalmartAPI
import os

app = Flask(__name__)
config_path = os.path.join(os.path.dirname(__file__), "config", "walmart_config.json")
walmart_api = WalmartAPI(config_path)

@app.route('/api/search')
def search():
    query = request.args.get('query')
    if not query:
        return jsonify({'error': 'Missing query'}), 400
    result = walmart_api.search_products(query)
    return jsonify(result)

@app.route('/api/product/<product_id>')
def get_product(product_id):
    result = walmart_api.get_product_details(product_id)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
