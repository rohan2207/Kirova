// src/components/common/Navbar.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import our component modules
import Logo from '../navbar/Logo';
import NavSearchBar from '../navbar/NavSearchBar';
import LocationSelector from '../navbar/LocationSelector';
import UserMenu from '../navbar/UserMenu';
import CartIcon from '../navbar/CartIcon';

const NavContainer = styled.nav`
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 12px 0;
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3); // This should eventually come from a cart context
  
  const { currentUser, signOut } = useAuth();
  const location = useLocation();
  
  // Reset menu state when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  return (
    <NavContainer>
      <NavContent>
        <Logo currentUser={currentUser} />
        <NavSearchBar />
        <NavRight>
          <LocationSelector currentUser={currentUser} />
          <UserMenu 
            currentUser={currentUser} 
            signOut={signOut} 
            isMenuOpen={isMenuOpen} 
          />
          <CartIcon 
            count={cartCount} 
            currentUser={currentUser} 
          />
        </NavRight>
      </NavContent>
    </NavContainer>
  );
};

export default Navbar;