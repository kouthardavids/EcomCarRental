// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../api/authContext';
import logo from '../assets/logo__1_-removebg-preview.png';

export default function LoginPage() {
  const gold = '#C5A357';
  const goldHover = '#b8954e';
  const [hover, setHover] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, googleLogin, isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Get the path user was trying to access before login
  const from = location.state?.from || '/';

  const inputStyle = {
    fontSize: '1.125rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid #ced4da',
    width: '100%',
    boxSizing: 'border-box',
  };

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [email, password]);

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true);
      setError(null);
      const { credential } = credentialResponse;
      const result = await googleLogin(credential);

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await login(email.trim(), password);

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    // Redirect admins to admin dashboard, regular users to their intended destination
    if (user?.role === 'admin' || user?.is_admin) {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to={from} replace />;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8f9fa', padding: '1rem' }}>
      {/* Logo and home link */}
      <Link
        to="/"
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          color: gold,
          fontWeight: '700',
          fontSize: '1.25rem',
          gap: '0.5rem',
        }}
        onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'none')}
        onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
      >
        <img
          src={logo}
          alt="ChauffeurLux Logo"
          style={{ height: '40px', width: '40px' }}
        />
        ChauffeurLux
      </Link>

      <div style={{
        padding: '2rem',
        borderRadius: '1rem',
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontWeight: '700', color: '#212529', marginBottom: '1.5rem', textAlign: 'center' }}>
          Welcome Back!
        </h2>

        {from !== '/' && (
          <div style={{
            backgroundColor: '#e3f2fd',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            color: '#1976d2',
            textAlign: 'center'
          }}>
            Please log in to continue to your destination
          </div>
        )}

        {/* Google login */}
        <div style={{ marginBottom: '.9rem', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError('Google Login Failed')}
            shape="pill"
            theme="outline"
            size="large"
            text="continue_with"
            disabled={loading}
          />
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ flexGrow: 1, borderTop: '1px solid #adb5bd' }}></div>
          <span style={{ margin: '0 1rem', color: '#6c757d', fontSize: '0.8rem' }}>or log in with email</span>
          <div style={{ flexGrow: 1, borderTop: '1px solid #adb5bd' }}></div>
        </div>

        {/* Email login */}
        <form style={{ display: 'grid', gap: '1rem' }} onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="Email"
            required
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            required
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ color: gold, textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            style={{
              backgroundColor: hover ? goldHover : gold,
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              fontWeight: '700',
              borderRadius: '0.75rem',
              width: '100%',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={() => !loading && setHover(true)}
            onMouseLeave={() => setHover(false)}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {error && (
          <div style={{
            color: '#dc3545',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            marginTop: '1rem',
            textAlign: 'center',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#6c757d', fontSize: '0.875rem' }}>
          Don't have an account?
          <Link to="/register" style={{ color: gold, textDecoration: 'none', marginLeft: '0.25rem' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}