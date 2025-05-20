// src/components/navbar/CartIcon.js
import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';

const CartButton = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  border: none;
  background: none;
  cursor: pointer;
  margin-left: 10px;

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
    width: 70px;
    height: 70px;
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

const CartIconComponent = ({ count, currentUser }) => {
  const navigate = useNavigate();
  
  // Choose destination based on authentication status
  const cartDestination = currentUser ? "/cart" : "#";
  
  const handleCartClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      navigate('/signup', {
        state: { message: "👋 Let's get you signed up to start building your cart and saving money!" }
      });
    }
  };
  
  return (
    <CartButton to={cartDestination} onClick={handleCartClick}>
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
      {count > 0 && currentUser && <CartCount>{count}</CartCount>}
    </CartButton>
  );
};

export default CartIconComponent;