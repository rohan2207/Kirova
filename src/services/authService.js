// src/services/authService.js
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { toast } from 'react-toastify';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Function to load user cart from Firebase
export const loadUserCart = async (userId) => {
  try {
    if (!userId) return null;
    
    // Fetch the user's cart from Firestore
    const userCartRef = doc(db, 'carts', userId);
    const cartSnapshot = await getDoc(userCartRef);
    
    if (cartSnapshot.exists() && cartSnapshot.data().items) {
      return cartSnapshot.data().items;
    }
    
    return null;
  } catch (error) {
    console.error("Error loading user cart:", error);
    return null;
  }
};

// Enhanced signOut function with cleanup
export const signOutWithCleanup = async () => {
  try {
    // Clear user-specific localStorage items
    localStorage.removeItem('shoppingCart');
    localStorage.setItem('cartOwner', 'guest');
    
    // Reset location if it belongs to the user
    const lastUserID = localStorage.getItem('locationUserID');
    if (lastUserID && lastUserID !== 'guest') {
      localStorage.removeItem('userCity');
      localStorage.removeItem('userState');
      localStorage.removeItem('userZip');
      localStorage.removeItem('userAddress');
      localStorage.setItem('locationUserID', 'guest');
      localStorage.setItem('kirova_location_changed', 'true');
    }
    
    // Dispatch events to update components
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Finally, sign out from Firebase
    await signOut(auth);
    
    return { success: true };
  } catch (error) {
    console.error("Error during sign out:", error);
    return { success: false, error: error.message };
  }
};

// Create a reusable logout function that includes navigation and toast
export const handleLogout = async (navigate) => {
  try {
    const result = await signOutWithCleanup();
    if (result.success) {
      toast.success("You have been logged out successfully");
      if (navigate) {
        navigate('/');
      }
      return true;
    } else {
      toast.error("Failed to log out. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("An unexpected error occurred during logout");
    return false;
  }
};

// Login success handler to set up user session
export const handleLoginSuccess = async (user, navigate, destination = '/home') => {
  try {
    // Set a flag in localStorage to indicate this is a login event
    localStorage.setItem('isLoginEvent', 'true');
    
    // Set the cart owner to the user's ID
    localStorage.setItem('cartOwner', user.uid);
    
    // Load user's cart from Firebase and restore it
    const savedCart = await loadUserCart(user.uid);
    
    if (savedCart && savedCart.length > 0) {
      // Save the cart to localStorage
      localStorage.setItem('shoppingCart', JSON.stringify(savedCart));
      
      // Notify other components that the cart has been updated
      window.dispatchEvent(new Event('cartUpdated'));
      
      console.log("Restored user cart from Firebase:", savedCart.length, "items");
    } else {
      // If no saved cart is found, clear any existing cart
      localStorage.removeItem('shoppingCart');
      window.dispatchEvent(new Event('cartUpdated'));
    }
    
    // Set the location user ID
    localStorage.setItem('locationUserID', user.uid);
    
    // Show toast notification
    toast.success("👋 Welcome back! Let's find you the best deals near you.");
    
    // Navigate to the destination
    if (navigate) {
      navigate(destination);
    }
    
    return true;
  } catch (error) {
    console.error("Error in handleLoginSuccess:", error);
    return false;
  }
};

// Export other auth-related functions as needed
export * from "./firebase"; // Re-export firebase auth functions