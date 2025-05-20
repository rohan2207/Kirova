import React from 'react';
import styled from 'styled-components';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
//import MapSection from '../components/home/MapSection';
import MerchantsSection from '../components/home/MerchantsSection';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const HomePage = () => {
  return (
    <PageContainer>
      <Hero />
      <Features />
      <MerchantsSection />
    </PageContainer>
  );
};

export default HomePage;