import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';

const SidebarContainer = styled.div`
  width: 210px;
  background-color: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  padding: 24px 0;
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 1023px) {
    display: none;
  }
`;

const SidebarSection = styled.div`
  padding: 0 16px;
  margin-bottom: 24px;
`;

const SidebarTitle = styled.h3`
  font-size: 13px;
  text-transform: uppercase;
  color: #9e9e9e;
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: 16px;
  padding: 0 8px;
`;

const SidebarItemContainer = styled.div`
  padding: 12px 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  background-color: ${props => props.active ? 'rgba(47, 138, 17, 0.08)' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.active ? 'rgba(47, 138, 17, 0.12)' : 'rgba(0, 0, 0, 0.04)'};
  }
`;

const SidebarIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: ${props => props.active ? '#2F8A11' : '#616161'};
`;

const SidebarText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.active ? '#2F8A11' : '#616161'};
`;

const SidebarLink = styled(Link)`
  text-decoration: none;
  display: block;
  
  &:hover {
    text-decoration: none;
  }
`;

const LogoContainer = styled.div`
  padding: 0 24px 24px;
  display: flex;
  align-items: center;
`;

const LogoImage = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #2F8A11;
  margin-right: 8px;
`;

const LogoText = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #333;
`;

const SidebarItem = ({ icon, text, to, active }) => {
  return (
    <SidebarLink to={to}>
      <SidebarItemContainer active={active}>
        <SidebarIcon active={active}>{icon}</SidebarIcon>
        <SidebarText active={active}>{text}</SidebarText>
      </SidebarItemContainer>
    </SidebarLink>
  );
};

const Sidebar = () => {
  const location = useLocation();
  
  // Check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <SidebarContainer>
      <LogoContainer>
        <LogoImage>🛒</LogoImage>
        <LogoText>Kirova</LogoText>
      </LogoContainer>
      
      <SidebarSection>
        <SidebarTitle>Main</SidebarTitle>
        
        <SidebarItem 
          icon="🏠" 
          text="Dashboard" 
          to="/home" 
          active={isActive('/home')}
        />
        
        <SidebarItem 
          icon="🔍" 
          text="Browse Stores" 
          to="/browse" 
          active={isActive('/browse')}
        />
        
        <SidebarItem 
          icon="📊" 
          text="Compare Prices" 
          to="/compare" 
          active={isActive('/compare')}
        />
        
        <SidebarItem 
          icon="📝" 
          text="Shopping Lists" 
          to="/lists" 
          active={isActive('/lists')}
        />
      </SidebarSection>
      
      <SidebarSection>
        <SidebarTitle>Personal</SidebarTitle>
        
        <SidebarItem 
          icon="⭐" 
          text="Favorites" 
          to="/favorites" 
          active={isActive('/favorites')}
        />
        
        <SidebarItem 
          icon="⏱️" 
          text="History" 
          to="/history" 
          active={isActive('/history')}
        />
        
        <SidebarItem 
          icon="💰" 
          text="Savings" 
          to="/savings" 
          active={isActive('/savings')}
        />
      </SidebarSection>
      
      <SidebarSection>
        <SidebarTitle>Account</SidebarTitle>
        
        <SidebarItem 
          icon="👤" 
          text="Profile" 
          to="/profile" 
          active={isActive('/profile')}
        />
        
        <SidebarItem 
          icon="⚙️" 
          text="Settings" 
          to="/settings" 
          active={isActive('/settings')}
        />
        
        <SidebarItem 
          icon="❓" 
          text="Help & Support" 
          to="/help" 
          active={isActive('/help')}
        />
      </SidebarSection>
    </SidebarContainer>
  );
};

export default Sidebar;