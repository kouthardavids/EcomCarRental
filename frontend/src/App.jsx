import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthProvider } from './api/authContext.jsx';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/SignupPage';
import Home from './pages/Homepage';
import Catalogue from './pages/Catalogue';
import BookingPage from './pages/BookingPage';
import AboutUs from './pages/AboutPage';
import ForgotPassword from './pages/ForgetPassword';
import ResetPasswordPage from './pages/ResetPassword';
import DetailPage from './pages/DetailPage';
import RentalCart from './pages/RentalCart';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminPage.jsx';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route
            path="/rentalcart"
            element={
              <ProtectedRoute>
                <RentalCart />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/details/:id" element={<DetailPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}