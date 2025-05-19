import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

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

const LogoText = styled(Link)`
  font-size: 2.7rem;
  font-weight: 700;
  color: #2F4A22;
  text-decoration: none;
  letter-spacing: -1px;
`;

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

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LocationSelector = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 8px 12px;
  font-size: 14px;
  color: #343538;
  cursor: pointer;

  &:hover {
    background-color: #f7f7f7;
    border-radius: 8px;
  }
`;

const LocationIcon = styled.div`
  margin-right: 6px;
  display: flex;
  align-items: center;

  svg {
    width: 18px;
    height: 18px;
    color: #2F8A11;
  }
`;

const LocationText = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  @media (max-width: 768px) {
    display: ${props => (props.isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 68px;
    left: 0;
    right: 0;
    background-color: white;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
    padding: 20px;
    z-index: 1000;
  }
`;

const CartButton = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border: none;
  background: none;
  cursor: pointer;

  &:hover {
    background-color: #f7f7f7;
    border-radius: 50%;
  }
`;

const CartIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 36px;
    height: 36px;
  }
`;

const CartCount = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #2F8A11;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  padding: 2px 6px;
  font-weight: 700;
`;

const MobileMenuToggle = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;

  svg {
    width: 24px;
    height: 24px;
    color: #343538;
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const LoginButtons = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedAddress] = useState("McKinney, TX");
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = currentUser ? 3 : 0;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleCartClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      navigate('/signup', {
        state: { message: "👋 Let's get you signed up to start building your cart and saving money!" }
      });
    }
  };

  const logoDestination = currentUser ? '/home' : '/';

  return (
    <NavContainer>
      <NavContent>
        <LogoText to={logoDestination}>Kirova</LogoText>

        <SearchContainer>
          <SearchIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </SearchIcon>
          <SearchInput placeholder="Search products, stores, and deals" />
        </SearchContainer>

        <NavRight>
          <LocationSelector>
            <LocationIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </LocationIcon>
            <LocationText>{selectedAddress}</LocationText>
          </LocationSelector>

          <NavLinks isOpen={isMenuOpen}>
            {!currentUser && (
              <LoginButtons>
                <Button onClick={() => navigate('/login')} variant="outline">Log In</Button>
                <Button onClick={() => navigate('/signup')}>Sign Up</Button>
              </LoginButtons>
            )}
          </NavLinks>

          <CartButton to={currentUser ? "/cart" : "#"} onClick={handleCartClick}>
            <CartIcon>
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="10" r="5" fill="#2F8A11" />
                <rect x="10" y="15" width="4" height="23" rx="2" fill="#2F8A11" />
                <path d="M12 22 L24 12" stroke="#2F8A11" strokeWidth="4" strokeLinecap="round" />
                <path d="M12 22 L24 35" stroke="#2F8A11" strokeWidth="4" strokeLinecap="round" />
                <path d="M35 35 L55 35 L52 20 L38 20 Z" fill="none" stroke="#2F8A11" strokeWidth="2.5" />
                <path d="M38 20 L35 14 L32 14" stroke="#2F8A11" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="42" cy="40" r="2.5" fill="none" stroke="#2F8A11" strokeWidth="1.5" />
                <circle cx="52" cy="40" r="2.5" fill="none" stroke="#2F8A11" strokeWidth="1.5" />
              </svg>
            </CartIcon>
            {cartCount > 0 && <CartCount>{cartCount}</CartCount>}
          </CartButton>
        </NavRight>
      </NavContent>
    </NavContainer>
  );
};

export default Navbar;
