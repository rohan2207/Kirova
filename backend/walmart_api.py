import requests
import os
from walmart_auth import WalmartAuth

class WalmartAPI:
    def __init__(self, config_path):
        self.auth = WalmartAuth(config_path)
        self.base_url = "https://developer.api.walmart.com/api-proxy/service/affil"

    def get_taxonomy(self):
        endpoint = f"{self.base_url}/product/v2/taxonomy"
        headers = self._get_headers()
        response = requests.get(endpoint, headers=headers)
        return self._process_response(response)

    def search_products(self, query, limit=10):
        endpoint = f"{self.base_url}/product/v2/search"
        headers = self._get_headers()
        params = {"query": query, "numItems": limit}
        response = requests.get(endpoint, headers=headers, params=params)
        return self._process_response(response)

    def get_product_details(self, product_id):
        endpoint = f"{self.base_url}/product/v2/items/{product_id}"
        headers = self._get_headers()
        response = requests.get(endpoint, headers=headers)
        return self._process_response(response)

    def _get_headers(self):
        headers = self.auth.generate_auth_headers()
        headers["Content-Type"] = "application/json"
        headers["Accept"] = "application/json"
        return headers

    def _process_response(self, response):
        if response.status_code == 200:
            return response.json()
        print(f"Error {response.status_code}: {response.text}")
        return None
