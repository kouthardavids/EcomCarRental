import db from '../config/db.js';

export const getBooking = async () => {
    try {
        const [rows] = await db.query('SELECT * FROM bookings');
        return rows;
    } catch (e) {
        console.error('Error fetching all bookings: ', e);
        throw e;
    }
}

export const getBookingById = async (booking_id) => {
    try {
        const [rows] = await db.query('SELECT * FROM bookings WHERE booking_id = ?', [booking_id]);
        return rows[0];
    } catch (e) {
        console.error('Error fetching booking: ', e);
        throw e;
    }
}

// FIXED: Updated to handle all the booking fields from the frontend
export const createBooking = async (booking) => {
    try {
        const {
            user_id,
            car_id,
            service_type = 'one-way',
            passengers = 1,
            pickup_date,
            pickup_time,
            pickup_location,
            dropoff_location,
            special_requests = '',
            first_name,
            last_name,
            email,
            phone
        } = booking;

        // Validate required fields
        if (!user_id || !car_id || !pickup_date || !pickup_time || !pickup_location || !dropoff_location) {
            throw new Error('Missing required fields');
        }

        // 1. Create booking record
        const [bookingResult] = await db.query(
            `INSERT INTO bookings(user_id, car_id, status) VALUES (?, ?, 'pending')`,
            [user_id, car_id]
        );

        const bookingId = bookingResult.insertId;

        // 2. Create trip details record
        const [tripResult] = await db.query(
            `INSERT INTO trip_details(
                booking_id, service_type, passengers, 
                pickup_date, pickup_time, pickup_location, dropoff_location,
                special_requests, base_price
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                bookingId, service_type, passengers,
                pickup_date, pickup_time, pickup_location, dropoff_location,
                special_requests, 0  // You'll need to calculate base_price
            ]
        );

        return {
            message: 'Booking and trip details created successfully',
            bookingId: bookingId,
            tripId: tripResult.insertId
        };
    } catch (e) {
        console.error('Error creating booking: ', e);
        throw e;
    }
}

export const updateBooking = async (booking_id, bookingData) => {
    try {
        const { user_id, car_id, status } = bookingData;
        const [result] = await db.query(
            `UPDATE bookings
            SET user_id = ?, car_id = ?, status = ?
            WHERE booking_id = ?`,
            [user_id, car_id, status, booking_id]
        );

        if (result.affectedRows === 0) {
            return { message: 'No booking record found or no changes made' }
        }

        return { message: 'Booking updated successfully' };
    } catch (e) {
        console.error('Error updating booking: ', e);
        throw e;
    }
}

export const deleteBooking = async (booking_id) => {
    try {
        await db.query('DELETE FROM bookings WHERE booking_id = ?', [booking_id]);
        return { message: 'Booking deleted successfully' };
    } catch (e) {
        console.error('Error deleting booking: ', e);
        throw e;
    }
}

export const getBookingByUser = async (userId) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM bookings WHERE user_id = ?`,
            [userId]
        );
        return rows;
    } catch (error) {
        console.error('Error fetching bookings by user ID:', error);
        throw error;
    }
};