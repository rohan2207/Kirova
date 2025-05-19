import React, { useRef } from 'react';
import styled from 'styled-components';

const CarouselContainer = styled.section`
  margin-bottom: 40px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #343538;
  }
`;

const CarouselWrapper = styled.div`
  position: relative;
  overflow: hidden;
`;

const CarouselTrack = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 8px 4px;
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
`;

const CategoryCard = styled.div`
  min-width: 120px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8e9eb;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const IconContainer = styled.div`
  font-size: 36px;
  margin-bottom: 8px;
`;

const CategoryName = styled.span`
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  color: #343538;
`;

const ScrollButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid #e8e9eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.left {
    left: 0;
  }
  
  &.right {
    right: 0;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const CategoryCarousel = () => {
  const carouselRef = useRef(null);
  
  const categories = [
    { id: 'eggs', name: 'Eggs', icon: '🥚' },
    { id: 'milk', name: 'Milk', icon: '🥛' },
    { id: 'produce', name: 'Produce', icon: '🥬' },
    { id: 'bakery', name: 'Bakery', icon: '🍞' },
    { id: 'meat', name: 'Meat', icon: '🥩' },
    { id: 'seafood', name: 'Seafood', icon: '🦐' },
    { id: 'frozen', name: 'Frozen', icon: '❄️' },
    { id: 'dairy', name: 'Dairy', icon: '🧀' },
    { id: 'snacks', name: 'Snacks', icon: '🍿' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' },
    { id: 'alcohol', name: 'Alcohol', icon: '🍷' },
    { id: 'pantry', name: 'Pantry', icon: '🥫' }
  ];
  
  const scroll = (direction) => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      carouselRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <CarouselContainer>
      <SectionHeader>
        <h2>Grocery</h2>
      </SectionHeader>
      
      <CarouselWrapper>
        <ScrollButton 
          className="left" 
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </ScrollButton>
        
        <CarouselTrack ref={carouselRef}>
          {categories.map((category) => (
            <CategoryCard key={category.id}>
              <IconContainer>{category.icon}</IconContainer>
              <CategoryName>{category.name}</CategoryName>
            </CategoryCard>
          ))}
        </CarouselTrack>
        
        <ScrollButton 
          className="right" 
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </ScrollButton>
      </CarouselWrapper>
    </CarouselContainer>
  );
};

export default CategoryCarousel;