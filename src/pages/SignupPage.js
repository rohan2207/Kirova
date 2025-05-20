// src/pages/SignupPage.js - Further Enhanced Location UI with Error Logging
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { auth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import useUserLocation from '../hooks/useUserLocation';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { logError, logAddressError, logAuthError } from '../services/errorLogger';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  padding: 40px 20px;
  background-color: #F7F9F4;
`;

const FormContainer = styled.div`
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 480px;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 30px;
  text-align: center;
  color: #383838;
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  border: 1px solid #DEEBD1;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #71B340;
    box-shadow: 0 0 0 2px #E9F5E1;
  }
`;

const ErrorMessage = styled.p`
  color: #D32F2F;
  margin-top: 6px;
  font-size: 0.875rem;
`;

const PasswordRequirements = styled.ul`
  margin-top: 8px;
  padding-left: 18px;
  font-size: 0.875rem;
  color: #666666;
`;

const RequirementItem = styled.li`
  margin-bottom: 4px;
  color: ${props => props.met ? '#71B340' : '#666666'};
`;

const ActionButton = styled.button`
  padding: 14px;
  background-color: #71B340;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;

  &:hover {
    background-color: #2F4A22;
  }

  &:disabled {
    background-color: #A9A9A9;
    cursor: not-allowed;
  }
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;

  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #DEEBD1;
  }

  span {
    padding: 0 16px;
    color: #666666;
    font-size: 0.875rem;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: white;
  border: 1px solid #DEEBD1;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;

  &:hover {
    background-color: #f5f5f5;
  }

  img {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
`;

const LinkText = styled.p`
  margin-top: 24px;
  text-align: center;
  font-size: 0.95rem;
  color: #666666;

  a {
    color: #71B340;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const WelcomeMessage = styled.div`
  background-color: #e8f5e1;
  border-left: 4px solid #71B340;
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-size: 0.95rem;
  color: #383838;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(47, 138, 17, 0.2);
  border-radius: 50%;
  border-top-color: #2F8A11;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LocationOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
`;

const LocationOption = styled.button`
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #DEEBD1;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
    border-color: #71B340;
  }
`;

const LocationIcon = styled.span`
  margin-right: 12px;
  color: #71B340;
  font-size: 24px;
`;

const LocationText = styled.div`
  text-align: left;
  
  h4 {
    font-size: 1rem;
    margin-bottom: 4px;
    color: #383838;
  }
  
  p {
    font-size: 0.875rem;
    color: #666666;
  }
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 20px;
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

const InlineMessageBox = styled.div`
  background-color: #e8f5e1;
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-size: 0.95rem;
  color: #383838;
`;

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showZipPrompt, setShowZipPrompt] = useState(false);
  const [zip, setZip] = useState('');
  const [googleUser, setGoogleUser] = useState(null);
  
  // New states for enhanced location features
  const [isCheckingExistingUser, setIsCheckingExistingUser] = useState(false);
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  
  // Address autocomplete states
  const [addressSearch, setAddressSearch] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const autocompleteRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message || '';
  
  // Use our location hook
  const { location: browserLocation, requestLocation, isRequesting: isRequestingLocation } = useUserLocation();

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  const doPasswordsMatch = password === confirmPassword;
  const isFormValid = email && isPasswordValid && doPasswordsMatch;

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

  const handleSignupWithEmail = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setError(!doPasswordsMatch ? 'Passwords do not match' : 'Please meet all password requirements');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      
      // Show location options for new email users too
      setShowLocationOptions(true);
      
    } catch (err) {
      const map = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password is too weak.',
      };
      const errorMessage = map[err.code] || 'Failed to create an account. Please try again.';
      setError(errorMessage);
      console.error(err);
      
      // Log the auth error
      await logAuthError('email', err.code, err.message, email);
      
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Set checking state to show loading
      setIsCheckingExistingUser(true);
      
      // Check if this user already has a profile with location info
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if user already has location data
        if ((userData.city && userData.state) || 
            (userData.primaryAddress && userData.primaryAddress.city && userData.primaryAddress.state) ||
            (userData.lastUsedLocation && userData.lastUsedLocation.city && userData.lastUsedLocation.state)) {
          
          console.log("Existing user with location data:", userData);
          
          // Store location in localStorage
          let city, state, zip;
          
          if (userData.primaryAddress) {
            city = userData.primaryAddress.city;
            state = userData.primaryAddress.state;
            zip = userData.primaryAddress.zip || '';
          } else if (userData.lastUsedLocation) {
            city = userData.lastUsedLocation.city;
            state = userData.lastUsedLocation.state;
            zip = userData.lastUsedLocation.zip || '';
          } else {
            city = userData.city;
            state = userData.state;
            zip = userData.zip || '';
          }
          
          localStorage.setItem('userCity', city);
          localStorage.setItem('userState', state);
          localStorage.setItem('userZip', zip);
          
          // Existing user with location - go directly to home
          toast.success(`Welcome back to Kirova! Using your saved location: ${city}, ${state}`);
          navigate('/home');
          return;
        }
        
        // User exists but no location data - show location options
        setGoogleUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
        
        setShowLocationOptions(true);
        
      } else {
        // Brand new user - store info and show location options
        setGoogleUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
        
        setShowLocationOptions(true);
      }
      
    } catch (error) {
      console.error("Google Sign-up Error:", error.code, error.message);
      setError('Google sign-up failed: ' + error.message);
      
      // Log the auth error
      await logAuthError('google', error.code, error.message);
      
      setLoading(false);
    } finally {
      setIsCheckingExistingUser(false);
    }
  };

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
        // Address not found - log error and notify user
        const errorMsg = "We couldn't find that location. Please try a different search.";
        toast.error(errorMsg);
        
        // Log the address resolution error
        const userId = googleUser?.uid || (auth.currentUser ? auth.currentUser.uid : null);
        await logAddressError(searchText, "No results found", response.data, userId);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      toast.error("Error finding location. Please try again.");
      
      // Log the error
      const userId = googleUser?.uid || (auth.currentUser ? auth.currentUser.uid : null);
      await logAddressError(searchText, error.message, null, userId);
    } finally {
      setIsSearching(false);
    }
  };
  
  const saveSelectedAddress = async (suggestion) => {
    if (!suggestion.address.city || !suggestion.address.state) {
      console.log("Invalid address - missing city or state", suggestion);
      toast.error("Please provide a complete address with city and state");
      
      // Log the validation error
      const userId = googleUser?.uid || (auth.currentUser ? auth.currentUser.uid : null);
      await logError(
        'ADDRESS_VALIDATION', 
        'Invalid address - missing city or state',
        { suggestion },
        userId
      );
      return;
    }
    
    // Create a new address object with consistent structure
    const newAddress = {
      id: `loc-${Date.now()}`,
      line1: suggestion.address.line1 || suggestion.displayName,
      city: suggestion.address.city,
      state: suggestion.address.state,
      zip: suggestion.address.zip || '',
      lat: suggestion.lat,
      lon: suggestion.lon,
      isHome: false,
      timestamp: new Date().toISOString()
    };
    
    console.log("Saving new address:", newAddress); // Debug log
    
    // Save to localStorage
    localStorage.setItem('userCity', suggestion.address.city);
    localStorage.setItem('userState', suggestion.address.state);
    localStorage.setItem('userZip', suggestion.address.zip || '');
    localStorage.setItem('userAddress', suggestion.address.line1 || suggestion.displayName);
    
    // Set flag to indicate location change, forcing refresh of store data
    localStorage.setItem('kirova_location_changed', 'true');
    
    // Save to user profile
    try {
      setLoading(true);
      
      const userId = googleUser?.uid || auth.currentUser.uid;
      const userEmail = googleUser?.email || auth.currentUser.email;
      const userName = googleUser?.displayName || '';
      
      // Create a primary address too
      const primaryAddress = {
        ...newAddress,
        id: `primary-${Date.now()}`,
        isHome: true
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'users', userId), {
        name: userName,
        email: userEmail,
        zip: newAddress.zip || "",
        city: newAddress.city,
        state: newAddress.state,
        address: newAddress.line1,
        lastUpdated: new Date().toISOString(),
        lastUsedLocation: newAddress,
        primaryAddress: primaryAddress,
        recentLocations: [newAddress]
      }, { merge: true });
      
      // Success toast and redirect
      toast.success("🎉 You're all set! Start saving on your groceries and everyday bills.");
      navigate('/home');
      
    } catch (error) {
      console.error("Error saving location:", error);
      setError("Failed to save your location. Please try again.");
      
      // Log the error
      await logError(
        'PROFILE_SAVE',
        'Failed to save user location data',
        { 
          address: newAddress,
          error: error.message 
        },
        googleUser?.uid || (auth.currentUser ? auth.currentUser.uid : null)
      );
      
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    // First request the browser location
    requestLocation();
  };
  
  // Watch for location changes from the hook
  useEffect(() => {
    if (browserLocation && showLocationOptions) {
      saveUserLocation({
        city: browserLocation.city,
        state: browserLocation.state,
        zip: browserLocation.zip,
        address: browserLocation.address
      });
    }
  }, [browserLocation, showLocationOptions]);
  
  // Function to save detected or selected location
  const saveUserLocation = async (locationData) => {
    try {
      setLoading(true);
      
      if (!googleUser && !auth.currentUser) {
        setError("User authentication error. Please try again.");
        setLoading(false);
        return;
      }
      
      const userId = googleUser?.uid || auth.currentUser.uid;
      const userEmail = googleUser?.email || auth.currentUser.email;
      const userName = googleUser?.displayName || '';
      
      const timestamp = new Date().toISOString();
      
      // Format the location data
      const locationObject = {
        id: `loc-${Date.now()}`,
        line1: locationData.address || "",
        city: locationData.city || "McKinney",
        state: locationData.state || "TX",
        zip: locationData.zip || "",
        isHome: false,
        timestamp: timestamp
      };
      
      // Also create a primary address
      const primaryAddress = {
        ...locationObject,
        id: `primary-${Date.now()}`,
        isHome: true
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'users', userId), {
        name: userName,
        email: userEmail,
        zip: locationData.zip || "",
        city: locationData.city || "McKinney",
        state: locationData.state || "TX",
        address: locationData.address || "",
        lastUpdated: timestamp,
        lastUsedLocation: locationObject,
        primaryAddress: primaryAddress,
        recentLocations: [locationObject]
      }, { merge: true });
      
      // Save to localStorage
      localStorage.setItem('userCity', locationData.city || "McKinney");
      localStorage.setItem('userState', locationData.state || "TX");
      if (locationData.zip) localStorage.setItem('userZip', locationData.zip);
      if (locationData.address) localStorage.setItem('userAddress', locationData.address);
      
      // Success toast and redirect
      toast.success("🎉 You're all set! Start saving on your groceries and everyday bills.");
      navigate('/home');
      
    } catch (error) {
      console.error("Error saving location:", error);
      setError("Failed to save your location. Please try again.");
      
      // Log the error
      await logError(
        'PROFILE_SAVE',
        'Failed to save user location data',
        { 
          locationData,
          error: error.message 
        },
        googleUser?.uid || (auth.currentUser ? auth.currentUser.uid : null)
      );
      
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <FormContainer>
        <Title>{showLocationOptions ? 'Set Your Location' : 'Sign Up'}</Title>

        {message && <WelcomeMessage>{message}</WelcomeMessage>}

        {isCheckingExistingUser ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <LoadingSpinner />
            <p style={{ marginTop: '20px' }}>Checking your account...</p>
          </div>
        ) : showLocationOptions ? (
          // Location selection UI
          <>
            <InlineMessageBox>
              👋 To provide you with the best deals in your area, please let us know your location.
              Adding your precise location helps us find the biggest grocery savings near you!
            </InlineMessageBox>
            
            <LocationOptions>
              <SearchBar ref={autocompleteRef}>
                <Label>Add a new address</Label>
                <Input 
                  type="text" 
                  placeholder="Search for an address" 
                  value={addressSearch}
                  onChange={handleAddressInputChange}
                  autoComplete="off"
                />
                <SearchButton type="button" onClick={handleAddressSearch}>
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
              
              <LocationOption onClick={handleUseCurrentLocation} disabled={isRequestingLocation}>
                <LocationIcon>📍</LocationIcon>
                <LocationText>
                  <h4>{isRequestingLocation ? 'Getting your location...' : 'Use my current location'}</h4>
                  <p>Get local prices based on where you are now</p>
                </LocationText>
                {isRequestingLocation && <LoadingSpinner style={{ marginLeft: 'auto' }} />}
              </LocationOption>
            </LocationOptions>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </>
        ) : (
          // Original signup UI
          <>
            <GoogleButton onClick={handleGoogleSignup} type="button" disabled={loading}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
              Sign up with Google
            </GoogleButton>

            <OrDivider><span>OR</span></OrDivider>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Form onSubmit={handleSignupWithEmail}>
              <FormGroup>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" disabled={loading} />
              </FormGroup>

              <FormGroup>
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Create a strong password" disabled={loading} />
                <PasswordRequirements>
                  <RequirementItem met={hasMinLength}>At least 8 characters</RequirementItem>
                  <RequirementItem met={hasUppercase}>At least one uppercase letter</RequirementItem>
                  <RequirementItem met={hasLowercase}>At least one lowercase letter</RequirementItem>
                  <RequirementItem met={hasNumber}>At least one number</RequirementItem>
                  <RequirementItem met={hasSpecialChar}>At least one special character</RequirementItem>
                </PasswordRequirements>
              </FormGroup>

              <FormGroup>
                <Label>Confirm Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Re-enter your password" disabled={loading} />
                {password && confirmPassword && !doPasswordsMatch && (
                  <ErrorMessage>Passwords do not match</ErrorMessage>
                )}
              </FormGroup>

              <ActionButton type="submit" disabled={loading || !isFormValid}>
                {loading ? <LoadingSpinner /> : 'Sign Up'}
              </ActionButton>
            </Form>

            <LinkText>
              Already have an account? <Link to="/login">Log In</Link>
            </LinkText>
          </>
        )}
      </FormContainer>
    </PageContainer>
  );
};

export default SignupPage;