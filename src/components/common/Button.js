import React from 'react';
import styled from 'styled-components';

// Defensive approach to theme properties
const ButtonWrapper = styled.button`
  padding: ${props => (props.size === 'small' ? '8px 16px' : '12px 24px')};
  border-radius: ${props => 
    props.theme?.borderRadius?.pill || 
    props.theme?.borderRadius?.default || 
    '50px'
  };
  font-weight: 600;
  font-size: ${props => (props.size === 'small' ? '0.9rem' : '1rem')};
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  ${props => {
    // Default colors in case theme is missing
    const primaryColor = props.theme?.colors?.primary || '#71B340';
    const primaryDarkColor = props.theme?.colors?.primaryDark || '#2F4A22';
    const primaryLightColor = props.theme?.colors?.primaryLight || '#e9f5e1';
    const whiteColor = props.theme?.colors?.white || '#FFFFFF';
    
    if (props.variant === 'outline') {
      return `
        background-color: transparent;
        color: ${primaryColor};
        border: 2px solid ${primaryColor};
        
        &:hover {
          background-color: ${primaryLightColor};
        }
      `;
    }
    
    return `
      background-color: ${primaryColor};
      color: ${whiteColor};
      border: none;
      
      &:hover {
        background-color: ${primaryDarkColor};
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
    `;
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size, 
  fullWidth, 
  disabled, 
  type = 'button',
  ...rest 
}) => {
  return (
    <ButtonWrapper 
      onClick={onClick} 
      variant={variant} 
      size={size} 
      fullWidth={fullWidth}
      disabled={disabled}
      type={type}
      {...rest}
    >
      {children}
    </ButtonWrapper>
  );
};

export default Button;