import React from 'react';
import styled from 'styled-components';

const SectionContainer = styled.section`
  padding: 60px 20px;
  background-color: ${props => props.theme.colors.backgroundLight};
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 60px;
  text-transform: uppercase;
`;

const MerchantsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
  gap: 40px;
`;

const MerchantLogo = styled.div`
  height: 60px;
  display: flex;
  align-items: center;
  
  img {
    max-height: 100%;
    max-width: 150px;
  }
`;

const DownloadButton = styled.a`
  display: inline-block;
  background-color: ${props => props.theme.colors.accent};
  color: ${props => props.theme.colors.white};
  padding: 16px 40px;
  border-radius: ${props => props.theme.borderRadius.pill};
  margin-top: 60px;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  
  &:hover {
    background-color: ${props => props.theme.colors.accentHover};
  }
`;

const MerchantsSection = () => {
  // Placeholder for merchant logos
  const merchants = [
    { name: 'Walmart', logo: 'https://logo.clearbit.com/walmart.com' },
    { name: 'Kroger', logo: 'https://logo.clearbit.com/kroger.com' },
    { name: 'Target', logo: 'https://logo.clearbit.com/target.com' },
    { name: 'Albertsons', logo: 'https://logo.clearbit.com/albertsons.com' },
    { name: 'HEB', logo: 'https://logo.clearbit.com/heb.com' },
    { name: 'Whole Foods', logo: 'https://logo.clearbit.com/wholefoods.com' },
    { name: 'Trader Joes', logo: 'https://logo.clearbit.com/traderjoes.com' },
    { name: 'Safeway', logo: 'https://logo.clearbit.com/safeway.com' },
  ];
  
  return (
    <SectionContainer>
      <SectionTitle><p className="merchant-description">We compare prices from all major retailers in real-time to help you find the best deals on your grocery essentials.</p></SectionTitle>
      
      <MerchantsGrid>
        {merchants.map((merchant, index) => (
          <MerchantLogo key={index}>
            <img src={merchant.logo} alt={merchant.name} />
          </MerchantLogo>
        ))}
      </MerchantsGrid>
      
      <DownloadButton href="/download">Download the app</DownloadButton>
    </SectionContainer>
  );
};

export default MerchantsSection;