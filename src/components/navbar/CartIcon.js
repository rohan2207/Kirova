// src/components/navbar/CartIcon.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

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

const CartIconComponent = ({ currentUser }) => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  
  // Save cart to Firebase for persistence
  const saveCartToFirebase = async (cart) => {
    try {
      if (!currentUser) return;
      
      const cartRef = doc(db, 'carts', currentUser.uid);
      await setDoc(cartRef, {
        userId: currentUser.uid,
        items: cart,
        lastUpdated: new Date().toISOString()
      });
      console.log("Cart saved to Firebase:", cart.length, "items");
    } catch (error) {
      console.error("Error saving cart to Firebase:", error);
    }
  };
  
  // Update cart count from localStorage and sync with Firebase if needed
  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
      // Calculate total items (sum of quantities)
      const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(count);
      
      // If user is logged in and cart has items, save to Firebase
      if (currentUser && cart.length > 0) {
        saveCartToFirebase(cart);
      }
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
      setCartCount(0);
    }
  };
  
  // Initialize cart count and listen for updates
  useEffect(() => {
    // Function to check and clear cart if needed
    const handleUserChange = () => {
      // If user is not logged in, ensure we're not showing previous user's cart
      if (!currentUser) {
        // Get the cart owner from localStorage
        const cartOwner = localStorage.getItem('cartOwner');
        
        // If cart exists but belongs to a previous user (or no cartOwner is set), clear it
        if (localStorage.getItem('shoppingCart') && (!cartOwner || cartOwner !== 'guest')) {
          localStorage.removeItem('shoppingCart');
          localStorage.setItem('cartOwner', 'guest');
          setCartCount(0);
          // Dispatch event to notify other components
          window.dispatchEvent(new Event('cartUpdated'));
        }
      } else {
        // Set cart owner to current user ID
        localStorage.setItem('cartOwner', currentUser.uid);
      }
    };
    
    // Run on component mount and when currentUser changes
    handleUserChange();
    
    // Update cart count
    updateCartCount();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      updateCartCount();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Clean up
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [currentUser]); // Add currentUser as dependency
  
  // Choose destination based on authentication status
  const cartDestination = currentUser ? "/cart" : "#";
  
  const handleCartClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      // We'll navigate to signup and pass a welcome message
      navigate('/signup', {
        state: { message: "👋 Let's get you signed up to start building your cart and saving money!" }
      });
    } else if (cartCount === 0) {
      e.preventDefault();
      toast.info("Your cart is empty. Add some items to get started!");
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
      {cartCount > 0 && <CartCount>{cartCount}</CartCount>}
    </CartButton>
  );
};

export default CartIconComponent;