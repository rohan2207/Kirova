const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const axios = require('axios');
const cors = require('cors')({origin: true});

// API endpoint handler
exports.api = onRequest((request, response) => {
  return cors(request, response, async () => {
    logger.info("API request received", {
      path: request.path,
      method: request.method,
      query: request.query
    });
    
    // Handle search endpoint
    if (request.path === '/search' && request.method === 'GET') {
      const query = request.query.query;
      
      if (!query) {
        logger.error("Missing query parameter");
        return response.status(400).json({error: 'Missing query parameter'});
      }
      
      try {
        logger.info(`Searching for: ${query}`);
        
        // For now, we're using a simple proxy to your local API
        // In a real implementation, you would implement the Walmart API authentication here
        const walmartResponse = await axios.get(
          'https://developer.api.walmart.com/api-proxy/service/affil/product/v2/search', 
          {
            params: { 
              query,
              numItems: 10 
            },
            headers: {
              // You would implement your actual authentication here
              // This is just a placeholder
              'WM_SEC.KEY_VERSION': '2',
              'WM_CONSUMER.ID': process.env.WALMART_CONSUMER_ID,
              'WM_CONSUMER.INTIMESTAMP': Date.now().toString(),
              'WM_SEC.AUTH_SIGNATURE': 'placeholder-signature'
            }
          }
        );
        
        logger.info(`Search successful, found ${walmartResponse.data?.items?.length || 0} items`);
        return response.json(walmartResponse.data);
      } catch (error) {
        logger.error('Error calling Walmart API:', error);
        return response.status(500).json({
          error: 'Failed to fetch data from Walmart API',
          details: error.message
        });
      }
    }
    
    // If no endpoint matched
    logger.warn(`Endpoint not found: ${request.path}`);
    return response.status(404).json({error: 'Endpoint not found'});
  });
});