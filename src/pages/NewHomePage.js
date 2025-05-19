// pages/NewHomePage.js - Fixed version
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

// Hooks
import useNearbyStores from '../hooks/useNearbyStores';
import useUserLocation from '../hooks/useUserLocation';

// Components
import Sidebar from '../components/dashboard/Sidebar';
import StoreList from '../components/dashboard/StoreList';
import CategoryCarousel from '../components/dashboard/CategoryCarousel';
import FlierDeals from '../components/dashboard/FlierDeals';
import SavingsSummary from '../components/dashboard/SavingsSummary';

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f7f8fa;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 24px 32px;
  max-width: calc(100% - 210px);
  
  @media (max-width: 1023px) {
    max-width: 100%;
    padding: 16px;
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #343538;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 24px;
  max-width: 600px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px 48px;
  border-radius: 30px;
  border: 1px solid #dcdcdc;
  background-color: white;
  font-size: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  outline: none;
  
  &:focus {
    border-color: #2f8a11;
    box-shadow: 0 0 0 2px rgba(47, 138, 17, 0.2);
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 20px;
`;

const ListButton = styled.button`
  background-color: #2f8a11;
  color: white;
  padding: 14px 20px;
  border-radius: 30px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-size: 15px;
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #267610;
  }
`;

const WelcomeContainer = styled.div`
  margin-bottom: 24px;
`;

const Greeting = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #343538;
`;

const SubGreeting = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 16px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f7f8fa;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #2f8a11;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: #666;
  text-align: center;
`;

const NoStoresContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin: 24px 0;
`;

const NoStoresIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const NoStoresTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #343538;
`;

const NoStoresText = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const NoStoresButton = styled.button`
  background-color: #2f8a11;
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-size: 15px;
  
  &:hover {
    background-color: #267610;
  }
`;

const PlaceholderBanner = styled.div`
  background-color: #fff8e1;
  border: 1px solid #ffd54f;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #ff8f00;
  display: ${props => props.show ? 'block' : 'none'};
`;

// Helper function to ensure safe store data for Firestore
const sanitizeStoreForFirestore = (store) => {
  // Create a clean object with only defined values
  return {
    id: store.id || `store-${Math.random().toString(36).substring(2, 9)}`,
    name: store.name || "Local Grocery Store",
    distance: typeof store.distance === 'number' ? store.distance : 0,
    type: store.type || "Grocery",
    // Only add these fields if they exist and are not undefined
    ...(store.address ? { address: store.address } : {}),
    ...(typeof store.lat === 'number' ? { lat: store.lat } : {}),
    ...(typeof store.lon === 'number' ? { lon: store.lon } : {})
  };
};

const NewHomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    name: '',
    zip: '75070', // Default to McKinney zip
    totalSaved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get user location
  const { location, error: locationError, requestLocation } = useUserLocation();
  
  // Get stores near the location
  const { stores, loading: storesLoading, error: storesError } = 
    useNearbyStores(location || userProfile.zip);

  // Function to log missing stores to Firebase
  const logMissingStores = async (zip) => {
    try {
      await addDoc(collection(db, 'missing_store_locations'), {
        zip: zip || '75070',
        userId: currentUser?.uid || 'anonymous',
        timestamp: new Date().toISOString(),
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          state: location.state
        } : null
      });
      console.log("Logged missing stores for zip:", zip);
    } catch (err) {
      console.error("Error logging missing stores:", err);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const snapshot = await getDoc(docRef);
        const data = snapshot.data() || {};
        
        setUserProfile({
          name: data.name || '',
          zip: data.zip || (location && location.zip) || '75070',
          totalSaved: data.totalSaved || 0
        });
        
        // If we got location from browser but not from DB, update the DB
        if (location && location.zip && (!data.zip || data.zip !== location.zip)) {
          await setDoc(docRef, { 
            zip: location.zip || '75070',
            city: location.city || 'McKinney',
            state: location.state || 'TX'
          }, { merge: true });
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, navigate, location]);

  useEffect(() => {
    const saveStoreData = async () => {
      if (!currentUser || !stores || !stores.length) return;
      
      try {
        // Only save first 10 stores to Firestore to keep document size manageable
        // And sanitize to prevent Firebase errors
        const storesToSave = stores.slice(0, 10).map(store => sanitizeStoreForFirestore(store));
        
        await setDoc(doc(db, 'users', currentUser.uid), {
          nearbyStores: storesToSave,
          lastStoreUpdate: new Date().toISOString()
        }, { merge: true });
        
        console.log("Successfully saved store data to Firestore");
      } catch (error) {
        console.error("Error saving store data to Firestore:", error);
      }
    };
    
    if (stores && stores.length > 0) {
      saveStoreData();
    }
  }, [stores, currentUser]);

  // Log missing stores when we know there are none in the area
  useEffect(() => {
    if (!storesLoading && (!stores || stores.length === 0) && userProfile.zip) {
      logMissingStores(userProfile.zip);
    }
  }, [storesLoading, stores, userProfile.zip]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  // Check if any stores contain placeholder data (for banner display)
  const hasPlaceholderData = stores && stores.some(store => 
    store.hasPlaceholderData || !store.isRealLocation
  );

  // Handler for the "Update Location" button
  const handleUpdateLocation = () => {
    // Request a new location from the browser
    requestLocation();
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading your profile...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <PageContainer>
      <Sidebar />
      <MainContent>
        <WelcomeContainer>
          <Greeting>👋 Hi, {userProfile.name || 'there'}!</Greeting>
          <SubGreeting>
            {location && location.city ? 
              `We've found grocery deals near ${location.city}, ${location.state || 'TX'}.` : 
              'We\'ve found grocery deals around you.'
            }
            {userProfile.totalSaved > 0 && ` You've saved $${userProfile.totalSaved.toFixed(2)} so far!`}
          </SubGreeting>
          
          <form onSubmit={handleSearch}>
            <SearchContainer>
              <SearchIcon>🔍</SearchIcon>
              <SearchInput 
                type="text" 
                placeholder="Search for groceries, stores, or deals..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchContainer>
          </form>
          
          <ListButton>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Make a List
          </ListButton>
        </WelcomeContainer>
        
        <SavingsSummary totalSaved={userProfile.totalSaved} />
        
        {/* Placeholder data notice banner */}
        <PlaceholderBanner show={hasPlaceholderData}>
          Note: Some store information (delivery times, price levels, offers) are placeholders for demonstration purposes only.
        </PlaceholderBanner>
        
        {!storesLoading && (!stores || stores.length === 0) ? (
          <NoStoresContainer>
            <NoStoresIcon>🏪</NoStoresIcon>
            <NoStoresTitle>No stores found near you</NoStoresTitle>
            <NoStoresText>
              We couldn't find any grocery stores within 6 miles of your location. 
              Please try updating your location or ZIP code. We're working on expanding our coverage to more areas!
            </NoStoresText>
            <NoStoresButton onClick={handleUpdateLocation}>
              Update Location
            </NoStoresButton>
          </NoStoresContainer>
        ) : (
          <StoreList 
            title={location ? `Stores near ${location.city || userProfile.zip || 'you'}` : "Stores near you"}
            stores={stores} 
            loading={storesLoading}
            viewAllLink="/stores"
          />
        )}
        
        <CategoryCarousel />
        
        <FlierDeals />
      </MainContent>
    </PageContainer>
  );
};

export default NewHomePage;