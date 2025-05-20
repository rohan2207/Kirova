// src/pages/SearchResults.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const Container = styled.div`
  padding: 80px 40px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 20px;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 30px;
`;

const LoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
`;

const ErrorMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #ff4444;
  background-color: #fff6f6;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const ProductCard = styled.div`
  border: 1px solid #DEEBD1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: contain;
  background-color: #f9f9f9;
  padding: 10px;
`;

const ProductInfo = styled.div`
  padding: 15px;
`;

const ProductName = styled.h3`
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
`;

const ProductPrice = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #71B340;
`;

const AddToListButton = styled.button`
  background-color: #71B340;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  
  &:hover {
    background-color: #5c9935;
  }
  
  &:active {
    background-color: #4c7f2c;
  }
`;

const ProductSource = styled.div`
  font-size: 13px;
  color: #999;
  margin-top: 8px;
  display: flex;
  align-items: center;
  
  img {
    width: 16px;
    height: 16px;
    margin-right: 5px;
    object-fit: contain;
    background-color: white;
    border-radius: 2px;
    padding: 1px;
  }
`;

// API URLs
const API_BASE_URL = 'http://127.0.0.1:5001/api';

// Search Walmart API
const searchWalmartProducts = async (query) => {
  try {
    console.log('Searching Walmart API for:', query);
    console.log('API URL:', `${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
    
    // Log the request being made
    console.log('Making API request to:', `${API_BASE_URL}/search`);
    
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: { query }
    });
    
    console.log('Walmart API full response:', response);
    console.log('Walmart API response data:', response.data);
    
    // Transform the data to match our expected format
    if (response.data && response.data.items && response.data.items.length > 0) {
      console.log('Found items in response:', response.data.items.length);
      
      return response.data.items.map(item => {
        // Map the Walmart API response to our expected format
        const transformedItem = {
          id: item.itemId || item.id || `walmart-${Math.random()}`,
          name: item.name || item.title || 'Unknown Product',
          price: item.salePrice || item.price || 0,
          imageUrl: item.largeImage || item.mediumImage || item.thumbnailImage || item.imageUrl || '',
          source: 'walmart'
        };
        
        console.log('Transformed item:', transformedItem);
        return transformedItem;
      });
    } else {
      console.log('No items found in API response or unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Walmart API error details:', error.response || error.message || error);
    return [];
  }
};

// Combined search function
const searchAllApis = async (query) => {
  try {
    // For now, we're only searching Walmart
    const walmartResults = await searchWalmartProducts(query);
    
    // Later we could add more APIs here
    // const krogerResults = await searchKrogerProducts(query);
    
    // Combine results
    return [...walmartResults];
  } catch (error) {
    console.error('Error searching APIs:', error);
    throw error;
  }
};

const SearchResults = () => {
  const { currentUser } = useAuth(); // Get current user from auth context
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Save cart to Firebase for persistence
  const saveCartToFirebase = async (cart) => {
    try {
      if (!currentUser) return;
      
      const cartRef = doc(db, 'carts', currentUser.uid);
      await setDoc(cartRef, {
        userId: currentUser.uid,
        items: cart,
        lastUpdated: new Date().toISOString()
      });
      
      console.log("Cart saved to Firebase:", cart.length, "items");
    } catch (error) {
      console.error("Error saving cart to Firebase:", error);
    }
  };
  
  // Function to add a product to the shopping list
  const addToList = (product) => {
    try {
      // Get existing shopping list from localStorage (using the key 'shoppingCart' to match CartIcon)
      const existingCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
      
      // Set cart owner - either user ID or 'guest'
      const cartOwner = currentUser ? currentUser.uid : 'guest';
      localStorage.setItem('cartOwner', cartOwner);
      
      // Check if product already exists in list
      const existingItemIndex = existingCart.findIndex(item => 
        item.id === product.id && item.source === product.source);
      
      if (existingItemIndex !== -1) {
        // If item exists, increment quantity
        existingCart[existingItemIndex].quantity += 1;
        toast.info(`Increased quantity of ${product.name} in your list`);
      } else {
        // Otherwise add new item with quantity 1
        existingCart.push({
          ...product,
          quantity: 1,
          dateAdded: new Date().toISOString(),
          priceHistory: [{
            price: product.price,
            date: new Date().toISOString()
          }]
        });
        toast.success(`Added ${product.name} to your list`);
      }
      
      // Save updated list to 'shoppingCart'
      localStorage.setItem('shoppingCart', JSON.stringify(existingCart));
      
      // Dispatch a custom event to notify other components (like CartIcon) that cart has changed
      window.dispatchEvent(new Event('cartUpdated'));
      
      // For logged in users, save to database
      if (currentUser) {
        saveCartToFirebase(existingCart);
      }
    } catch (error) {
      console.error('Error adding product to list:', error);
      toast.error('Failed to add product to your list');
    }
  };
  
  // Function to log failed searches
  const logFailedSearch = (searchTerm) => {
    try {
      // Get existing failed searches from localStorage or initialize empty array
      const failedSearches = JSON.parse(localStorage.getItem('failedSearches')) || [];
      
      // Add new failed search
      failedSearches.push({
        searchTerm,
        timestamp: new Date().toISOString()
      });
      
      // Keep only the last 20 failed searches
      if (failedSearches.length > 20) {
        failedSearches.shift();
      }
      
      // Save updated failed searches
      localStorage.setItem('failedSearches', JSON.stringify(failedSearches));
      
      // For logged in users, also save to database (will implement later)
      // if (currentUser) {
      //   logFailedSearchToFirebase(searchTerm);
      // }
    } catch (error) {
      console.error('Error logging failed search:', error);
    }
  };
  
  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log("Searching for:", query);
        
        // Search using real API
        const data = await searchAllApis(query);
        console.log("Search results:", data);
        setResults(data);
        
        // Log failed searches
        if (data.length === 0) {
          logFailedSearch(query);
        }
      } catch (err) {
        console.error('Error searching products:', err);
        setError('Failed to load search results. Please try again.');
        logFailedSearch(query); // Also log when there's an error
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [query]);
  
  // Helper function to get the logo for each source
  const getSourceLogo = (source) => {
    const logos = {
      walmart: 'https://logo.clearbit.com/walmart.com',
      kroger: 'https://logo.clearbit.com/kroger.com',
      target: 'https://logo.clearbit.com/target.com'
    };
    
    return logos[source] || null;
  };
  
  // Helper function to format source name
  const formatSourceName = (source) => {
    if (!source) return '';
    
    return source.charAt(0).toUpperCase() + source.slice(1);
  };
  
  console.log("Current query:", query);
  console.log("Current results:", results);
  console.log("Loading state:", loading);
  
  return (
    <Container>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Title>Search Results for "{query}"</Title>
      <Subtitle>Showing grocery items matching your search</Subtitle>
      
      {loading && <LoadingMessage>Loading search results...</LoadingMessage>}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {!loading && !error && (
        results.length > 0 ? (
          <ResultsGrid>
            {results.map((product, index) => (
              <ProductCard key={`${product.source}-${product.id || index}`}>
                {product.imageUrl && (
                  <ProductImage src={product.imageUrl} alt={product.name} />
                )}
                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>
                    ${typeof product.price === 'number' 
                      ? product.price.toFixed(2) 
                      : parseFloat(product.price || 0).toFixed(2)}
                  </ProductPrice>
                  {product.source && (
                    <ProductSource>
                      {getSourceLogo(product.source) && (
                        <img src={getSourceLogo(product.source)} alt={product.source} />
                      )}
                      {formatSourceName(product.source)}
                    </ProductSource>
                  )}
                  <AddToListButton onClick={() => addToList(product)}>
                    Add to List
                  </AddToListButton>
                </ProductInfo>
              </ProductCard>
            ))}
          </ResultsGrid>
        ) : (
          <ErrorMessage>
            No products found matching "{query}". Please try a different search term.
          </ErrorMessage>
        )
      )}
    </Container>
  );
};

export default SearchResults;