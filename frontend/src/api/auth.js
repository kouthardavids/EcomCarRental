import axiosInstance from './axiosInstance.js';

export const fetchVehiclesWithImages = async () => {
  try {
    const response = await axiosInstance.get('/vehicle/public/vehicles-with-images');
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles with images:', error);
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

// Public API calls (no authentication required)
export const fetchVehiclesWithImagesPublic = async () => {
  try {
    const response = await axiosInstance.get('/vehicle/public');
    return response.data;
  } catch (error) {
    console.error('Error fetching public vehicles:', error);
    throw error;
  }
};

export const fetchVehicleById = async (carId) => {
  try {
    const response = await axiosInstance.get(`/vehicle/public/${carId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle by ID:', error);
    throw error;
  }
};

// Reviews
export const fetchVehicleReviews = async (carId) => {
  try {
    const response = await axiosInstance.get(`/review/${carId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle reviews:', error);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await axiosInstance.post('/review', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// User profile
export const fetchUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put('/user/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};