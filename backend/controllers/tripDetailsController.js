import {
  getTripDetails,
  getTripById,
  createTripDetail,
  updateTripDetails,
  deleteTripDetails,
  getTripDetailsByBookingId
} from '../models/tripDetailsModel.js';
import db from '../config/db.js';

export const getAllTrips = async (req, res) => {
  try {
    const trips = await getTripDetails();
    res.json(trips);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getTrip = async (req, res) => {
  const { trip_id } = req.params;
  try {
    const trip = await getTripById(trip_id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const createTrip = async (req, res) => {
  const tripData = req.body;
  console.log('Creating trip with data:', tripData);

  try {
    const requiredFields = ['user_id', 'car_id', 'pickup_date', 'pickup_location', 'dropoff_location'];
    const missingFields = requiredFields.filter(field => !tripData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: missingFields
      });
    }

    const result = await createTripDetail(tripData);
    res.status(201).json(result);
  } catch (e) {
    console.error('Error creating trip:', e);
    res.status(500).json({ error: e.message });
  }
};

export const updateTrip = async (req, res) => {
  const { trip_id } = req.params;
  const tripData = req.body;

  console.log('Received update request for trip ID:', trip_id);
  console.log('Update data:', tripData);

  try {
    const { status, ...otherData } = tripData;

    let result;

    if (status) {
      const trip = await getTripById(trip_id);
      if (trip && trip.booking_id) {
        const [bookingUpdate] = await db.query(
          `UPDATE bookings SET status = ? WHERE booking_id = ?`,
          [status, trip.booking_id]
        );
        console.log('Booking status updated:', bookingUpdate);
      }
    }

    if (Object.keys(otherData).length > 0) {
      result = await updateTripDetails(trip_id, otherData);
    } else {
      result = { message: 'Status updated successfully' };
    }

    console.log('Update result:', result);
    res.json(result);
  } catch (e) {
    console.error('Error updating trip:', e);
    res.status(500).json({ error: e.message });
  }
};

// DELETE trip
export const deleteTrip = async (req, res) => {
  const { trip_id } = req.params;
  try {
    const result = await deleteTripDetails(trip_id);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const fetchTripDetails = async (req, res) => {
  try {
    const { booking_id } = req.params;

    if (!booking_id) {
      return res.status(400).json({ message: 'Booking ID is required.' });
    }

    const tripDetails = await getTripDetailsByBookingId(booking_id);

    if (!tripDetails) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    return res.status(200).json(tripDetails);

  } catch (error) {
    console.error('Error fetching trip details:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
