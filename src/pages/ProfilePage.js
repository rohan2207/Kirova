// src/pages/ProfilePage.js - Updated to ensure proper data loading
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Sidebar from '../components/dashboard/Sidebar';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f7f8fa;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 24px 32px;
  max-width: calc(100% - 210px);
  
  @media (max-width: 1023px) {
    max-width: 100%;
    padding: 16px;
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #343538;
`;

const ProfileCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #343538;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #343538;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #2F8A11;
    box-shadow: 0 0 0 2px rgba(47, 138, 17, 0.1);
  }
`;

const ErrorMessage = styled.p`
  color: #e53935;
  margin-top: 4px;
  font-size: 14px;
`;

const SuccessMessage = styled.p`
  color: #2F8A11;
  margin-top: 4px;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(47, 138, 17, 0.2);
  border-radius: 50%;
  border-top-color: #2F8A11;
  animation: spin 1s ease-in-out infinite;
  margin: 2rem auto;
  display: block;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    zip: '',
    phone: ''
  });
  const [homeAddress, setHomeAddress] = useState({
    line1: '',
    city: '',
    state: '',
    zip: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Log current user to debug
  useEffect(() => {
    console.log("Current user in ProfilePage:", currentUser);
  }, [currentUser]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) {
        console.log("No current user found");
        setLoading(false);
        return;
      }
      
      try {
        console.log("Fetching user profile for:", currentUser.uid);
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("User data retrieved:", userData);
          
          // Set up profile data
          setUserProfile({
            name: userData.name || '',
            email: userData.email || currentUser.email || '',
            zip: userData.zip || '',
            phone: userData.phone || ''
          });
          
          // Look for address data in various possible locations
          if (userData.homeAddress) {
            setHomeAddress(userData.homeAddress);
          } else if (userData.primaryAddress) {
            // Try to use primaryAddress if homeAddress doesn't exist
            setHomeAddress({
              line1: userData.primaryAddress.line1 || '',
              city: userData.primaryAddress.city || '',
              state: userData.primaryAddress.state || '',
              zip: userData.primaryAddress.zip || ''
            });
          } else {
            // Fall back to direct fields if neither address object exists
            setHomeAddress({
              line1: userData.address || '',
              city: userData.city || '',
              state: userData.state || '',
              zip: userData.zip || ''
            });
          }
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log("Updating profile with:", { userProfile, homeAddress });
      
      // Update both the primary address object and the direct fields for compatibility
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: userProfile.name,
        zip: homeAddress.zip || userProfile.zip, // Prefer address zip over profile zip
        phone: userProfile.phone,
        address: homeAddress.line1,
        city: homeAddress.city,
        state: homeAddress.state,
        // Update address objects
        homeAddress: homeAddress,
        primaryAddress: {
          ...homeAddress,
          id: `primary-${Date.now()}`,
          isHome: true,
          timestamp: new Date().toISOString()
        }
      });
      
      // Save to localStorage for immediate use
      localStorage.setItem('userCity', homeAddress.city);
      localStorage.setItem('userState', homeAddress.state);
      localStorage.setItem('userZip', homeAddress.zip);
      localStorage.setItem('userAddress', homeAddress.line1);
      
      // Set flag to indicate location change
      localStorage.setItem('kirova_location_changed', 'true');
      
      setSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setHomeAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading && !userProfile.email) {
    return (
      <PageContainer>
        <Sidebar />
        <MainContent>
          <PageTitle>Your Profile</PageTitle>
          <LoadingSpinner />
        </MainContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Sidebar />
      <MainContent>
        <PageTitle>Your Profile</PageTitle>
        
        <ProfileCard>
          <SectionTitle>Personal Information</SectionTitle>
          <form onSubmit={handleProfileUpdate}>
            <FormGroup>
              <Label>Full Name</Label>
              <Input 
                type="text"
                name="name"
                value={userProfile.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Email</Label>
              <Input 
                type="email"
                name="email"
                value={userProfile.email}
                disabled
                placeholder="Your email address"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Phone Number</Label>
              <Input 
                type="tel"
                name="phone"
                value={userProfile.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </FormGroup>
            
            <SectionTitle style={{marginTop: "32px"}}>Home Address</SectionTitle>
            
            <FormGroup>
              <Label>Street Address</Label>
              <Input 
                type="text"
                name="line1"
                value={homeAddress.line1}
                onChange={handleAddressChange}
                placeholder="Enter your street address"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>City</Label>
              <Input 
                type="text"
                name="city"
                value={homeAddress.city}
                onChange={handleAddressChange}
                placeholder="Enter your city"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>State</Label>
              <Input 
                type="text"
                name="state"
                value={homeAddress.state}
                onChange={handleAddressChange}
                placeholder="Enter your state"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>ZIP Code</Label>
              <Input 
                type="text"
                name="zip"
                value={homeAddress.zip}
                onChange={handleAddressChange}
                placeholder="Enter your ZIP code"
              />
            </FormGroup>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Save Changes'}
            </Button>
          </form>
        </ProfileCard>
      </MainContent>
    </PageContainer>
  );
};

export default ProfilePage;