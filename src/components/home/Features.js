import React from 'react';
import styled from 'styled-components';
import { FaClock, FaMoneyBillWave, FaCheckCircle, FaRecycle } from 'react-icons/fa';
import AnimatedBackground from '../common/AnimatedBackground';

const SectionContainer = styled.section`
  padding: 80px 40px;
  background-color: ${props => props.theme.colors.background};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50px;
    left: -50px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background-color: ${props => props.theme.colors.primaryLight};
    opacity: 0.5;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -50px;
    right: -50px;
    width: 250px;
    height: 250px;
    border-radius: 50%;
    background-color: ${props => props.theme.colors.primaryLight};
    opacity: 0.5;
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 60px;
  color: ${props => props.theme.colors.text};
  position: relative;
  z-index: 1;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background-color: ${props => props.theme.colors.primary};
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 40px;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.default};
  padding: 30px;
  text-align: center;
  box-shadow: ${props => props.theme.shadows.medium};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 1;
  border-top: 4px solid ${props => props.theme.colors.primary};
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: ${props => props.theme.shadows.large};
  }
`;

const IconContainer = styled.div`
  font-size: 2.5rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 20px;
  background-color: ${props => props.theme.colors.primaryLight};
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 15px;
  color: ${props => props.theme.colors.text};
`;

const FeatureDescription = styled.p`
  color: ${props => props.theme.colors.textLight};
  font-size: 1rem;
  line-height: 1.6;
`;

const Features = () => {
  const features = [
    {
      title: "Compare Instantly",
      icon: <FaClock />,
      description: "Enter your grocery list and see which store offers the cheapest total cart in real-time."
    },
    {
      title: "Save More, Shop Smarter",
      icon: <FaMoneyBillWave />,
      description: "No more hopping between tabs. We bring price transparency to your fingertips."
    },
    {
      title: "Verified Local Prices",
      icon: <FaCheckCircle />,
      description: "Powered by real-time APIs and updated daily — what you see is what you pay."
    },
    {
      title: "Reduce Food Waste",
      icon: <FaRecycle />,
      description: "Smart shopping helps you buy only what you need, reducing waste and helping the environment."
    }
  ];

  return (
    <SectionContainer>
      <AnimatedBackground />
      <SectionTitle>Why Kirova?</SectionTitle>
      <FeaturesGrid>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <IconContainer>{feature.icon}</IconContainer>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDescription>{feature.description}</FeatureDescription>
          </FeatureCard>
        ))}
      </FeaturesGrid>
    </SectionContainer>
  );
};

export default Features;