import React from 'react';
import styled from 'styled-components';

// Store brand configurations with colors and styling
const STORE_CONFIGS = {
  walmart: {
    primaryColor: '#0071ce',
    secondaryColor: '#ffc220',
    textColor: 'white',
    nameColor: '#0071ce',
    nameBold: true
  },
  kroger: {
    primaryColor: '#e63c2f',
    secondaryColor: '#343434',
    textColor: 'white',
    nameColor: '#e63c2f',
    nameBold: true
  },
  target: {
    primaryColor: '#cc0000',
    secondaryColor: '#ffffff',
    textColor: 'white',
    nameColor: '#cc0000',
    nameBold: true
  },
  costco: {
    primaryColor: '#005daa',
    secondaryColor: '#ffffff',
    textColor: 'white',
    nameColor: '#005daa',
    nameBold: true
  },
  "whole foods": {
    primaryColor: '#004e37',
    secondaryColor: '#ffffff',
    textColor: 'white',
    nameColor: '#004e37',
    nameBold: true
  },
  "trader joe's": {
    primaryColor: '#a10000',
    secondaryColor: '#ffffff',
    textColor: 'white',
    nameColor: '#a10000',
    nameBold: true
  },
  aldi: {
    primaryColor: '#00579f',
    secondaryColor: '#ffed00',
    textColor: 'white',
    nameColor: '#00579f',
    nameBold: true
  },
  "h-e-b": {
    primaryColor: '#e01a22',
    secondaryColor: '#ffffff',
    textColor: 'white',
    nameColor: '#e01a22',
    nameBold: true
  },
  publix: {
    primaryColor: '#007a3e',
    secondaryColor: '#ffffff',
    textColor: 'white',
    nameColor: '#007a3e',
    nameBold: true
  },
  "sprouts": {
    primaryColor: '#6fb241',
    secondaryColor: '#ffffff',
    textColor: 'white',
    nameColor: '#6fb241',
    nameBold: true
  },
  // Specific stores
  "market street": {
    primaryColor: '#2F8A11',
    secondaryColor: '#ffffff',
    textColor: 'white',
    nameColor: '#2F8A11',
    nameBold: true
  },
  "super 1 foods": {
    primaryColor: '#e63c2f',
    secondaryColor: '#ffffff',
    textColor: 'white',
    nameColor: '#e63c2f',
    nameBold: true
  },
  // Default config
  default: {
    primaryColor: '#2F8A11',
    secondaryColor: '#ffffff',
    textColor: 'white',
    nameColor: '#2F8A11',
    nameBold: true
  }
};

// Map that helps extract main brand from store names
const BRAND_MAPPINGS = {
  "kroger pharmacy": "Kroger",
  "walmart pharmacy": "Walmart",
  "kroger marketplace": "Kroger",
  "walmart supercenter": "Walmart",
  "costco pharmacy": "Costco",
  "target pharmacy": "Target",
  "whole foods market": "Whole Foods",
  "sprouts farmers market": "Sprouts",
  "h-e-b plus": "H-E-B",
  "trader joe's": "Trader Joe's",
  // Add specific store names
  "market street": "Market Street",
  "super 1 foods": "Super 1 Foods"
};

const StoreCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const StoreHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const StoreLogo = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 8px;
  background-color: ${props => props.bgColor || '#2F8A11'};
  color: ${props => props.textColor || 'white'};
  font-size: 22px;
  font-weight: bold;
  text-transform: uppercase;
`;

const StoreInfo = styled.div`
  flex: 1;
`;

const StoreName = styled.h3`
  font-size: 16px;
  font-weight: ${props => props.bold ? '700' : '600'};
  margin: 0 0 4px 0;
  color: ${props => props.textColor || '#343538'};
`;

const StoreType = styled.div`
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
`;

const StoreDetails = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailIcon = styled.div`
  margin-right: 8px;
  color: #666;
  flex-shrink: 0;
  margin-top: 3px;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const DetailText = styled.span`
  font-size: 14px;
  color: #343538;
  line-height: 1.4;
`;

const Tag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 8px;
  background-color: ${props => props.bgColor || '#e8f5e9'};
  color: ${props => props.textColor || '#2F8A11'};
`;

const TagsRow = styled.div`
  display: flex;
  margin-top: 12px;
  flex-wrap: wrap;
  gap: 8px;
`;

const Offer = styled.div`
  margin-top: auto;
  padding-top: 12px;
  font-weight: 600;
  color: ${props => props.textColor || '#2F8A11'};
`;

const StoreCard = ({ store }) => {
  // Simplify store name by extracting the main brand
  const getMainBrand = (fullName) => {
    if (!fullName) return "Unknown Store";
    
    const nameLower = fullName.toLowerCase();
    
    // Check brand mappings first
    for (const [pattern, brand] of Object.entries(BRAND_MAPPINGS)) {
      if (nameLower.includes(pattern)) {
        return brand;
      }
    }
    
    // If no specific mapping, use the full name
    return fullName;
  };

  // Get the simplified brand name
  const mainBrand = getMainBrand(store.name);
  
  // Determine the store configuration based on name
  const getStoreConfig = (storeName) => {
    const name = storeName.toLowerCase();
    
    // Check for exact matches first (for stores like "Market Street")
    if (STORE_CONFIGS[name]) {
      return STORE_CONFIGS[name];
    }
    
    // Then check for partial matches
    for (const [key, config] of Object.entries(STORE_CONFIGS)) {
      if (name.includes(key)) {
        return config;
      }
    }
    
    // Return default if no match
    return STORE_CONFIGS.default;
  };

  const config = getStoreConfig(mainBrand.toLowerCase());

  return (
    <StoreCardContainer>
      <StoreHeader>
        <StoreLogo 
          bgColor={config.primaryColor} 
          textColor={config.textColor}
        >
          {mainBrand.charAt(0)}
        </StoreLogo>
        <StoreInfo>
          <StoreName 
            textColor={config.nameColor} 
            bold={config.nameBold}
          >
            {mainBrand}
          </StoreName>
          <StoreType>
            {store.type}
          </StoreType>
        </StoreInfo>
      </StoreHeader>
      
      <StoreDetails>
        <DetailRow>
          <DetailIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </DetailIcon>
          <DetailText>Delivery by {store.deliveryTime}</DetailText>
        </DetailRow>
        
        <DetailRow>
          <DetailIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </DetailIcon>
          <DetailText>
            {store.distance} miles away • {store.address || "McKinney"}
          </DetailText>
        </DetailRow>
        
        <DetailRow>
          <DetailIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </DetailIcon>
          <DetailText>
            {'$'.repeat(store.priceLevel)} {store.priceLevel < 3 && <span style={{color: '#ccc'}}>{'$'.repeat(3 - store.priceLevel)}</span>}
          </DetailText>
        </DetailRow>
        
        <TagsRow>
          {store.hasInStorePrice && <Tag bgColor="#e8f5e9" textColor="#2F8A11">In-store prices</Tag>}
          {store.acceptsEbt && <Tag bgColor="#e3f2fd" textColor="#1976d2">Accepts EBT</Tag>}
        </TagsRow>
        
        {store.offers && <Offer textColor={config.nameColor}>{store.offers}</Offer>}
      </StoreDetails>
    </StoreCardContainer>
  );
};

export default StoreCard;