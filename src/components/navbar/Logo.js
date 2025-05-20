// src/components/navbar/Logo.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const LogoLink = styled(Link)`
  font-size: 2.7rem;
  font-weight: 700;
  color: #2F4A22;
  text-decoration: none;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  height: 70px;
`;

const Logo = ({ currentUser }) => {
  // Choose destination based on authentication status
  const logoDestination = currentUser ? '/home' : '/';
  
  return (
    <LogoLink to={logoDestination}>
      Kirova
    </LogoLink>
  );
};

export default Logo;