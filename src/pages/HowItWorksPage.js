import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 80px 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 40px;
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 20px;
`;

const HowItWorksPage = () => {
  return (
    <PageContainer>
      <Title>How Kirova Works</Title>
      
      <Section>
        <SectionTitle>1. Enter Your Grocery List</SectionTitle>
        <p>Add the items you need to purchase to your shopping list.</p>
      </Section>
      
      <Section>
        <SectionTitle>2. Compare Prices Instantly</SectionTitle>
        <p>Our system automatically checks prices at stores near you to find the best deals.</p>
      </Section>
      
      <Section>
        <SectionTitle>3. Save Money on Every Trip</SectionTitle>
        <p>Head to the store with the cheapest total cart and start saving!</p>
      </Section>
    </PageContainer>
  );
};

export default HowItWorksPage;

