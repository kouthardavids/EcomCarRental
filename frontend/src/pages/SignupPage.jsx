import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../api/authContext';
import logo from '../assets/logo__1_-removebg-preview.png';

export default function RegisterPage() {
  const gold = '#C5A357';
  const goldHover = '#b8954e';
  const [hover, setHover] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { signup, googleSignup, isAuthenticated } = useAuth();
  const location = useLocation();

  const from = location.state?.from || '/';

  const inputStyle = {
    fontSize: '1.125rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid #ced4da',
    width: '100%',
    boxSizing: 'border-box',
  };

  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [email, password, confirmPassword]);

  const handleSuccessLogin = async (credentialResponse) => {
    try {
      setLoading(true);
      setError(null);
      const { credential } = credentialResponse;
      const result = await googleSignup(credential);

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Google signup error:', err);
      setError(err.response?.data?.message || 'Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Email signup
  const handleEmailSignup = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await signup(email.trim(), password);

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Email signup error:', err);
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '1rem',
      }}
    >
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

      <div
        style={{
          padding: '2rem',
          borderRadius: '1rem',
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h2
          style={{
            fontWeight: '700',
            color: '#212529',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          Create Your Account
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
            Create an account to continue to your destination
          </div>
        )}

        {/* Google signup */}
        <div style={{ width: '100%', marginBottom: '.9rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '360px' }}>
            <GoogleLogin
              onSuccess={handleSuccessLogin}
              onError={() => setError('Google Login Failed')}
              shape="pill"
              theme="outline"
              size="large"
              text="continue_with"
              disabled={loading}
            />
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ flexGrow: 1, borderTop: '1px solid #adb5bd' }}></div>
          <span style={{ margin: '0 1rem', color: '#6c757d', fontSize: '0.8rem' }}>
            or sign up with email
          </span>
          <div style={{ flexGrow: 1, borderTop: '1px solid #adb5bd' }}></div>
        </div>

        {/* Email signup */}
        <form style={{ display: 'grid', gap: '1rem' }} onSubmit={handleEmailSignup}>
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
            placeholder="Password (min. 6 characters)"
            required
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            required
            style={inputStyle}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
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
            {loading ? 'Creating Account...' : 'Sign Up'}
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
          Already have an account?
          <Link
            to="/login"
            style={{ color: gold, textDecoration: 'none', marginLeft: '0.25rem' }}
            onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}