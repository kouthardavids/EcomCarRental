import db from '../config/db.js';

// Check if the user exists when making a review
export const userCheck = async (userId) => {
    const [result] = await db.query(
        `SELECT 1 FROM users WHERE user_id = ?`, [userId]
    );
    return result[0];
};

// Check if the vehicle exists when making a review
export const vehicleCheck = async(carId) => {
    const [result] = await db.query(
        `SELECT 1 FROM vehicles WHERE car_id = ?`, [carId]
    );
    return result[0];
};

// Inserting review into the database
export const insertReview = async(userId, carId, rating, comment) => {
    const [result] = await db.query(
        `INSERT into reviews(user_id, car_id, rating, comment) VALUES (?, ?, ?, ?)`, 
        [userId, carId, rating, comment]
    );
    return result.insertId;
};

// Fetching all reviews
export const fetchReviews = async() => {
    const [result] = await db.query(`SELECT * FROM reviews ORDER BY review_date DESC`);
    return result;
};

// Fetching reviews for a specific car
export const fetchReviewsByCar = async(carId) => {
    const [result] = await db.query(
        `SELECT r.*, u.full_name as user_name 
         FROM reviews r 
         LEFT JOIN users u ON r.user_id = u.user_id 
         WHERE r.car_id = ? 
         ORDER BY r.review_date DESC`, 
        [carId]
    );
    return result;
};