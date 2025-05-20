import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const searchProducts = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: { query }
    });
    return response.data.items || [];
  } catch (error) {
    console.error('Walmart API error:', error);
    return [];
  }
};

export const getProductDetails = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Walmart API error:', error);
    return null;
  }
};