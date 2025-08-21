import { setAccessToken, getAccessToken, clearAccessToken } from '../src/api/authToken';

// In-memory user data
let currentUser = null;

// Set auth data after login/signup
export const setAuthData = (data) => {
  setAccessToken(data.accesstoken); // save token in memory
  currentUser = data.user; // save user in memory
};

// Get user + token
export const getAuthData = () => {
  return { token: getAccessToken(), user: currentUser };
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAccessToken();
};

// Clear auth data (logout)
export const clearAuthData = () => {
  clearAccessToken();
  currentUser = null;
};

// Get current user only
export const getCurrentUser = () => currentUser;

// Get auth token only
export const getAuthToken = () => getAccessToken();
