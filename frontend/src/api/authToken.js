import axiosInstance from './axiosInstance.js';

// Token management
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

export const hasStoredToken = () => {
  const token = getAccessToken();
  const user = getCurrentUser();
  return !!(token && user);
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
  }
};

// Public API calls (no authentication required)
export const fetchVehiclesWithImagesPublic = async () => {
  try {
    const response = await axiosInstance.get('/vehicle/public/vehicles');
    return response.data;
  } catch (error) {
    console.error('Error fetching public vehicles:', error);
    throw error;
  }
};

export const fetchVehicleByIdPublic = async (carId) => {
  try {
    const response = await axiosInstance.get(`/vehicle/public/vehicles/${carId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle by ID:', error);
    throw error;
  }
};

export const fetchVehicleImagesPublic = async (carId) => {
  try {
    const response = await axiosInstance.get(`/vehicle/public/vehicles/${carId}/images`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle images:', error);
    throw error;
  }
};

export const fetchReviewsByCarId = async (carId) => {
  try {
    const response = await axiosInstance.get(`/review/public/${carId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle reviews:', error);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axiosInstance.post('/review', reviewData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  try {
    const response = await axiosInstance.post('/trip', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const fetchUserBookings = async () => {
  try {
    const response = await axiosInstance.get('/trip/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

export const updateBooking = async (tripId, updateData) => {
  try {
    const response = await axiosInstance.put(`/trip/${tripId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
};

export const deleteBooking = async (tripId) => {
  try {
    const response = await axiosInstance.delete(`/trip/${tripId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};