// src/config/api.js
const isDevelopment = process.env.NODE_ENV === 'development';

// You can change this port to match your local backend
const LOCAL_API_PORT = 5001;

const API_CONFIG = {
  baseUrl: isDevelopment 
    ? `http://127.0.0.1:${LOCAL_API_PORT}/api` 
    : 'https://us-central1-kirova-d154d.cloudfunctions.net/api'
};

console.log('Current environment:', process.env.NODE_ENV);
console.log('Using API URL:', API_CONFIG.baseUrl);

export default API_CONFIG;