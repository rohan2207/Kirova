// src/components/navbar/LocationSelector.js
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import useUserLocation from '../../hooks/useUserLocation';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';

// Styled components
const LocationButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 8px 12px;
  font-size: 14px;
  color: #343538;
  cursor: pointer;

  &:hover {
    background-color: #f7f7f7;
    border-radius: 8px;
  }
`;

const LocationIcon = styled.div`
  margin-right: 6px;
  display: flex;
  align-items: center;

  svg {
    width: 18px;
    height: 18px;
    color: #2F8A11;
  }
`;

const LocationText = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1100;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  left: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const ModalTitle = styled.h2`
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #333;
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  font-size: 15px;
  
  &:focus {
    outline: none;
    border-color: #2F8A11;
    box-shadow: 0 0 0 2px rgba(47, 138, 17, 0.1);
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const SectionTitle = styled.div`
  margin: 12px 0 8px;
  font-weight: 500;
  color: #666;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
`;

const SavedAddressItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  background-color: ${props => props.active ? '#f0f8f0' : 'transparent'};
  border-radius: 4px;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const AddressIcon = styled.div`
  margin-right: 16px;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: #2F8A11;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const AddressInfo = styled.div`
  flex: 1;
`;

const AddressLine = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #333;
`;

const AddressSecondary = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: #2F8A11;
  font-weight: 500;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CurrentLocationButton = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  background-color: ${props => props.active ? '#f0f8f0' : 'transparent'};
  border-radius: 4px;
  
  &:hover {
    background-color: #f0f8f0;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(47, 138, 17, 0.2);
  border-radius: 50%;
  border-top-color: #2F8A11;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const AutocompleteList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #dcdcdc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  z-index: 10;
  margin: 0;
  padding: 0;
  list-style: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const AutocompleteItem = styled.li`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  
  &:hover {
    background-color: #f9f9f9;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const LocationSelector = ({ currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressSearch, setAddressSearch] = useState('');
  const [homeAddress, setHomeAddress] = useState(null);
  const [primaryAddress, setPrimaryAddress] = useState(null);
  const [recentLocations, setRecentLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [displayLocation, setDisplayLocation] = useState('');
  
  const navigate = useNavigate();
  const locationPath = window.location.pathname; // Get current path for refresh check
  const autocompleteRef = useRef(null);
  
  // Use location hook
  const { location: userLocation, error: locationHookError, requestLocation } = useUserLocation();
  
  // Listen for location changes that might happen elsewhere in the app
  useEffect(() => {
    const handleStorageChange = () => {
      const locationChanged = localStorage.getItem('kirova_location_changed');
      if (locationChanged === 'true') {
        // Reset the flag
        localStorage.setItem('kirova_location_changed', 'false');
        
        const city = localStorage.getItem('userCity');
        const state = localStorage.getItem('userState');
        
        if (city && state) {
          setDisplayLocation(`${city}, ${state}`);
        }
      }
    };
    
    // Check on mount and whenever focus returns to window
    handleStorageChange();
    window.addEventListener('focus', handleStorageChange);
    return () => window.removeEventListener('focus', handleStorageChange);
  }, []);
  
  // Function to create a standardized address from profile fields
  const createAddressFromFields = (userData) => {
    if (!userData.city || !userData.state) return null;
    
    return {
      id: `primary-${Date.now()}`,
      line1: userData.address || "",
      city: userData.city,
      state: userData.state,
      zip: userData.zip || "",
      isHome: true,
      timestamp: new Date().toISOString()
    };
  };
  
  // Load user addresses on component mount
  useEffect(() => {
    const loadUserAddresses = async () => {
      try {
        console.log("Loading user addresses...");
        // 1. Check user profile first if logged in
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data() || {};
          
          console.log("User profile data:", userData);
          
          // Primary address gets highest priority - check it first
          let foundPrimaryAddress = false;
          
          // Check for primaryAddress object
          if (userData.primaryAddress && userData.primaryAddress.city && userData.primaryAddress.state) {
            console.log("Found primary address object:", userData.primaryAddress);
            setPrimaryAddress(userData.primaryAddress);
            setCurrentLocation(userData.primaryAddress);
            setHomeAddress(userData.primaryAddress);
            setDisplayLocation(`${userData.primaryAddress.city}, ${userData.primaryAddress.state}`);
            foundPrimaryAddress = true;
            
            // Save to localStorage
            localStorage.setItem('userCity', userData.primaryAddress.city);
            localStorage.setItem('userState', userData.primaryAddress.state);
            localStorage.setItem('userZip', userData.primaryAddress.zip || '');
            localStorage.setItem('userAddress', userData.primaryAddress.line1 || '');
          } 
          // If not, try to construct from individual fields
          else if (userData.city && userData.state) {
            console.log("Creating primary address from fields");
            const constructedAddress = createAddressFromFields(userData);
            
            if (constructedAddress) {
              setPrimaryAddress(constructedAddress);
              setCurrentLocation(constructedAddress);
              setHomeAddress(constructedAddress);
              setDisplayLocation(`${constructedAddress.city}, ${constructedAddress.state}`);
              foundPrimaryAddress = true;
              
              // Save this constructed address back to user profile
              await updateDoc(doc(db, 'users', currentUser.uid), {
                primaryAddress: constructedAddress
              });
              
              // Save to localStorage
              localStorage.setItem('userCity', constructedAddress.city);
              localStorage.setItem('userState', constructedAddress.state);
              localStorage.setItem('userZip', constructedAddress.zip || '');
              localStorage.setItem('userAddress', constructedAddress.line1 || '');
            }
          }
          
          // Then check for most recently used location if we didn't find a primary address
          // or if we have a lastUsedLocation that's different from primary
          if (userData.lastUsedLocation && userData.lastUsedLocation.city && userData.lastUsedLocation.state) {
            console.log("Found last used location:", userData.lastUsedLocation);
            
            if (!foundPrimaryAddress || 
                (userData.primaryAddress && 
                 (userData.lastUsedLocation.city !== userData.primaryAddress.city || 
                  userData.lastUsedLocation.state !== userData.primaryAddress.state))) {
              setCurrentLocation(userData.lastUsedLocation);
              setHomeAddress(userData.lastUsedLocation);
              setDisplayLocation(`${userData.lastUsedLocation.city}, ${userData.lastUsedLocation.state}`);
              
              // Save to localStorage
              localStorage.setItem('userCity', userData.lastUsedLocation.city);
              localStorage.setItem('userState', userData.lastUsedLocation.state);
              localStorage.setItem('userZip', userData.lastUsedLocation.zip || '');
              localStorage.setItem('userAddress', userData.lastUsedLocation.line1 || '');
            }
          }
          
          // Load recent locations (if any)
          if (userData.recentLocations && Array.isArray(userData.recentLocations)) {
            // Sort by timestamp and limit to 5
            const sortedLocations = [...userData.recentLocations]
              .filter(loc => loc && loc.city && loc.state) // Filter out invalid entries
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 5);
            
            console.log("Setting recent locations:", sortedLocations);
            setRecentLocations(sortedLocations);
          }
          
          return;
        }
        
        // 2. Check localStorage if no user profile address
        const storedCity = localStorage.getItem('userCity');
        const storedState = localStorage.getItem('userState');
        const storedZip = localStorage.getItem('userZip');
        const storedAddress = localStorage.getItem('userAddress');
        
        if (storedCity && storedState) {
          const currentAddr = {
            id: 'current',
            line1: storedAddress || `${storedCity}, ${storedState} ${storedZip || ''}`,
            city: storedCity,
            state: storedState,
            zip: storedZip || '',
            isHome: false,
            timestamp: new Date().toISOString()
          };
          
          setCurrentLocation(currentAddr);
          setHomeAddress(currentAddr);
          setDisplayLocation(`${storedCity}, ${storedState}`);
        }
      } catch (error) {
        console.error("Error loading user addresses:", error);
      }
    };
    
    loadUserAddresses();
  }, [currentUser]);
  
  // Update from geolocation if available
  useEffect(() => {
    if (userLocation) {
      // Check if we specifically requested to use current location
      const forceUseCurrentLocation = isGettingLocation;
      
      // Use browser location if no home address is set OR if we specifically requested current location
      if (!homeAddress || forceUseCurrentLocation) {
        const locationText = userLocation.city && userLocation.state
          ? `${userLocation.city}, ${userLocation.state}`
          : userLocation.zip || 'Location set';
          
        setDisplayLocation(locationText);
        
        // Create address from browser location
        if (userLocation.city && userLocation.state) {
          const newAddress = {
            id: `loc-${Date.now()}`,
            line1: userLocation.address || locationText,
            city: userLocation.city,
            state: userLocation.state,
            zip: userLocation.zip || '',
            lat: userLocation.latitude,
            lon: userLocation.longitude,
            isHome: false,
            timestamp: new Date().toISOString()
          };
          
          setCurrentLocation(newAddress);
          setHomeAddress(newAddress);
          
          // Save to localStorage
          localStorage.setItem('userCity', userLocation.city);
          localStorage.setItem('userState', userLocation.state);
          if (userLocation.zip) localStorage.setItem('userZip', userLocation.zip);
          if (userLocation.address) localStorage.setItem('userAddress', userLocation.address);
          
          // Set flag to indicate location change
          localStorage.setItem('kirova_location_changed', 'true');
          
          // Save to user profile if logged in
          if (currentUser) {
            const saveLocationToProfile = async () => {
              try {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                const userData = userDoc.data() || {};
                
                // Update recent locations
                let updatedRecentLocations = userData.recentLocations || [];
                
                // Add current location if not already in the list
                const isDuplicate = updatedRecentLocations.some(
                  loc => loc.city === newAddress.city && loc.state === newAddress.state
                );
                
                if (!isDuplicate) {
                  updatedRecentLocations.unshift(newAddress);
                  
                  // Sort by timestamp and limit to 5
                  updatedRecentLocations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                  updatedRecentLocations = updatedRecentLocations.slice(0, 5);
                }
                
                // Update the user document with the new location and also update individual fields
                await updateDoc(doc(db, 'users', currentUser.uid), {
                  recentLocations: updatedRecentLocations,
                  lastUsedLocation: newAddress,
                  city: newAddress.city,
                  state: newAddress.state,
                  zip: newAddress.zip,
                  address: newAddress.line1
                });
                
                // Update local state
                setRecentLocations(updatedRecentLocations);
              } catch (error) {
                console.error("Error saving location to profile:", error);
              }
            };
            
            // Call the async function
            saveLocationToProfile();
          }
        }
      }
      
      // Close location modal if it was getting location
      if (isGettingLocation) {
        setIsGettingLocation(false);
        setTimeout(() => {
          setIsModalOpen(false);
        }, 500);
      }
    }
  }, [userLocation, homeAddress, currentUser, isGettingLocation]);
  
  useEffect(() => {
    // If location hook returns an error, update UI
    if (locationHookError) {
      console.log("Location hook error:", locationHookError);
      setIsGettingLocation(false);
    }
  }, [locationHookError]);
  
  // Debounced function for address autocomplete
  const fetchAddressSuggestions = useRef(
    debounce(async (input) => {
      if (!input || input.length < 3) {
        setAutocompleteResults([]);
        setShowAutocomplete(false);
        return;
      }
      
      try {
        setIsSearching(true);
        const encodedInput = encodeURIComponent(input);
        
        // Call the OpenStreetMap Nominatim API for address suggestions
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodedInput}&format=json&limit=5&addressdetails=1&countrycodes=us`,
          {
            headers: {
              'Accept-Language': 'en-US,en',
              'User-Agent': 'Kirova-GroceryApp/1.0'
            }
          }
        );
        
        if (response.data && response.data.length > 0) {
          // Format the suggestions
          const suggestions = response.data.map(item => ({
            id: item.place_id,
            displayName: item.display_name,
            address: {
              line1: `${item.address.house_number || ''} ${item.address.road || ''}`.trim(),
              city: item.address.city || item.address.town || item.address.village || '',
              state: item.address.state || '',
              zip: item.address.postcode || '',
              fullAddress: item.display_name
            },
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon)
          }));
          
          setAutocompleteResults(suggestions);
          setShowAutocomplete(true);
        } else {
          setAutocompleteResults([]);
          setShowAutocomplete(false);
        }
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
        setAutocompleteResults([]);
        setShowAutocomplete(false);
      } finally {
        setIsSearching(false);
      }
    }, 500)
  ).current;
  
  // Handle click outside autocomplete list
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowAutocomplete(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle address search input changes
  const handleAddressInputChange = (e) => {
    const input = e.target.value;
    setAddressSearch(input);
    
    // Trigger debounced autocomplete
    if (input.length >= 3) {
      fetchAddressSuggestions(input);
    } else {
      setShowAutocomplete(false);
      setAutocompleteResults([]);
    }
  };
  
  const handleAutocompleteSelect = (suggestion) => {
    // Select the suggestion and fill in the search field
    setAddressSearch(suggestion.displayName);
    setShowAutocomplete(false);
    
    // Process and save this address
    saveSelectedAddress(suggestion);
  };
  
  const handleAddressSearch = (e) => {
    e.preventDefault();
    
    if (!addressSearch.trim()) return;
    
    // If we already have autocomplete results, use the first one
    if (autocompleteResults.length > 0) {
      handleAutocompleteSelect(autocompleteResults[0]);
      return;
    }
    
    // Otherwise, try to geocode the entered text
    fetchAndProcessAddress(addressSearch);
  };
  
  const fetchAndProcessAddress = async (searchText) => {
    setIsSearching(true);
    
    try {
      const encodedAddress = encodeURIComponent(searchText);
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&addressdetails=1&countrycodes=us`,
        { headers: { 
          'Accept-Language': 'en-US,en',
          'User-Agent': 'Kirova-GroceryApp/1.0'
        }}
      );
      
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        
        const suggestion = {
          id: result.place_id,
          displayName: result.display_name,
          address: {
            line1: `${result.address.house_number || ''} ${result.address.road || ''}`.trim(),
            city: result.address.city || result.address.town || result.address.village || '',
            state: result.address.state || '',
            zip: result.address.postcode || '',
            fullAddress: result.display_name
          },
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon)
        };
        
        saveSelectedAddress(suggestion);
      } else {
        toast.error("We couldn't find that location. Please try a different search.");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      toast.error("Error finding location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };
  
  const saveSelectedAddress = async (suggestion) => {
    if (!suggestion.address.city || !suggestion.address.state) {
      console.log("Invalid address - missing city or state", suggestion);
      toast.error("Please provide a complete address with city and state");
      return;
    }
    
    // Create a new address object with consistent structure
    const newAddress = {
      id: `loc-${Date.now()}`,
      line1: suggestion.displayName,
      city: suggestion.address.city,
      state: suggestion.address.state,
      zip: suggestion.address.zip || '',
      lat: suggestion.lat,
      lon: suggestion.lon,
      isHome: false,
      timestamp: new Date().toISOString()
    };
    
    console.log("Saving new address:", newAddress); // Debug log
    
    // Save to local state
    setCurrentLocation(newAddress);
    setHomeAddress(newAddress);
    setDisplayLocation(`${suggestion.address.city}, ${suggestion.address.state}`);
    
    // Save to localStorage
    localStorage.setItem('userCity', suggestion.address.city);
    localStorage.setItem('userState', suggestion.address.state);
    localStorage.setItem('userZip', suggestion.address.zip || '');
    localStorage.setItem('userAddress', suggestion.displayName);
    
    // Set flag to indicate location change, forcing refresh of store data
    localStorage.setItem('kirova_location_changed', 'true');
    
    // Save to user profile if logged in
    if (currentUser) {
      const saveToUserProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data() || {};
          
          // Update recent locations
          let updatedRecentLocations = userData.recentLocations || [];
          
          // Add current location if not already in the list
          const isDuplicate = updatedRecentLocations.some(
            loc => loc.city === newAddress.city && loc.state === newAddress.state
          );
          
          if (!isDuplicate) {
            updatedRecentLocations.unshift(newAddress);
            
            // Sort by timestamp and limit to 5
            updatedRecentLocations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            updatedRecentLocations = updatedRecentLocations.slice(0, 5);
          }
          
          // Update both the location objects and individual fields
          await updateDoc(doc(db, 'users', currentUser.uid), {
            recentLocations: updatedRecentLocations,
            lastUsedLocation: newAddress,
            city: newAddress.city,
            state: newAddress.state,
            zip: newAddress.zip,
            address: newAddress.line1
          });
          
          // Update local state
          setRecentLocations(updatedRecentLocations);
        } catch (error) {
          console.error("Error saving address to profile:", error);
        }
      };
      
      await saveToUserProfile();
    }
    
    // Close modal
    closeModal();
    
    // Force refresh only if we're on a page that needs location data
    const locationDependentPaths = ['/home', '/stores', '/compare'];
    if (locationDependentPaths.some(path => locationPath.includes(path))) {
      window.location.reload();
    }
  };
  
  const selectSavedLocation = async (location) => {
    console.log("Selecting saved location:", location); // Debug log
    
    // Update the timestamp to be the current time
    const updatedLocation = {
      ...location,
      timestamp: new Date().toISOString()
    };
    
    // Set as current location
    setCurrentLocation(updatedLocation);
    setHomeAddress(updatedLocation);
    setDisplayLocation(`${location.city}, ${location.state}`);
    
    // Save to localStorage
    localStorage.setItem('userCity', location.city);
    localStorage.setItem('userState', location.state);
    if (location.zip) localStorage.setItem('userZip', location.zip);
    if (location.line1) localStorage.setItem('userAddress', location.line1);
    
    // Set flag to indicate location change
    localStorage.setItem('kirova_location_changed', 'true');
    
    // Save to user profile if logged in
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data() || {};
        
        // Update recent locations list
        let updatedRecentLocations = userData.recentLocations || [];
        
        // Remove this location if it exists in the list
        updatedRecentLocations = updatedRecentLocations.filter(
          loc => !(loc.city === location.city && loc.state === location.state)
        );
        
        // Add the location with updated timestamp at the beginning
        updatedRecentLocations.unshift(updatedLocation);
        
        // Sort by timestamp and limit to 5
        updatedRecentLocations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        updatedRecentLocations = updatedRecentLocations.slice(0, 5);
        
        // Update both the location object and individual fields
        await updateDoc(doc(db, 'users', currentUser.uid), {
          lastUsedLocation: updatedLocation,
          recentLocations: updatedRecentLocations,
          city: location.city,
          state: location.state,
          zip: location.zip || '',
          address: location.line1 || ''
        });
        
        // Update local state
        setRecentLocations(updatedRecentLocations);
      } catch (error) {
        console.error("Error updating last used location:", error);
      }
    }
    
    // Close modal
    closeModal();
    
    // Force refresh only if we're on a page that needs location data
    const locationDependentPaths = ['/home', '/stores', '/compare'];
    if (locationDependentPaths.some(path => locationPath.includes(path))) {
      window.location.reload();
    }
  };
  
  // Function to set a location as primary
  const handleSetAsPrimaryAddress = async (location) => {
    if (!currentUser) {
      // Need to be logged in to set primary address
      toast.info("Please log in to save a primary address");
      return;
    }
    
    try {
      // Make sure location has a consistent structure with all required fields
      const primaryLocation = {
        id: location.id || `loc-${Date.now()}`,
        line1: location.line1 || "",
        city: location.city || "",
        state: location.state || "",
        zip: location.zip || "",
        lat: location.lat || null,
        lon: location.lon || null,
        isHome: true,
        timestamp: location.timestamp || new Date().toISOString()
      };
      
      console.log("Setting primary address:", primaryLocation); // Debug log
      
      // Also update user profile with individual address fields
      await updateDoc(doc(db, 'users', currentUser.uid), {
        primaryAddress: primaryLocation,
        city: primaryLocation.city,
        state: primaryLocation.state,
        zip: primaryLocation.zip,
        address: primaryLocation.line1
      });
      
      toast.success("Primary address updated successfully");
      setPrimaryAddress(primaryLocation);
      
      // Close modal
      closeModal();
    } catch (error) {
      console.error("Error setting primary address:", error);
      toast.error("Failed to update primary address");
    }
  };
  
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setAddressSearch('');
    setShowAutocomplete(false);
  };
  
  const handleCurrentLocation = () => {
    setIsGettingLocation(true);
    requestLocation();
  };
  
  return (
    <>
      <LocationButton onClick={openModal}>
        <LocationIcon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </LocationIcon>
        <LocationText>
          {currentLocation?.city && currentLocation?.state 
            ? `${currentLocation.city}, ${currentLocation.state}`
            : displayLocation || "Set location"}
        </LocationText>
      </LocationButton>
      
      <Modal isOpen={isModalOpen}>
        <ModalContent>
          <CloseButton onClick={closeModal}>×</CloseButton>
          <ModalTitle>Choose address</ModalTitle>
          
          <form onSubmit={handleAddressSearch}>
            <SearchBar ref={autocompleteRef}>
              <SearchInput 
                type="text" 
                placeholder="Add a new address" 
                value={addressSearch}
                onChange={handleAddressInputChange}
                autoComplete="off"
              />
              <SearchButton type="submit">
                {isSearching ? (
                  <LoadingSpinner style={{ width: "20px", height: "20px" }} />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                )}
              </SearchButton>
              
              {/* Autocomplete Dropdown */}
              {showAutocomplete && autocompleteResults.length > 0 && (
                <AutocompleteList>
                  {autocompleteResults.map(suggestion => (
                    <AutocompleteItem 
                      key={suggestion.id} 
                      onClick={() => handleAutocompleteSelect(suggestion)}
                    >
                      {suggestion.displayName}
                    </AutocompleteItem>
                  ))}
                </AutocompleteList>
              )}
            </SearchBar>
          </form>
          
          {/* Primary Address */}
          {primaryAddress && (
            <>
              <SectionTitle>Primary Address</SectionTitle>
              <SavedAddressItem 
                onClick={() => selectSavedLocation(primaryAddress)}
                active={currentLocation && primaryAddress && currentLocation.city === primaryAddress.city && currentLocation.state === primaryAddress.state}
              >
                <AddressIcon>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </AddressIcon>
                <AddressInfo>
                  <AddressLine>
                    {primaryAddress.city}, {primaryAddress.state}
                  </AddressLine>
                  <AddressSecondary>
                    Primary Address
                  </AddressSecondary>
                </AddressInfo>
                <EditButton onClick={(e) => {
                  e.stopPropagation();
                  navigate('/profile');
                }}>
                  Edit
                </EditButton>
              </SavedAddressItem>
            </>
          )}
          
          {/* Use current location option */}
          <CurrentLocationButton 
            onClick={handleCurrentLocation}
            active={isGettingLocation}
          >
            <AddressIcon>
              {isGettingLocation ? (
                <LoadingSpinner />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                </svg>
              )}
            </AddressIcon>
            <AddressInfo>
              <AddressLine>
                {isGettingLocation ? 'Getting your location...' : 'Use current location'}
              </AddressLine>
              {!isGettingLocation && (
                <AddressSecondary>
                  Enable location services to improve your experience
                </AddressSecondary>
              )}
            </AddressInfo>
          </CurrentLocationButton>
          
          {/* Recent Locations */}
          {recentLocations.length > 0 && (
            <>
              <SectionTitle>Recent locations</SectionTitle>
              {recentLocations.map(location => (
                <SavedAddressItem 
                  key={location.id} 
                  onClick={() => selectSavedLocation(location)}
                  active={currentLocation && location.id === currentLocation.id}
                >
                  <AddressIcon>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="8 12 12 16 16 12"></polyline>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                    </svg>
                  </AddressIcon>
                  <AddressInfo>
                    <AddressLine>
                      {location.city}, {location.state}
                    </AddressLine>
                    <AddressSecondary>
                      {new Date(location.timestamp).toLocaleDateString()}
                    </AddressSecondary>
                  </AddressInfo>
                  {!location.isHome && currentUser && (
                    <EditButton onClick={(e) => {
                      e.stopPropagation();
                      handleSetAsPrimaryAddress(location);
                    }}>
                      Set as primary
                    </EditButton>
                  )}
                </SavedAddressItem>
              ))}
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default LocationSelector;