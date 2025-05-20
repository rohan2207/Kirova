// src/components/navbar/UserMenu.js
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { handleLogout } from '../../services/authService';

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

const UserMenu = ({ currentUser, isMenuOpen }) => {
  const navigate = useNavigate();
  
  const onLogout = async () => {
    // Use the reusable logout handler and pass the navigate function
    await handleLogout(navigate);
  };
  
  return (
    <NavLinks isOpen={isMenuOpen}>
      {!currentUser ? (
        <Button onClick={() => navigate('/login')} variant="outline">Log In</Button>
      ) : (
        <Button onClick={onLogout} variant="outline">Log Out</Button>
      )}
    </NavLinks>
  );
};

export default UserMenu;