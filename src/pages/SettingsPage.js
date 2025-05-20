// src/pages/SettingsPage.js
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
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

const SettingsCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
`;

const SettingCategory = styled.div`
  margin-bottom: 28px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #343538;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #343538;
`;

const SettingDescription = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

const ActionButton = styled(Button)`
  padding: 8px 16px;
  font-size: 14px;
`;

const SettingAction = styled(Link)`
  color: #2F8A11;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SettingsPage = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <PageContainer>
      <Sidebar />
      <MainContent>
        <PageTitle>Settings</PageTitle>
        
        <SettingsCard>
          <SettingCategory>
            <CategoryTitle>Account</CategoryTitle>
            
            <SettingRow>
              <div>
                <SettingLabel>Profile Information</SettingLabel>
                <SettingDescription>Manage your personal information and address</SettingDescription>
              </div>
              <SettingAction to="/profile">Edit</SettingAction>
            </SettingRow>
            
            <SettingRow>
              <div>
                <SettingLabel>Email Address</SettingLabel>
                <SettingDescription>{currentUser?.email}</SettingDescription>
              </div>
              <SettingAction to="/profile">Change</SettingAction>
            </SettingRow>
            
            <SettingRow>
              <div>
                <SettingLabel>Password</SettingLabel>
                <SettingDescription>Update your password</SettingDescription>
              </div>
              <SettingAction to="/change-password">Change</SettingAction>
            </SettingRow>
          </SettingCategory>
          
          <SettingCategory>
            <CategoryTitle>Preferences</CategoryTitle>
            
            <SettingRow>
              <div>
                <SettingLabel>Default Location</SettingLabel>
                <SettingDescription>Change your primary shopping location</SettingDescription>
              </div>
              <SettingAction to="/profile">Edit</SettingAction>
            </SettingRow>
            
            <SettingRow>
              <div>
                <SettingLabel>Notifications</SettingLabel>
                <SettingDescription>Manage your email preferences</SettingDescription>
              </div>
              <SettingAction to="/notifications">Manage</SettingAction>
            </SettingRow>
          </SettingCategory>
          
          <SettingCategory>
            <CategoryTitle>Security</CategoryTitle>
            
            <SettingRow>
              <div>
                <SettingLabel>Sign out from all devices</SettingLabel>
                <SettingDescription>Secure your account by signing out everywhere</SettingDescription>
              </div>
              <ActionButton onClick={handleLogout} variant="outline">Sign Out</ActionButton>
            </SettingRow>
            
            <SettingRow>
              <div>
                <SettingLabel>Delete Account</SettingLabel>
                <SettingDescription>Permanently delete your account and data</SettingDescription>
              </div>
              <ActionButton variant="outline" style={{ color: '#D32F2F', borderColor: '#D32F2F' }}>
                Delete
              </ActionButton>
            </SettingRow>
          </SettingCategory>
        </SettingsCard>
      </MainContent>
    </PageContainer>
  );
};

export default SettingsPage;