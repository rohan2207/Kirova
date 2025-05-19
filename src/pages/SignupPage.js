import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { auth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  padding: 40px 20px;
  background-color: #F7F9F4;
`;

const FormContainer = styled.div`
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 480px;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 30px;
  text-align: center;
  color: #383838;
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
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  border: 1px solid #DEEBD1;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #71B340;
    box-shadow: 0 0 0 2px #E9F5E1;
  }
`;

const ErrorMessage = styled.p`
  color: #D32F2F;
  margin-top: 6px;
  font-size: 0.875rem;
`;

const PasswordRequirements = styled.ul`
  margin-top: 8px;
  padding-left: 18px;
  font-size: 0.875rem;
  color: #666666;
`;

const RequirementItem = styled.li`
  margin-bottom: 4px;
  color: ${props => props.met ? '#71B340' : '#666666'};
`;

const SignUpButton = styled.button`
  padding: 14px;
  background-color: #71B340;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;

  &:hover {
    background-color: #2F4A22;
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
    border-bottom: 1px solid #DEEBD1;
  }

  span {
    padding: 0 16px;
    color: #666666;
    font-size: 0.875rem;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: white;
  border: 1px solid #DEEBD1;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;

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
  color: #666666;

  a {
    color: #71B340;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showZipPrompt, setShowZipPrompt] = useState(false);
  const [zip, setZip] = useState('');
  const [googleUser, setGoogleUser] = useState(null);

  const navigate = useNavigate();

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  const doPasswordsMatch = password === confirmPassword;
  const isFormValid = email && isPasswordValid && doPasswordsMatch;

  const handleSignupWithEmail = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setError(!doPasswordsMatch ? 'Passwords do not match' : 'Please meet all password requirements');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("🎉 You're all set! Start saving on your groceries and everyday bills.");
      navigate('/home');
    } catch (err) {
      const map = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password is too weak.',
      };
      setError(map[err.code] || 'Failed to create an account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setGoogleUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });
      setShowZipPrompt(true);
    } catch (error) {
      console.error("Google Sign-up Error:", error.code, error.message);
      setError('Google sign-up failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveZip = async () => {
    if (!zip.trim()) {
      setError('Please enter a valid zip code');
      return;
    }
    try {
      await setDoc(doc(db, 'users', googleUser.uid), {
        name: googleUser.displayName,
        email: googleUser.email,
        zip,
      }, { merge: true });
      toast.success("🎉 You're all set! Start saving on your groceries and everyday bills.");
      navigate('/home');
    } catch (err) {
      setError('Failed to save zip code. Try again.');
      console.error(err);
    }
  };

  return (
    <PageContainer>
      <FormContainer>
        <Title>Sign Up</Title>

        {showZipPrompt ? (
          <>
            <p style={{ marginBottom: '16px' }}>
              👋 Just one more thing! Enter your zip code so we can show deals near you.
            </p>
            <Input
              type="text"
              placeholder="Zip Code"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              maxLength={10}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <SignUpButton onClick={handleSaveZip} disabled={loading}>
              {loading ? 'Saving...' : 'Save & Continue'}
            </SignUpButton>
          </>
        ) : (
          <>
            <GoogleButton onClick={handleGoogleSignup} type="button" disabled={loading}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
              Sign up with Google
            </GoogleButton>

            <OrDivider><span>OR</span></OrDivider>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Form onSubmit={handleSignupWithEmail}>
              <FormGroup>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" disabled={loading} />
              </FormGroup>

              <FormGroup>
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Create a strong password" disabled={loading} />
                <PasswordRequirements>
                  <RequirementItem met={hasMinLength}>At least 8 characters</RequirementItem>
                  <RequirementItem met={hasUppercase}>At least one uppercase letter</RequirementItem>
                  <RequirementItem met={hasLowercase}>At least one lowercase letter</RequirementItem>
                  <RequirementItem met={hasNumber}>At least one number</RequirementItem>
                  <RequirementItem met={hasSpecialChar}>At least one special character</RequirementItem>
                </PasswordRequirements>
              </FormGroup>

              <FormGroup>
                <Label>Confirm Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Re-enter your password" disabled={loading} />
                {password && confirmPassword && !doPasswordsMatch && (
                  <ErrorMessage>Passwords do not match</ErrorMessage>
                )}
              </FormGroup>

              <SignUpButton type="submit" disabled={loading || !isFormValid}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </SignUpButton>
            </Form>

            <LinkText>
              Already have an account? <Link to="/login">Log In</Link>
            </LinkText>
          </>
        )}
      </FormContainer>
    </PageContainer>
  );
};

export default SignupPage;
