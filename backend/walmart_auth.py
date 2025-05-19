import json
import time
import base64
import os
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend

class WalmartAuth:
    def __init__(self, config_path):
        with open(config_path, 'r') as f:
            self.config = json.load(f)

        private_key_path = os.path.join(os.path.dirname(os.path.dirname(config_path)), self.config['privateKeyPath'])
        with open(private_key_path, 'rb') as key_file:
            self.private_key = serialization.load_pem_private_key(
                key_file.read(),
                password=None,
                backend=default_backend()
            )

    def generate_auth_headers(self):
        timestamp = str(int(time.time() * 1000))
        values_to_sign = {
            "WM_CONSUMER.ID": self.config['consumerId'],
            "WM_CONSUMER.INTIMESTAMP": timestamp,
            "WM_SEC.KEY_VERSION": self.config['privateKeyVersion']
        }

        canonicalized_string = self._canonicalize(values_to_sign)
        signature = self._generate_signature(canonicalized_string)
        headers = values_to_sign.copy()
        headers["WM_SEC.AUTH_SIGNATURE"] = signature
        return headers

    def _canonicalize(self, headers_to_sign):
        sorted_keys = sorted(headers_to_sign.keys())
        return ''.join(str(headers_to_sign[key]).strip() + "\n" for key in sorted_keys)

    def _generate_signature(self, data_to_sign):
        data_bytes = data_to_sign.encode('utf-8')
        signature = self.private_key.sign(
            data_bytes,
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        return base64.b64encode(signature).decode('utf-8')
