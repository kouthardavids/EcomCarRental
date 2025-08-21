import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAccessToken, setAccessToken, clearAccessToken } from './authToken.js';
import axiosInstance from './axiosInstance.js';

export const fetchVehiclesWithImagesPublic = async () => {
  try {
    const response = await axiosInstance.get('/vehicle/public/vehicles');
    return response.data;
  } catch (error) {
    console.error('Error fetching public vehicles:', error);
    throw error;
  }
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing authentication on app load
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          // Try to refresh the token using the HTTP-only cookie
          await checkAuthStatus();
        } catch (error) {
          console.error('Token refresh failed:', error);
          clearAuthData();
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axiosInstance.post('/refresh-token');
      if (response.data.accessToken) {
        setAccessToken(response.data.accessToken);
        
        // Fetch user profile to get current user data
        try {
          const userResponse = await axiosInstance.get('/user/profile');
          setUser(userResponse.data);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userResponse.data));
        } catch (userError) {
          console.error('Failed to fetch user profile:', userError);
          // Fallback to localStorage if API fails
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          }
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    clearAccessToken();
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user');
  };

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/login', { email, password });
      const { accesstoken, user: userData } = response.data;

      setAccessToken(accesstoken);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const signup = async (email, password) => {
    try {
      const response = await axiosInstance.post('/register', { email, password });
      const { accesstoken, user: userData } = response.data;

      setAccessToken(accesstoken);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData)); // Add this line

      return { success: true, user: userData };
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || 'Signup failed';
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const googleLogin = async (idToken) => {
    try {
      // Change this line from /auth/google-login to /google-login
      const response = await axiosInstance.post('/google-login', { idToken });
      const { accesstoken, user: userData } = response.data;

      setAccessToken(accesstoken);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Google login failed'
      };
    }
  };

  const googleSignup = async (idToken) => {
    try {
      const response = await axiosInstance.post('/google-signup', { idToken });
      const { accesstoken, user: userData } = response.data;

      setAccessToken(accesstoken);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error('Google signup error:', error);
      const errorMessage = error.response?.data?.message || 'Google signup failed';
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAccessToken();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    googleLogin,
    googleSignup,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};