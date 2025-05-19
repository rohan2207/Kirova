// hooks/useUserLocation.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useUserLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);

  // Function to request the user's location
  const requestLocation = () => {
    setIsRequesting(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsRequesting(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Basic location data from browser
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          // Use Nominatim (OpenStreetMap) for reverse geocoding
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1&accept-language=en-US`,
              { 
                headers: { 
                  'Accept-Language': 'en-US,en',
                  // Add a user agent as per Nominatim usage policy
                  'User-Agent': 'Kirova-GroceryApp/1.0'
                } 
              }
            );
            
            if (response.data) {
              const addressData = response.data.address || {};
              
              // Format the complete location data
              setLocation({
                ...coords,
                address: response.data.display_name || '',
                zip: addressData.postcode || '75070', // Default to McKinney zip if not found
                city: addressData.city || addressData.town || addressData.village || 'McKinney',
                state: addressData.state || 'TX',
                country: addressData.country || 'USA',
                formatted_address: `${addressData.road || ''} ${addressData.house_number || ''}, ${addressData.city || addressData.town || 'McKinney'}, ${addressData.state || 'TX'} ${addressData.postcode || '75070'}`
              });
            }
          } catch (geocodeError) {
            console.warn('Error getting address from Nominatim:', geocodeError);
            // Fallback to basic location
            setLocation({
              ...coords,
              zip: '75070', // Default to McKinney zip
              city: 'McKinney',
              state: 'TX',
              country: 'USA',
              address: 'McKinney, TX 75070'
            });
          }
          
          setIsRequesting(false);
        } catch (error) {
          setError('Failed to process location information');
          setIsRequesting(false);
        }
      },
      (error) => {
        let errorMessage = 'Unknown error occurred';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'You denied the request for location.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get your location timed out.';
            break;
          default:
            break;
        }
        
        setError(errorMessage);
        setIsRequesting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Request location when the component mounts
  useEffect(() => {
    requestLocation();
  }, []);

  return {
    location,
    error,
    isRequesting,
    requestLocation
  };
};

export default useUserLocation;