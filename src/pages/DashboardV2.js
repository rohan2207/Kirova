import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

// Hooks
import useNearbyStores from '../hooks/useNearbyStores';
import useUserLocation from '../hooks/useUserLocation';

// Components
import Sidebar from '../components/dashboard/v2/Sidebar';
import StoreList from '../components/dashboard/v2/StoreList';
import CategoryCarousel from '../components/dashboard/v2/CategoryCarousel';
import FlierDeals from '../components/dashboard/v2/FlierDeals';
import SavingsSummary from '../components/dashboard/v2/SavingsSummary';

const PageContainer = styled.div`
  display: flex;
  min-height: calc(100vh - 70px); /* Adjust for navbar height */
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

const WelcomeContainer = styled.div`
  margin-bottom: 24px;
`;

const Greeting = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #343538;
`;

const SubGreeting = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 16px;
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
    border-color: #2F8A11;
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
  background-color: #2F8A11;
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
  border-left-color: #2F8A11;
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

const DashboardV2 = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    name: '',
    zip: '',
    totalSaved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { location } = useUserLocation();
  const { stores, loading: storesLoading } = useNearbyStores(userProfile.zip || (location && location.zip));

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
          zip: data.zip || (location && location.zip) || '',
          totalSaved: data.totalSaved || 6.35
        });
        
        // If we got location from browser but not from DB, update the DB
        if (!data.zip && location && location.zip) {
          await setDoc(docRef, { 
            zip: location.zip,
            city: location.city,
            state: location.state
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
      if (!currentUser || !stores.length) return;
      await setDoc(doc(db, 'users', currentUser.uid), {
        nearbyStores: stores,
      }, { merge: true });
    };
    
    if (stores.length > 0) {
      saveStoreData();
    }
  }, [stores, currentUser]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Enhanced store data for display
  const enhancedStores = stores && stores.length ? stores.map(store => {
    return {
      ...store,
      type: getStoreType(store.name),
      deliveryTime: getRandomDeliveryTime(),
      distance: store.distance || Math.round(Math.random() * 50) / 10,
      priceLevel: getPriceLevel(),
      offers: Math.random() > 0.5 ? `$${Math.floor(Math.random() * 15) + 5} off` : null,
      hasInStorePrice: Math.random() > 0.5,
      acceptsEbt: Math.random() > 0.3
    };
  }) : [];

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
            We've found grocery deals around you. {userProfile.totalSaved > 0 && `You've saved $${userProfile.totalSaved.toFixed(2)} so far!`}
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
        
        <StoreList 
          title="Stores near you"
          stores={enhancedStores} 
          viewAllLink="/stores"
        />
        
        <CategoryCarousel />
        
        <FlierDeals />
      </MainContent>
    </PageContainer>
  );
};

// Helper functions
function getStoreType(name) {
  const nameLC = name?.toLowerCase() || '';
  
  if (nameLC.includes('walmart') || nameLC.includes('target')) return 'Superstore';
  if (nameLC.includes('kroger') || nameLC.includes('heb')) return 'Grocery';
  if (nameLC.includes('costco') || nameLC.includes('sam')) return 'Wholesale';
  if (nameLC.includes('aldi')) return 'Discount';
  if (nameLC.includes('sprouts') || nameLC.includes('whole') || nameLC.includes('trader')) return 'Natural';
  
  return 'Grocery';
}

function getRandomDeliveryTime() {
  const hours = [10, 11, 12, 1, 2, 3, 4, 5];
  const minutes = ['00', '15', '30', '45'];
  const ampm = ['am', 'pm'];
  
  const hour = hours[Math.floor(Math.random() * hours.length)];
  const minute = minutes[Math.floor(Math.random() * minutes.length)];
  const period = ampm[Math.floor(Math.random() * ampm.length)];
  
  return `${hour}:${minute}${period}`;
}

function getPriceLevel() {
  // Return 1, 2, or 3 dollar signs
  return Math.floor(Math.random() * 3) + 1;
}

export default DashboardV2;