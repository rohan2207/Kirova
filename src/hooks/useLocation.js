// hooks/useUserLocation.js
import { useState, useEffect } from 'react';

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
          
          // Use a reverse geocoding API to get detailed address information
          try {
            // For production, you might want to use Google Maps Geocoding API
            // For now, using Nominatim (OpenStreetMap) as it's free
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`,
              { headers: { 'Accept-Language': 'en-US,en' } }
            );
            
            if (response.ok) {
              const data = await response.json();
              
              // Format the complete location data
              setLocation({
                ...coords,
                address: data.display_name,
                zip: data.address.postcode || '75070', // Default to McKinney zip if not found
                city: data.address.city || data.address.town || data.address.village || 'McKinney',
                state: data.address.state || 'TX',
                country: data.address.country || 'USA',
                formatted_address: `${data.address.road || ''} ${data.address.house_number || ''}, ${data.address.city || data.address.town || 'McKinney'}, ${data.address.state || 'TX'} ${data.address.postcode || '75070'}`
              });
            }
          } catch (geocodeError) {
            console.warn('Error getting address:', geocodeError);
            // Fallback to basic location
            setLocation({
              ...coords,
              zip: '75070', // Default to McKinney zip
              city: 'McKinney',
              state: 'TX',
              country: 'USA'
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