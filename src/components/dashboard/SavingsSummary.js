import React from 'react';
import styled from 'styled-components';

const SummaryContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8e9eb;
  padding: 20px;
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #343538;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  
  svg, span {
    margin-right: 8px;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SavingsCard = styled.div`
  background-color: ${props => props.bgColor || '#f7f8fa'};
  border-radius: 10px;
  padding: 16px;
  height: 100%;
`;

const CardLabel = styled.div`
  font-size: 14px;
  color: ${props => props.color || '#666'};
  margin-bottom: 8px;
`;

const CardValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.color || '#343538'};
  margin-bottom: 8px;
`;

const CardDescription = styled.div`
  font-size: 12px;
  color: #666;
`;

const ProgressContainer = styled.div`
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e8e9eb;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  span {
    font-size: 14px;
    
    &:first-child {
      color: #666;
    }
    
    &:last-child {
      color: #2f8a11;
      font-weight: 600;
    }
  }
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: #e8e9eb;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.percentage || '0%'};
  background-color: #2f8a11;
  border-radius: 4px;
`;

const SavingsSummary = ({ totalSaved = 0 }) => {
  // Mock data for comparison
  const cheapestTotal = 24.85;
  const mostExpensive = 31.20;
  const currentSavings = totalSaved || 6.35;
  const savingsPercentage = Math.round((currentSavings / mostExpensive) * 100);
  
  return (
    <SummaryContainer>
      <SectionTitle>
        <span>💰</span> Your Savings
      </SectionTitle>
      
      <CardGrid>
        <SavingsCard bgColor="#f1f8ee">
          <CardLabel color="#2f8a11">Cheapest Total</CardLabel>
          <CardValue color="#2f8a11">${cheapestTotal.toFixed(2)}</CardValue>
          <CardDescription>Lowest price across all stores</CardDescription>
        </SavingsCard>
        
        <SavingsCard bgColor="#fff8ee">
          <CardLabel color="#e67700">Most Expensive</CardLabel>
          <CardValue color="#e67700">${mostExpensive.toFixed(2)}</CardValue>
          <CardDescription>Highest price across all stores</CardDescription>
        </SavingsCard>
        
        <SavingsCard bgColor="#eef7ff">
          <CardLabel color="#0f609b">Your Savings</CardLabel>
          <CardValue color="#0f609b">${currentSavings.toFixed(2)}</CardValue>
          <CardDescription>Total saved using Kirova</CardDescription>
        </SavingsCard>
      </CardGrid>
      
      <ProgressContainer>
        <ProgressLabel>
          <span>Current cart savings:</span>
          <span>{savingsPercentage}% cheaper</span>
        </ProgressLabel>
        <ProgressBar>
          <ProgressFill percentage={`${savingsPercentage}%`} />
        </ProgressBar>
      </ProgressContainer>
    </SummaryContainer>
  );
};

export default SavingsSummary;