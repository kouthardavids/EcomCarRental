import db from '../config/db.js';

export const getTripById = async (trip_id) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                td.*, 
                b.user_id, 
                b.status as booking_status,
                u.full_name,
                u.email,
                u.phone_number as phone,
                v.model_name,
                v.brand
            FROM trip_details td
            JOIN bookings b ON td.booking_id = b.booking_id
            JOIN users u ON b.user_id = u.user_id
            JOIN vehicles v ON b.car_id = v.car_id
            WHERE td.trip_id = ?
        `, [trip_id]);
        return rows[0];
    } catch (e) {
        console.error('Error fetching trip by ID:', e);
        throw e;
    }
}

export const getTripDetails = async () => {
    try {
        const [rows] = await db.query(`
            SELECT 
                td.*, 
                b.user_id, 
                b.status as booking_status,
                u.full_name,
                u.email,
                u.phone_number as phone,
                v.model_name,
                v.brand
            FROM trip_details td
            JOIN bookings b ON td.booking_id = b.booking_id
            JOIN users u ON b.user_id = u.user_id
            JOIN vehicles v ON b.car_id = v.car_id
            ORDER BY td.pickup_date DESC
        `);
        return rows;
    } catch (e) {
        console.error('Error fetching all trip details:', e);
        throw e;
    }
}

// CREATE booking + trip detail
export const createTripDetail = async (trip) => {
    const {
        user_id,
        car_id,
        service_type = 'Standard',
        passengers = 1,
        pickup_date,
        pickup_time,
        pickup_location,
        dropoff_location,
        special_requests = ''
    } = trip;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Insert into bookings
        const [bookingResult] = await connection.query(
            `INSERT INTO bookings (user_id, car_id) VALUES (?, ?)`,
            [user_id, car_id]
        );
        const booking_id = bookingResult.insertId;

        // Get car rental price
        const [vehicleRows] = await connection.query(
            `SELECT rental_price_per_day FROM vehicles WHERE car_id = ?`,
            [car_id]
        );

        if (!vehicleRows.length) throw new Error('Vehicle not found');

        const base_price = vehicleRows[0].rental_price_per_day;
        const passenger_factor = 1 + (passengers - 1) * 0.1; // Example factor
        const total_price = base_price * passenger_factor;

        // Insert into trip_details
        const [tripResult] = await connection.query(
            `INSERT INTO trip_details
            (booking_id, service_type, passengers, pickup_date, pickup_time, pickup_location, dropoff_location, special_requests, base_price, passenger_factor, total_price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [booking_id, service_type, passengers, pickup_date, pickup_time, pickup_location, dropoff_location, special_requests, base_price, passenger_factor, total_price]
        );

        await connection.commit();
        return { message: 'Booking and trip created successfully', booking_id, trip_id: tripResult.insertId };
    } catch (e) {
        await connection.rollback();
        console.error('Error creating trip detail:', e);
        throw e;
    } finally {
        connection.release();
    }
}

// UPDATE trip details
export const updateTripDetails = async (trip_id, tripData) => {
    try {
        const { booking_id, service_type, passengers, pickup_date, pickup_time, pickup_location, dropoff_location, special_requests, base_price, passenger_factor, total_price } = tripData;

        const [result] = await db.query(
            `UPDATE trip_details
            SET booking_id = ?, service_type = ?, passengers = ?, pickup_date = ?, pickup_time = ?, pickup_location = ?, dropoff_location = ?, special_requests = ?, base_price = ?, passenger_factor = ?, total_price = ?
            WHERE trip_id = ?`,
            [booking_id, service_type, passengers, pickup_date, pickup_time, pickup_location, dropoff_location, special_requests, base_price, passenger_factor, total_price, trip_id]
        );

        if (result.affectedRows === 0) {
            return { message: 'No trip details found or no changes made' };
        }
        return { message: 'Trip details updated successfully' };
    } catch (e) {
        console.error('Error updating trip details:', e);
        throw e;
    }
}

// DELETE trip (and its booking if needed)
export const deleteTripDetails = async (trip_id) => {
    try {
        const [result] = await db.query(
            `DELETE b 
            FROM bookings b 
            JOIN trip_details td ON b.booking_id = td.booking_id
            WHERE td.trip_id = ?`,
            [trip_id]
        );

        if (result.affectedRows === 0) return { message: 'No trip details found' };

        return { message: 'Trip details deleted successfully' };
    } catch (e) {
        console.error('Error deleting trip details:', e);
        throw e;
    }
}

// Get trip by booking id
export const getTripDetailsByBookingId = async (booking_id) => {
    const [rows] = await db.query(
        `SELECT * FROM trip_details WHERE booking_id = ?`, 
        [booking_id]
    );

    // Return the first row if it exists, otherwise null
    return rows.length ? rows[0] : null;
};
