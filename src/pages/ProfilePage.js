// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Sidebar from '../components/dashboard/Sidebar';
import Button from '../components/common/Button';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile({
            name: userData.name || '',
            email: userData.email || currentUser.email || '',
            zip: userData.zip || '',
            phone: userData.phone || ''
          });
          
          if (userData.homeAddress) {
            setHomeAddress(userData.homeAddress);
          }
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
      
      // Update user profile in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: userProfile.name,
        zip: userProfile.zip,
        phone: userProfile.phone,
        homeAddress: homeAddress
      });
      
      setSuccess("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
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
            
            <FormGroup>
              <Label>ZIP Code</Label>
              <Input 
                type="text"
                name="zip"
                value={userProfile.zip}
                onChange={handleInputChange}
                placeholder="Enter your ZIP code"
              />
            </FormGroup>
            
            <SectionTitle>Home Address</SectionTitle>
            
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