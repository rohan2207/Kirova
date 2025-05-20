// src/pages/CartPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Container = styled.div`
  padding: 80px 40px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 30px;
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 20px;
`;

const EmptyCartText = styled.p`
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
`;

const CartButton = styled.button`
  background-color: #71B340;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #5c9935;
  }
`;

const CartTable = styled.div`
  margin-top: 20px;
`;

const CartHeader = styled.div`
  display: grid;
  grid-template-columns: 100px 3fr 1fr 1fr 1fr 1fr;
  padding: 15px;
  background-color: #f3f3f3;
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  
  @media (max-width: 768px) {
    grid-template-columns: 80px 2fr 1fr 1fr;
  }
`;

const CartItems = styled.div`
  border: 1px solid #eee;
  border-top: none;
  border-radius: 0 0 8px 8px;
`;

const CartItem = styled.div`
  display: grid;
  grid-template-columns: 100px 3fr 1fr 1fr 1fr 1fr;
  padding: 15px;
  border-bottom: 1px solid #eee;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 80px 2fr 1fr 1fr;
  }
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  background-color: #f9f9f9;
`;

const ProductName = styled.div`
  font-weight: 500;
`;

const ProductSource = styled.div`
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  margin-top: 5px;
  
  img {
    width: 14px;
    height: 14px;
    margin-right: 5px;
    object-fit: contain;
    background-color: white;
    border-radius: 2px;
    padding: 1px;
  }
`;

const ProductPrice = styled.div`
  font-weight: 500;
  color: #71B340;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
`;

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityValue = styled.span`
  margin: 0 10px;
  min-width: 20px;
  text-align: center;
`;

const TotalPrice = styled.div`
  font-weight: 600;
  color: #71B340;
`;

const RemoveButton = styled.button`
  color: #ff4444;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SummarySection = styled.div`
  margin-top: 30px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
`;

const SummaryTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 15px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
    font-weight: 600;
    font-size: 18px;
  }
`;

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load cart items from localStorage
  useEffect(() => {
    try {
      const storedCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
      setCartItems(storedCart);
    } catch (error) {
      console.error('Error loading cart items:', error);
      toast.error('Failed to load your shopping list');
    } finally {
      setLoading(false);
    }
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      try {
        const updatedCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        setCartItems(updatedCart);
      } catch (error) {
        console.error('Error updating cart items:', error);
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);
  
  // Update cart in localStorage and trigger event
  const updateCart = (newCart) => {
    try {
      localStorage.setItem('shoppingCart', JSON.stringify(newCart));
      setCartItems(newCart);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update your shopping list');
    }
  };
  
  // Increment quantity
  const incrementQuantity = (index) => {
    const newCart = [...cartItems];
    newCart[index].quantity += 1;
    updateCart(newCart);
  };
  
  // Decrement quantity
  const decrementQuantity = (index) => {
    const newCart = [...cartItems];
    if (newCart[index].quantity > 1) {
      newCart[index].quantity -= 1;
      updateCart(newCart);
    }
  };
  
  // Remove item
  const removeItem = (index) => {
    const newCart = [...cartItems];
    const removedItem = newCart[index];
    newCart.splice(index, 1);
    updateCart(newCart);
    toast.info(`Removed ${removedItem.name} from your list`);
  };
  
  // Clear cart
  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your shopping list?')) {
      updateCart([]);
      toast.info('Your shopping list has been cleared');
    }
  };
  
  // Go to shopping/search
  const goShopping = () => {
    navigate('/search?q=milk');
  };
  
  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Helper function to get the logo for each source
  const getSourceLogo = (source) => {
    const logos = {
      walmart: 'https://logo.clearbit.com/walmart.com',
      kroger: 'https://logo.clearbit.com/kroger.com',
      target: 'https://logo.clearbit.com/target.com'
    };
    
    return logos[source] || null;
  };
  
  // Helper function to format source name
  const formatSourceName = (source) => {
    if (!source) return '';
    
    return source.charAt(0).toUpperCase() + source.slice(1);
  };
  
  // Show empty cart message if no items
  if (!loading && cartItems.length === 0) {
    return (
      <Container>
        <Title>Your Shopping List</Title>
        <Subtitle>Add items to your list to compare prices across stores</Subtitle>
        
        <EmptyCart>
          <EmptyCartText>Your shopping list is empty</EmptyCartText>
          <CartButton onClick={goShopping}>Start Shopping</CartButton>
        </EmptyCart>
      </Container>
    );
  }
  
  return (
    <Container>
      <Title>Your Shopping List</Title>
      <Subtitle>Manage your list and compare prices across stores</Subtitle>
      
      <CartTable>
        <CartHeader>
          <div>Image</div>
          <div>Product</div>
          <div>Price</div>
          <div>Quantity</div>
          <div>Total</div>
          <div></div>
        </CartHeader>
        
        <CartItems>
          {cartItems.map((item, index) => (
            <CartItem key={`${item.source}-${item.id || index}`}>
              <div>
                {item.imageUrl && (
                  <ProductImage src={item.imageUrl} alt={item.name} />
                )}
              </div>
              
              <div>
                <ProductName>{item.name}</ProductName>
                {item.source && (
                  <ProductSource>
                    {getSourceLogo(item.source) && (
                      <img src={getSourceLogo(item.source)} alt={item.source} />
                    )}
                    {formatSourceName(item.source)}
                  </ProductSource>
                )}
              </div>
              
              <ProductPrice>
                ${typeof item.price === 'number' 
                  ? item.price.toFixed(2) 
                  : parseFloat(item.price || 0).toFixed(2)}
              </ProductPrice>
              
              <QuantityControl>
                <QuantityButton onClick={() => decrementQuantity(index)} disabled={item.quantity <= 1}>
                  -
                </QuantityButton>
                <QuantityValue>{item.quantity}</QuantityValue>
                <QuantityButton onClick={() => incrementQuantity(index)}>
                  +
                </QuantityButton>
              </QuantityControl>
              
              <TotalPrice>
                ${(item.price * item.quantity).toFixed(2)}
              </TotalPrice>
              
              <div>
                <RemoveButton onClick={() => removeItem(index)}>
                  Remove
                </RemoveButton>
              </div>
            </CartItem>
          ))}
        </CartItems>
      </CartTable>
      
      <SummarySection>
        <SummaryTitle>Summary</SummaryTitle>
        <SummaryRow>
          <div>Subtotal</div>
          <div>${calculateSubtotal().toFixed(2)}</div>
        </SummaryRow>
        <SummaryRow>
          <div>Total</div>
          <div>${calculateSubtotal().toFixed(2)}</div>
        </SummaryRow>
      </SummarySection>
      
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <CartButton onClick={goShopping}>
          Continue Shopping
        </CartButton>
        
        <CartButton onClick={clearCart} style={{ backgroundColor: '#ff4444' }}>
          Clear List
        </CartButton>
      </div>
    </Container>
  );
};

export default CartPage;