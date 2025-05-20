// src/pages/LoginPage.js
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { auth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from '../services/firebase';
import { handleLoginSuccess } from '../services/authService';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  padding: 40px 20px;
  background-color: ${props => props.theme?.colors?.background || '#F7F9F4'};
`;

const FormContainer = styled.div`
  background-color: ${props => props.theme?.colors?.white || '#FFFFFF'};
  border-radius: ${props => props.theme?.borderRadius?.default || '8px'};
  padding: 40px;
  box-shadow: ${props => props.theme?.shadows?.medium || '0 4px 16px rgba(0, 0, 0, 0.12)'};
  width: 100%;
  max-width: 480px;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 30px;
  text-align: center;
  color: ${props => props.theme?.colors?.text || '#383838'};
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: ${props => props.theme?.colors?.text || '#383838'};
  font-family: 'Inter', sans-serif;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  border: 1px solid ${props => props.theme?.colors?.border || '#DEEBD1'};
  border-radius: ${props => props.theme?.borderRadius?.small || '4px'};
  font-size: 1rem;
  transition: border-color 0.2s;
  font-family: 'Inter', sans-serif;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.primary || '#71B340'};
    box-shadow: 0 0 0 2px ${props => props.theme?.colors?.primaryLight || '#E9F5E1'};
  }
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme?.colors?.error || '#D32F2F'};
  margin-top: 20px;
  margin-bottom: 10px;
  text-align: center;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
`;

const ForgotPassword = styled(Link)`
  display: block;
  text-align: right;
  margin-top: -16px;
  margin-bottom: 20px;
  color: ${props => props.theme?.colors?.primary || '#71B340'};
  font-size: 0.9rem;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoginButton = styled.button`
  padding: 14px;
  background-color: ${props => props.theme?.colors?.primary || '#71B340'};
  color: white;
  border: none;
  border-radius: ${props => props.theme?.borderRadius?.small || '4px'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
  font-family: 'Inter', sans-serif;
  
  &:hover {
    background-color: ${props => props.theme?.colors?.primaryDark || '#2F4A22'};
  }
  
  &:disabled {
    background-color: #A9A9A9;
    cursor: not-allowed;
  }
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  
  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${props => props.theme?.colors?.border || '#DEEBD1'};
  }
  
  span {
    padding: 0 16px;
    color: ${props => props.theme?.colors?.textLight || '#666666'};
    font-size: 0.875rem;
    font-family: 'Inter', sans-serif;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: white;
  border: 1px solid ${props => props.theme?.colors?.border || '#DEEBD1'};
  border-radius: ${props => props.theme?.borderRadius?.small || '4px'};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  font-family: 'Inter', sans-serif;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  img {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
`;

const LinkText = styled.p`
  margin-top: 24px;
  text-align: center;
  font-size: 0.95rem;
  color: ${props => props.theme?.colors?.textLight || '#666666'};
  font-family: 'Inter', sans-serif;
  
  a {
    color: ${props => props.theme?.colors?.primary || '#71B340'};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the path they were trying to access before being redirected
  const from = location.state?.from?.pathname || '/home';
  
  const handleLoginWithEmail = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleLoginSuccess(result.user, navigate, from);
    } catch (err) {
      let errorMessage = 'Failed to sign in. Please check your credentials.';
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Simplified direct Google auth approach
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleLoginSuccess(result.user, navigate, from);
    } catch (error) {
      console.error("Google Sign-in Error:", error.code, error.message);
      setError('Google sign-in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageContainer>
      <FormContainer>
        <Title>Log In</Title>
        
        <GoogleButton onClick={handleGoogleLogin} type="button" disabled={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Log in with Google
        </GoogleButton>
        
        <OrDivider>
          <span>OR</span>
        </OrDivider>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleLoginWithEmail}>
          <FormGroup>
            <Label>Email</Label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="Enter your email"
              disabled={loading}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Password</Label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Enter your password"
              disabled={loading}
            />
          </FormGroup>
          
          <ForgotPassword to="/forgot-password">Forgot password?</ForgotPassword>
          
          <LoginButton 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </LoginButton>
        </Form>
        
        <LinkText>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </LinkText>
      </FormContainer>
    </PageContainer>
  );
};

export default LoginPage;