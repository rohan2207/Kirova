import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import useUserLocation from '../hooks/useUserLocation';

const Container = styled.div`
  padding: 80px 40px;
`;

const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 8px;
`;

const Input = styled.input`
  padding: 8px;
  font-size: 1rem;
  margin-right: 10px;
  width: 250px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: black;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

function ComparisonPage() {
  const { currentUser } = useAuth();
  const { location, error } = useUserLocation();

  const [cartItems, setCartItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [qty, setQty] = useState(1);

  const fetchCart = async () => {
    if (!currentUser) return;
    const cartRef = doc(db, 'carts', currentUser.uid);
    const snapshot = await getDoc(cartRef);
    if (snapshot.exists()) {
      setCartItems(snapshot.data().items || []);
    }
  };

  const saveCart = async (updatedItems) => {
    if (!currentUser) return;
    const cartRef = doc(db, 'carts', currentUser.uid);
    await setDoc(cartRef, {
      userId: currentUser.uid,
      items: updatedItems,
      lastUpdated: new Date().toISOString()
    });
  };

  const addToCart = async () => {
    if (!newItem.trim()) return;
    const updated = [...cartItems, {
      query: newItem.trim(),
      qty: parseInt(qty),
      timestamp: new Date().toISOString()
    }];
    setCartItems(updated);
    await saveCart(updated);
    setNewItem('');
    setQty(1);
  };

  const removeItem = async (index) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
    await saveCart(updated);
  };

  useEffect(() => {
    fetchCart();
  }, [currentUser]);

  return (
    <Container>
      <h1>Compare Grocery Prices</h1>
      <p>Enter your grocery list and we'll find the cheapest store near you.</p>

      {location && (
        <div style={{ marginBottom: 20, color: 'gray' }}>
          📍 Location detected: {location.city}, {location.state} {location.zip}
        </div>
      )}
      {error && (
        <div style={{ color: 'red' }}>{error}</div>
      )}

      <div style={{ marginBottom: 20 }}>
        <Input
          placeholder="Add item (e.g. borden milk)"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <Input
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          style={{ width: 60 }}
        />
        <Button onClick={addToCart}>Add</Button>
      </div>

      {cartItems.map((item, idx) => (
        <CartItem key={idx}>
          <span>{item.qty} × {item.query}</span>
          <Button onClick={() => removeItem(idx)}>Remove</Button>
        </CartItem>
      ))}
    </Container>
  );
}

export default ComparisonPage;
