import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import AnimatedBackground from '../common/AnimatedBackground';

// Add these styled component definitions
const HeroContainer = styled.div`
  position: relative;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: hidden;
  background-color: ${props => props.theme.colors.backgroundLight || '#f9fafb'};
`;

const HeroContent = styled.div`
  max-width: 1000px;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.primaryDark || '#2F4A22'};
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: ${props => props.theme.colors.text || '#333'};
  max-width: 800px;
  margin: 0 auto 2rem auto;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Hero = () => {
  return (
    <HeroContainer>
      <AnimatedBackground />
      <HeroContent>
        <HeroTitle>Save money on your groceries with Kirova</HeroTitle>
        <HeroSubtitle>
          Compare prices across multiple grocery stores and find the best deals near you
        </HeroSubtitle>
        
        <ButtonGroup>
          <Button
            as={Link}
            to="/signup"
            size="large"
          >
            Start Comparing
          </Button>
          <Button
            as={Link}
            to="/how-it-works"
            variant="outline"
            size="large"
          >
            How It Works
          </Button>
        </ButtonGroup>
      </HeroContent>
    </HeroContainer>
  );
};

export default Hero;