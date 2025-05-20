import * as walmartApi from './walmartApi';
import * as krogerApi from './krogerApi';

// Export all APIs in a unified structure
export const apis = {
  walmart: walmartApi,
  kroger: krogerApi,
  // Add more APIs as they become available
};

// Function to search across all APIs
export const searchAllApis = async (query) => {
  try {
    // Start all searches in parallel
    const walmartResults = walmartApi.searchProducts(query).catch(err => {
      console.error('Walmart API error:', err);
      return [];
    });
    
    const krogerResults = krogerApi.searchProducts(query).catch(err => {
      console.error('Kroger API error:', err);
      return [];
    });
    
    // Wait for all results
    const results = await Promise.all([
      walmartResults,
      krogerResults
    ]);
    
    // Combine and format results
    const combinedResults = [
      ...results[0].map(item => ({ ...item, source: 'walmart' })),
      ...results[1].map(item => ({ ...item, source: 'kroger' }))
    ];
    
    // Sort by relevance or other criteria
    return combinedResults;
  } catch (error) {
    console.error('Error searching all APIs:', error);
    return [];
  }
};

// Export individual API modules for direct use
export { walmartApi, krogerApi };