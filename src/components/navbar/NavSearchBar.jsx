// src/components/navbar/NavSearchBar.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const SearchContainer = styled.div`
  position: relative;
  flex: 1.2;
  margin: 0 32px;

  @media (max-width: 768px) {
    max-width: 100%;
    margin: 0 16px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 44px;
  border-radius: 30px;
  border: 1px solid #dcdcdc;
  background-color: #f7f7f7;
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: #2F8A11;
    background-color: white;
    box-shadow: 0 0 0 2px rgba(47, 138, 17, 0.2);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const NavSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };
  
  return (
    <SearchContainer>
      <SearchIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </SearchIcon>
      <form onSubmit={handleSearch}>
        <SearchInput 
          placeholder="Search products, stores, and deals" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(e);
            }
          }}
        />
      </form>
    </SearchContainer>
  );
};

export default NavSearchBar;