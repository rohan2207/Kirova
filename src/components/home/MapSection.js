import React from 'react';
import styled from 'styled-components';

const SectionContainer = styled.section`
  padding: 60px 20px;
  background-color: ${props => props.theme.colors.backgroundLight};
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 40px;
  text-transform: uppercase;
`;

const MapContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  border-radius: ${props => props.theme.borderRadius.medium};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.medium};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StoreList = styled.div`
  flex: 1;
  background-color: ${props => props.theme.colors.white};
`;

const SearchInput = styled.div`
  padding: 20px;
  position: relative;
  border-bottom: 1px solid ${props => props.theme.colors.divider};
  
  input {
    width: 100%;
    padding: 12px 16px;
    border-radius: ${props => props.theme.borderRadius.medium};
    border: 1px solid ${props => props.theme.colors.divider};
    font-size: 1rem;
    padding-left: 40px;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
    }
  }
  
  &::before {
    content: '🔍';
    position: absolute;
    left: 36px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.5;
  }
`;

const StoreItem = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${props => props.theme.colors.divider};
  
  &:hover {
    background-color: ${props => props.theme.colors.background};
    cursor: pointer;
  }
`;

const StoreName = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 5px;
`;

const StoreAddress = styled.p`
  color: ${props => props.theme.colors.textLight};
  font-size: 0.9rem;
`;

const MapView = styled.div`
  flex: 1;
  min-height: 500px;
  background-color: #E8EEF4;
  background-image: url('https://cdn.pixabay.com/photo/2023/02/28/08/39/map-7859229_1280.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
`;

const MapControls = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.small};
  box-shadow: ${props => props.theme.shadows.small};
  
  button {
    border: none;
    background: none;
    padding: 8px;
    font-size: 1.2rem;
    cursor: pointer;
    
    &:hover {
      background-color: ${props => props.theme.colors.background};
    }
  }
`;

const MapSection = () => {
  const stores = [
    { name: 'Walmart Supercenter', address: '2700 S Stemmons Fwy, Lewisville, TX 75067' },
    { name: 'Kroger', address: '4620 TX-121, Lewisville, TX 75056' },
    { name: 'Tom Thumb', address: '1100 Flower Mound Rd, Flower Mound, TX 75028' },
    { name: 'Target', address: '4760 TX-121, Lewisville, TX 75056' },
    { name: 'Albertsons', address: '1601 W Hebron Pkwy, Carrollton, TX 75010' },
  ];
  
  return (
    <SectionContainer>
      <SectionTitle>FIND THE BEST GROCERY DEALS NEAR YOU</SectionTitle>
      
      <MapContainer>
        <StoreList>
          <SearchInput>
            <input type="text" placeholder="Enter address or postal code.." />
          </SearchInput>
          
          {stores.map((store, index) => (
            <StoreItem key={index}>
              <StoreName>{store.name}</StoreName>
              <StoreAddress>{store.address}</StoreAddress>
            </StoreItem>
          ))}
        </StoreList>
        
        <MapView>
          <MapControls>
            <button>+</button>
            <button>−</button>
          </MapControls>
        </MapView>
      </MapContainer>
    </SectionContainer>
  );
};

export default MapSection;