// src/components/dashboard/StoreList.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import StoreCard from './StoreCard';

const SectionTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #343538;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ViewAllLink = styled(Link)`
  font-size: 14px;
  color: #2F8A11;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SeeMoreButton = styled.button`
  background-color: #f0f0f0;
  border: none;
  border-radius: 30px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  color: #343538;
  cursor: pointer;
  display: block;
  margin: 16px auto 32px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const EmptyState = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const EmptyText = styled.p`
  font-size: 15px;
  color: #666;
  margin-bottom: 24px;
`;

const EmptyButton = styled.button`
  background-color: #2F8A11;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background-color: #267610;
  }
`;

const StoreListSkeleton = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StoreCardSkeleton = styled.div`
  height: 230px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.6) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const PlaceholderNotice = styled.div`
  background-color: #fff8e1;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #ff8f00;
  display: ${props => props.show ? 'block' : 'none'};
`;

const LocationMismatchAlert = styled.div`
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const RefreshButton = styled.button`
  background-color: #2F8A11;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 8px;
  cursor: pointer;
  
  &:hover {
    background-color: #267610;
  }
`;

const StoreList = ({ title, stores = [], viewAllLink, loading = false, onUpdateLocation }) => {
  // Start with displaying 6 stores initially
  const [displayCount, setDisplayCount] = useState(6);
  const [locationMismatch, setLocationMismatch] = useState(false);
  
  // Ensure stores is an array
  const safeStores = Array.isArray(stores) ? stores : [];
  
  // Check if any stores have placeholder data
  const hasPlaceholderData = safeStores.some(store => 
    store.hasPlaceholderData || !store.isRealLocation
  );
  
  // Check if stores match the current selected location
  useEffect(() => {
    const storedCity = localStorage.getItem('userCity');
    const storedState = localStorage.getItem('userState');
    
    if (storedCity && storedState && safeStores.length > 0) {
      // Check if any store has the city/state in the address or matches the city/state properties
      const hasMatchingStore = safeStores.some(store => {
        const hasMatchingCity = store.city && store.city.toLowerCase() === storedCity.toLowerCase();
        const hasMatchingState = store.state && store.state.toLowerCase() === storedState.toLowerCase();
        const addressContainsCity = store.address && store.address.toLowerCase().includes(storedCity.toLowerCase());
        
        return (hasMatchingCity && hasMatchingState) || addressContainsCity;
      });
      
      setLocationMismatch(!hasMatchingStore);
    }
  }, [safeStores]);
  
  // Show loading skeletons when loading
  if (loading) {
    return (
      <div>
        <SectionTitle>
          {title}
        </SectionTitle>
        <StoreListSkeleton>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <StoreCardSkeleton key={i} />
          ))}
        </StoreListSkeleton>
      </div>
    );
  }
  
  // Show empty state if no stores are available
  if (safeStores.length === 0) {
    return (
      <div>
        <SectionTitle>
          {title}
        </SectionTitle>
        <EmptyState>
          <EmptyTitle>No stores found</EmptyTitle>
          <EmptyText>We couldn't find any stores near your location. Try updating your ZIP code or enabling location services.</EmptyText>
          {onUpdateLocation && (
            <EmptyButton onClick={onUpdateLocation}>Update Location</EmptyButton>
          )}
        </EmptyState>
      </div>
    );
  }
  
  // Get the maximum number of stores we'll display (20 or less if there are fewer stores)
  const maxStores = Math.min(20, safeStores.length);
  
  // The visible stores based on current display count (limited to maxStores)
  const visibleStores = safeStores.slice(0, Math.min(displayCount, maxStores));
  
  // Show more button if there are more stores to display (up to maximum)
  const hasMoreToShow = displayCount < maxStores;
  
  const handleShowMore = () => {
    // Show up to maxStores (20)
    setDisplayCount(maxStores);
  };
  
  // Handle the refresh button click
  const handleRefresh = () => {
    // Clear location-specific cache
    const storedCity = localStorage.getItem('userCity');
    const storedState = localStorage.getItem('userState');
    const locationKey = storedCity && storedState 
      ? `${storedCity.toLowerCase()}_${storedState.toLowerCase()}`
      : localStorage.getItem('userZip') || 'default';
    
    // Remove the specific store cache for this location
    localStorage.removeItem(`kirova_stores_${locationKey}`);
    
    // Set flag to force reload on next fetch
    localStorage.setItem('kirova_location_changed', 'true');
    
    // Force page reload
    window.location.reload();
  };
  
  return (
    <div>
      <SectionTitle>
        {title}
        {viewAllLink && <ViewAllLink to={viewAllLink}>View All</ViewAllLink>}
      </SectionTitle>
      
      {locationMismatch && (
        <LocationMismatchAlert>
          <p>Stores shown may not match your selected location. Click "Refresh" to update.</p>
          <RefreshButton onClick={handleRefresh}>
            Refresh Stores
          </RefreshButton>
        </LocationMismatchAlert>
      )}
      
      {visibleStores.length > 0 && (
        <>
          <StoreGrid>
            {visibleStores.map((store) => (
              store && <StoreCard key={store.id || Math.random().toString()} store={store} />
            ))}
          </StoreGrid>
          
          {hasMoreToShow && (
            <SeeMoreButton onClick={handleShowMore}>
              See {maxStores - displayCount} More Stores
            </SeeMoreButton>
          )}
        </>
      )}
    </div>
  );
};

export default StoreList;