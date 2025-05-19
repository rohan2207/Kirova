import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProfilePage from './pages/ProfilePage';
// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import NewHomePage from './pages/NewHomePage';
import ComparisonPage from './pages/ComparisonPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HowItWorksPage from './pages/HowItWorksPage';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <Router>
          <Navbar />
          <ToastContainer position="top-center" />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><NewHomePage /></ProtectedRoute>} />
            <Route path="/compare" element={<ProtectedRoute><ComparisonPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Routes>
          <Footer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
