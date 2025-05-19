// src/hooks/useNearbyStores.js
import { useState, useEffect } from 'react';
import axios from 'axios';

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  
  // Convert to miles and round to 1 decimal place
  return Math.round(distance * 0.621371 * 10) / 10;
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

// Fallback mock data for development or if API fails
const MOCK_STORES = [
  {
    id: '1',
    name: 'Walmart Supercenter',
    address: '8801 Ohio Dr, McKinney, TX 75070',
    lat: 33.1553,
    lon: -96.6983,
    distance: 1.2,
    type: 'Superstore',
    deliveryTime: '10:30am',
    priceLevel: 1,
    hasInStorePrice: true,
    acceptsEbt: true,
    offers: '$10 off'
  },
  {
    id: '2',
    name: 'Kroger',
    address: '1801 Lake Forest Dr, McKinney, TX 75070',
    lat: 33.1702,
    lon: -96.6965,
    distance: 1.8,
    type: 'Grocery',
    deliveryTime: '11:15am',
    priceLevel: 2,
    hasInStorePrice: true,
    acceptsEbt: true,
    offers: null
  },
  {
    id: '3',
    name: 'Target',
    address: '2025 N Central Expy, McKinney, TX 75071',
    lat: 33.2102,
    lon: -96.6352,
    distance: 2.3,
    type: 'Superstore',
    deliveryTime: '12:00pm',
    priceLevel: 2,
    hasInStorePrice: false,
    acceptsEbt: true,
    offers: '$5 off'
  },
  {
    id: '4',
    name: 'Whole Foods Market',
    address: '3321 Preston Rd, Frisco, TX 75034',
    lat: 33.1142,
    lon: -96.8032,
    distance: 3.7,
    type: 'Natural',
    deliveryTime: '1:45pm',
    priceLevel: 3,
    hasInStorePrice: true,
    acceptsEbt: false,
    offers: null
  }
];

// Cache store data in localStorage
const cacheStoreData = (locationKey, storeData) => {
  try {
    // Create a location-based cache key
    const cacheKey = `kirova_stores_${locationKey}`;
    
    // Store the data with timestamp
    const cacheData = {
      stores: storeData,
      timestamp: new Date().toISOString(),
      version: '1.0' // For cache invalidation if needed
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`Cached store data for location: ${locationKey}`);
  } catch (error) {
    console.error("Error caching store data:", error);
  }
};

