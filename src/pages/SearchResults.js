// src/pages/SearchResults.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { searchAllApis } from '../services/apis';

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
  }
`;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Search across all available APIs
        const data = await searchAllApis(query);
        console.log("Search results:", data); // Debug log
        setResults(data);
      } catch (err) {
        console.error('Error searching products:', err);
        setError('Failed to load search results. Please try again.');
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
  
  return (
    <Container>
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
                  <ProductPrice>${parseFloat(product.price).toFixed(2)}</ProductPrice>
                  {product.source && (
                    <ProductSource>
                      {getSourceLogo(product.source) && (
                        <img src={getSourceLogo(product.source)} alt={product.source} />
                      )}
                      {formatSourceName(product.source)}
                    </ProductSource>
                  )}
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