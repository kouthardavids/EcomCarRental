import db from '../config/db.js';

// Check if the user exists in the db
export const findExistingUser = async(email) => {
    const [rows] = await db.query(
        `SELECT * FROM users WHERE email = ?`, [email]
    );
    return rows[0]
};

// Add the user in the db if they do no exist already
export const insertUser = async (email, password) => {
  // For the name, extracted the name from the email and put it as full name
  // But users may change their name in their profile later on
  const rawName = email.split('@')[0];
  const full_name = rawName
    .split(/[._]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Insert into DB
  const [result] = await db.query(
    `INSERT INTO users(full_name, email, password_hash) VALUES (?, ?, ?)`,
    [full_name, email, password]
  );

  return result.insertId;
};

// Check if the admin exists
export const findAdmin = async(email) => {
  const [results] = await db.query(
    `SELECT * FROM admins WHERE email = ?`, [email]
  );
  
  return results[0];
};

// Insert user using Google sign up
export const insertGoogleSignup = async (google_id, full_name, email) => {
  const [result] = await db.query(
    `INSERT INTO users (google_id, full_name, email, password_hash, is_google_user) VALUES (?, ?, ?, ?, ?)`,
    [google_id, full_name, email, '', 1]
  );

  return result.insertId;
};