// Get cached store data from localStorage
const getCachedStoreData = (locationKey) => {
  try {
    const cacheKey = `kirova_stores_${locationKey}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (!cachedData) return null;
    
    const data = JSON.parse(cachedData);
    
    // Check if cache is fresh (less than 24 hours old)
    const timestamp = new Date(data.timestamp);
    const now = new Date();
    const cacheAge = now - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (cacheAge > maxAge) {
      // Cache is stale, remove it
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data.stores;
  } catch (error) {
    console.error("Error retrieving cached store data:", error);
    return null;
  }
};

// Cache geocoding results
const cacheGeocodingResult = (query, result) => {
  try {
    const geocodingCache = JSON.parse(localStorage.getItem('kirova_geocoding_cache') || '{}');
    geocodingCache[query] = {
      result,
      timestamp: new Date().toISOString()
    };
    
    // Limit cache size to prevent localStorage from getting too big
    const cacheKeys = Object.keys(geocodingCache);
    if (cacheKeys.length > 50) {
      // Remove oldest entries
      const sortedKeys = cacheKeys.sort((a, b) => 
        new Date(geocodingCache[a].timestamp) - new Date(geocodingCache[b].timestamp)
      );
      const keysToRemove = sortedKeys.slice(0, cacheKeys.length - 50);
      keysToRemove.forEach(key => delete geocodingCache[key]);
    }
    
    localStorage.setItem('kirova_geocoding_cache', JSON.stringify(geocodingCache));
  } catch (error) {
    console.error("Error caching geocoding result:", error);
  }
};

// Get cached geocoding result
const getCachedGeocodingResult = (query) => {
  try {
    const geocodingCache = JSON.parse(localStorage.getItem('kirova_geocoding_cache') || '{}');
    const cachedResult = geocodingCache[query];
    
    if (!cachedResult) return null;
    
    // Check if cache is fresh (less than 7 days old)
    const timestamp = new Date(cachedResult.timestamp);
    const now = new Date();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    if (now - timestamp > maxAge) return null;
    
    return cachedResult.result;
  } catch (error) {
    console.error("Error retrieving cached geocoding result:", error);
    return null;
  }
};

// Map the store type based on the store name or tags
const getStoreType = (name, tags) => {
  if (!name) return 'Grocery';
  
  const nameLC = name.toLowerCase();
  
  // Check specific tags first
  if (tags) {
    if (tags.brand === 'Walmart' || tags.brand === 'Target') return 'Superstore';
    if (tags.brand === 'Kroger' || tags.brand === 'HEB') return 'Grocery';
    if (tags.brand === 'Costco' || tags.brand === 'Sam\'s Club') return 'Wholesale';
    if (tags.brand === 'Aldi') return 'Discount';
    if (tags.brand === 'Sprouts' || tags.brand === 'Whole Foods' || tags.brand === 'Trader Joe\'s') return 'Natural';
  }
  
  // Then check name
  if (nameLC.includes('walmart') || nameLC.includes('target')) return 'Superstore';
  if (nameLC.includes('kroger') || nameLC.includes('heb')) return 'Grocery';
  if (nameLC.includes('costco') || nameLC.includes('sam')) return 'Wholesale';
  if (nameLC.includes('aldi')) return 'Discount';
  if (nameLC.includes('sprouts') || nameLC.includes('whole') || nameLC.includes('trader')) return 'Natural';
  
  return 'Grocery';
};

// Generate random delivery time for demo purposes
const getRandomDeliveryTime = () => {
  const hours = [10, 11, 12, 1, 2, 3, 4, 5];
  const minutes = ['00', '15', '30', '45'];
  const ampm = ['am', 'pm'];
  
  const hour = hours[Math.floor(Math.random() * hours.length)];
  const minute = minutes[Math.floor(Math.random() * minutes.length)];
  const period = ampm[Math.floor(Math.random() * ampm.length)];
  
  return `${hour}:${minute}${period}`;
};

// Generate price level (1-3) based on store name
const getPriceLevel = (name) => {
  const nameLC = name?.toLowerCase() || '';
  
  // Assign price levels based on known store brands
  if (nameLC.includes('walmart') || nameLC.includes('aldi')) return 1;
  if (nameLC.includes('kroger') || nameLC.includes('target') || nameLC.includes('heb')) return 2;
  if (nameLC.includes('whole foods') || nameLC.includes('central market')) return 3;
  
  // For unknown stores, weight towards middle price point
  const rnd = Math.random();
  if (rnd < 0.3) return 1;
  if (rnd < 0.8) return 2;
  return 3;
};

// Generate realistic offers for stores
const generateOffer = (name) => {
  // Weight offers to be more common for discount stores
  const nameLC = name?.toLowerCase() || '';
  const rnd = Math.random();
  
  // Higher chance of offers for discount retailers
  const threshold = nameLC.includes('walmart') || nameLC.includes('aldi') ? 0.6 : 0.7;
  
  if (rnd > threshold) {
    const offerTypes = [
      `$${Math.floor(Math.random() * 15) + 5} off`, 
      `${Math.floor(Math.random() * 20) + 10}% off`,
      'Free delivery',
      'BOGO deals'
    ];
    return offerTypes[Math.floor(Math.random() * offerTypes.length)];
  }
  
  return null;
};

// List of streets for fallback address generation - use current city/state when possible
const getStreets = (city = null) => {
  // New York streets
  if (city && city.toLowerCase().includes('new york')) {
    return [
      "Broadway", "5th Avenue", "Park Avenue", "Madison Avenue", "Lexington Avenue",
      "3rd Avenue", "2nd Avenue", "1st Avenue", "Amsterdam Avenue", "W 42nd Street",
      "W 34th Street", "Canal Street", "Houston Street", "Bleecker Street", "Christopher Street"
    ];
  }
  
  // Generic streets if no match
  return [
    "Main St", "Oak St", "Pine St", "Maple Ave", "Washington St",
    "Franklin St", "Highland Ave", "Park Place", "2nd Street", "Jefferson Ave"
  ];
};

// Generate realistic address for stores missing address information
const generateFallbackAddress = (lat, lon, city = "McKinney", state = "TX", zip = "75070") => {
  const streets = getStreets(city);
  const streetNumber = Math.floor(Math.random() * 9000) + 1000;
  const street = streets[Math.floor(Math.random() * streets.length)];
  return `${streetNumber} ${street}, ${city}, ${state} ${zip}`;
};

// Ensure store object has all required fields with valid values (no undefined)
const sanitizeStoreData = (store, city = null, state = null) => {
  // Use provided city/state from location if available
  const storeCity = city || store.city || "McKinney";
  const storeState = state || store.state || "TX";
  const storeZip = store.zip || "75070";
  
  return {
    // Required fields with fallbacks
    id: store.id || `store-${Math.random().toString(36).substring(2, 9)}`,
    name: store.name || "Local Grocery Store",
    address: store.address || generateFallbackAddress(store.lat, store.lon, storeCity, storeState, storeZip),
    city: storeCity,
    state: storeState,
    lat: typeof store.lat === 'number' ? store.lat : 33.1972,
    lon: typeof store.lon === 'number' ? store.lon : -96.6397,
    distance: typeof store.distance === 'number' ? store.distance : 0,
    
    // Optional fields with appropriate defaults
    type: store.type || "Grocery",
    deliveryTime: store.deliveryTime || getRandomDeliveryTime(),
    priceLevel: typeof store.priceLevel === 'number' ? store.priceLevel : 2,
    hasInStorePrice: typeof store.hasInStorePrice === 'boolean' ? store.hasInStorePrice : true,
    acceptsEbt: typeof store.acceptsEbt === 'boolean' ? store.acceptsEbt : false,
    
    // Other fields
    offers: store.offers || null,
    hasPlaceholderData: true
  };
};

// Should we fetch new data based on location changes or login?
const shouldRefreshStores = () => {
  // Check for location change flag
  const locationChanged = localStorage.getItem('kirova_location_changed');
  if (locationChanged === 'true') {
    localStorage.removeItem('kirova_location_changed');
    return true;
  }
  
  // Check if user just logged in
  const justLoggedIn = sessionStorage.getItem('kirova_just_logged_in');
  if (justLoggedIn === 'true') {
    sessionStorage.removeItem('kirova_just_logged_in');
    return true;
  }
  
  // Check last fetch time
  const lastFetch = localStorage.getItem('kirova_last_store_fetch');
  if (!lastFetch) return true;
  
  // If it's been more than 24 hours since last fetch, refresh
  const lastFetchDate = new Date(lastFetch);
  const now = new Date();
  const hoursSinceLastFetch = (now - lastFetchDate) / (1000 * 60 * 60);
  
  return hoursSinceLastFetch > 24;
};

const useNearbyStores = (locationParams) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      
      // Check localStorage for most recent location
      const storedCity = localStorage.getItem('userCity');
      const storedState = localStorage.getItem('userState');
      const storedZip = localStorage.getItem('userZip');
      
      // Create a location key for cache lookup
      const locationKey = storedCity && storedState 
        ? `${storedCity.toLowerCase()}_${storedState.toLowerCase()}`
        : storedZip || 'default';
      
      // Check if we should use cached data (if available)
      const shouldRefresh = shouldRefreshStores();
      
      if (!shouldRefresh) {
        // Try to use cached data first
        const cachedStores = getCachedStoreData(locationKey);
        
        if (cachedStores) {
          console.log("Using cached store data for:", locationKey);
          setStores(cachedStores);
          setLoading(false);
          return;
        }
      }
      
      // If we get here, we need to fetch fresh data
      console.log("Fetching fresh store data for:", locationKey);
      
      // Track fetch time
      localStorage.setItem('kirova_last_store_fetch', new Date().toISOString());
      
      // Check if we have location parameters
      if (!locationParams && !storedCity) {
        setStores(MOCK_STORES.map(store => sanitizeStoreData(store)));
        setLoading(false);
        return;
      }
      
      // Determine location coordinates
      let userLat, userLon, userCity, userState, userZip;
      
      // Use stored location first if available
      if (storedCity && storedState) {
        try {
          // Check for cached geocoding results first
          const geocodeQuery = `${storedCity},${storedState}`;
          const cachedGeocodingResult = getCachedGeocodingResult(geocodeQuery);
          
          if (cachedGeocodingResult) {
            console.log("Using cached geocoding for:", geocodeQuery);
            userLat = cachedGeocodingResult.lat;
            userLon = cachedGeocodingResult.lon;
            userCity = storedCity;
            userState = storedState;
            userZip = storedZip || '';
          } else {
            // Geocode the stored city/state
            console.log("Geocoding:", geocodeQuery);
            const geocodeResponse = await axios.get(
              `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(storedCity)}&state=${encodeURIComponent(storedState)}&country=USA&format=json&limit=1`,
              { headers: { 
                'Accept-Language': 'en-US,en',
                'User-Agent': 'Kirova-GroceryApp/1.0'
              }}
            );
            
            if (geocodeResponse.data && geocodeResponse.data.length > 0) {
              console.log(`Successfully geocoded: ${storedCity}, ${storedState}`);
              userLat = parseFloat(geocodeResponse.data[0].lat);
              userLon = parseFloat(geocodeResponse.data[0].lon);
              userCity = storedCity;
              userState = storedState;
              userZip = storedZip || '';
              
              // Cache the geocoding result
              cacheGeocodingResult(geocodeQuery, { lat: userLat, lon: userLon });
            } else {
              throw new Error('Could not geocode stored location');
            }
          }
        } catch (geocodeError) {
          console.error('Error geocoding stored location:', geocodeError);
          // Fallback to location params
        }
      }
      
      // If we couldn't use stored location, extract from location params
      if (!userLat && locationParams) {
        let { zip, lat, lon, latitude, longitude, city, state } = 
          typeof locationParams === 'string' 
            ? { zip: locationParams } // If just a zip code was passed
            : locationParams;        // Otherwise use the full object
        
        // If we have coordinates, use them
        if (latitude && longitude) {
          userLat = latitude;
          userLon = longitude;
          userCity = city || storedCity || 'McKinney';
          userState = state || storedState || 'TX';
          userZip = zip || storedZip || '75070';
        } else if (lat && lon) {
          userLat = lat;
          userLon = lon;
          userCity = city || storedCity || 'McKinney';
          userState = state || storedState || 'TX';
          userZip = zip || storedZip || '75070';
        } else if (zip) {
          // Check for cached zip geocoding
          const zipQuery = `zip_${zip}`;
          const cachedZipGeocoding = getCachedGeocodingResult(zipQuery);
          
          if (cachedZipGeocoding) {
            userLat = cachedZipGeocoding.lat;
            userLon = cachedZipGeocoding.lon;
            userCity = cachedZipGeocoding.city || storedCity || 'McKinney';
            userState = cachedZipGeocoding.state || storedState || 'TX';
            userZip = zip;
          } else {
            // Geocode the ZIP code
            try {
              const geocodeResponse = await axios.get(
                `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=USA&format=json&limit=1`,
                { headers: { 
                  'Accept-Language': 'en-US,en',
                  'User-Agent': 'Kirova-GroceryApp/1.0'
                }}
              );
              
              if (geocodeResponse.data && geocodeResponse.data.length > 0) {
                userLat = parseFloat(geocodeResponse.data[0].lat);
                userLon = parseFloat(geocodeResponse.data[0].lon);
                userCity = geocodeResponse.data[0].address?.city || 
                          geocodeResponse.data[0].address?.town || 
                          geocodeResponse.data[0].address?.village || 
                          storedCity || 'McKinney';
                userState = geocodeResponse.data[0].address?.state || storedState || 'TX';
                userZip = zip;
                
                // Cache the geocoding result
                cacheGeocodingResult(zipQuery, { 
                  lat: userLat, 
                  lon: userLon,
                  city: userCity,
                  state: userState
                });
              } else {
                throw new Error('Could not geocode ZIP code');
              }
            } catch (geocodeError) {
              console.error('Error geocoding ZIP:', geocodeError);
              // Fallback to default coordinates or stored values
              userLat = 33.1972; // Default to McKinney
              userLon = -96.6397;
              userCity = storedCity || 'McKinney';
              userState = storedState || 'TX';
              userZip = storedZip || '75070';
            }
          }
        }
      }
      
      // If we still don't have location, use defaults
      if (!userLat || !userLon) {
        console.log("Using default location (McKinney, TX)");
        userLat = 33.1972; // Default to McKinney
        userLon = -96.6397;
        userCity = storedCity || 'McKinney';
        userState = storedState || 'TX';
        userZip = storedZip || '75070';
      }
      
      console.log(`Fetching stores near: ${userCity}, ${userState} (${userLat}, ${userLon})`);
      
      // Now that we have coordinates, search for nearby grocery stores using Overpass API
      try {
        // Build Overpass query - find supermarkets, grocery stores within 10km radius
        const overpassQuery = `
          [out:json];
          (
            node["shop"="supermarket"](around:10000,${userLat},${userLon});
            way["shop"="supermarket"](around:10000,${userLat},${userLon});
            node["shop"="grocery"](around:10000,${userLat},${userLon});
            way["shop"="grocery"](around:10000,${userLat},${userLon});
          );
          out body;
          >;
          out skel qt;
        `;
        
        const overpassResponse = await axios.post(
          'https://overpass-api.de/api/interpreter',
          overpassQuery,
          { 
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 10000 // 10 second timeout
          }
        );
        
        if (overpassResponse.data && overpassResponse.data.elements) {
          // Filter for nodes (point locations) with tags
          const storeElements = overpassResponse.data.elements.filter(
            element => (element.type === 'node' || element.type === 'way') && element.tags
          );
          
          if (storeElements.length > 0) {
            // Process the results into store objects compatible with our StoreCard
            let storeResults = storeElements.map(element => {
              // Format address from OSM data or generate fallback
              let address = '';
              if (element.tags['addr:housenumber'] && element.tags['addr:street']) {
                address = `${element.tags['addr:housenumber']} ${element.tags['addr:street']}`;
                if (element.tags['addr:city']) {
                  address += `, ${element.tags['addr:city']}`;
                } else if (userCity) {
                  address += `, ${userCity}`;
                }
                if (element.tags['addr:postcode']) {
                  address += ` ${element.tags['addr:postcode']}`;
                } else if (userZip) {
                  address += ` ${userZip}`;
                }
              } else {
                // Generate fallback address using current location context
                address = generateFallbackAddress(element.lat, element.lon, userCity, userState, userZip);
              }
              
              // Get store name, preferring the name tag but falling back to brand
              const name = element.tags.name || element.tags.brand || 'Local Grocery Store';
              
              // Get store type based on tags and name
              const type = getStoreType(name, element.tags);
              
              // Price level based on store name/brand
              const priceLevel = getPriceLevel(name);
              
              // Calculate distance
              const distance = calculateDistance(
                userLat, 
                userLon, 
                element.lat || element.center?.lat, 
                element.lon || element.center?.lon
              );
              
              // Generate random delivery time
              const deliveryTime = getRandomDeliveryTime();
              
              // Generate offers data (highlighted as placeholder)
              const offers = generateOffer(name);
              
              // Generate placeholder features (highlighted as placeholders)
              const hasInStorePrice = Math.random() > 0.4; // 60% chance of true
              const acceptsEbt = Math.random() > 0.3; // 70% chance of true
              
              return {
                id: element.id.toString(),
                name: name,
                address: address,
                city: userCity,
                state: userState,
                lat: element.lat || element.center?.lat,
                lon: element.lon || element.center?.lon,
                distance: distance,
                type: type,
                deliveryTime: deliveryTime, // PLACEHOLDER
                priceLevel: priceLevel,
                hasInStorePrice: hasInStorePrice, // PLACEHOLDER 
                acceptsEbt: acceptsEbt, // PLACEHOLDER
                offers: offers, // PLACEHOLDER
                isRealLocation: true,
                hasPlaceholderData: true // Flag to indicate enhanced fields are placeholders
              };
            });
            
            // Remove duplicates (same store name within 0.2 miles)
            const uniqueStores = [];
            const storeMap = new Map();
            
            storeResults.forEach(store => {
              const key = store.name.toLowerCase();
              
              if (!storeMap.has(key)) {
                storeMap.set(key, store);
                uniqueStores.push(store);
              } else {
                const existingStore = storeMap.get(key);
                // Keep the closer store
                if (store.distance < existingStore.distance) {
                  const index = uniqueStores.findIndex(s => s.name.toLowerCase() === key);
                  if (index !== -1) {
                    uniqueStores[index] = store;
                    storeMap.set(key, store);
                  }
                }
              }
            });
            
            // Sort by distance
            uniqueStores.sort((a, b) => a.distance - b.distance);
            
            // Sanitize to ensure no undefined values that could cause Firestore errors
            const sanitizedStores = uniqueStores.map(store => 
              sanitizeStoreData(store, userCity, userState)
            );
            
            // Cache the store data for this location
            cacheStoreData(locationKey, sanitizedStores);
            
            setStores(sanitizedStores);
          } else {
            console.log("No real stores found, using mock data");
            // If no real stores found, fall back to mock data but use real location
            const updatedMockStores = MOCK_STORES.map(store => sanitizeStoreData(
              {
                ...store,
                distance: calculateDistance(userLat, userLon, store.lat, store.lon),
                hasPlaceholderData: true // Flag mock data
              },
              userCity,
              userState
            ));
            
            // Cache the mock stores too
            cacheStoreData(locationKey, updatedMockStores);
            
            setStores(updatedMockStores);
          }
        } else {
          console.log("Invalid API response, using mock data");
          // If API fails, use mock data but with real distances
          const updatedMockStores = MOCK_STORES.map(store => sanitizeStoreData(
            {
              ...store,
              distance: calculateDistance(userLat, userLon, store.lat, store.lon),
              hasPlaceholderData: true // Flag mock data
            },
            userCity,
            userState
          ));
          
          // Cache the mock stores too
          cacheStoreData(locationKey, updatedMockStores);
          
          setStores(updatedMockStores);
        }
      } catch (overpassError) {
        console.error('Error fetching places from Overpass API:', overpassError);
        // Fall back to mock data with calculated distances
        const updatedMockStores = MOCK_STORES.map(store => sanitizeStoreData(
          {
            ...store,
            distance: calculateDistance(userLat, userLon, store.lat, store.lon),
            hasPlaceholderData: true // Flag mock data
          },
          userCity,
          userState
        ));
        
        // Cache the mock stores too
        cacheStoreData(locationKey, updatedMockStores);
        
        setStores(updatedMockStores);
      }
      
      setError(null);
      setLoading(false);
    };

    fetchStores();
  }, [locationParams]);

  return { stores, loading, error };
};

export default useNearbyStores;