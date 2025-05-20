// src/components/navbar/UserMenu.js
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

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

const UserMenu = ({ currentUser, signOut, isMenuOpen }) => {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  return (
    <NavLinks isOpen={isMenuOpen}>
      {!currentUser ? (
        <Button onClick={() => navigate('/login')} variant="outline">Log In</Button>
      ) : (
        <Button onClick={handleLogout} variant="outline">Log Out</Button>
      )}
    </NavLinks>
  );
};

export default UserMenu;