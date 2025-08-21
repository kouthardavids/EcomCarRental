import nodemailer from 'nodemailer';
import { findExistingUser, insertUser, insertGoogleSignup } from "../models/userModel.js";
import db from '../config/db.js';
import { OAuth2Client } from "google-auth-library";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // First check if the user already exists in the database
    const user = await findExistingUser(email);

    if (user) {
      return res.status(400).json({ message: 'User already exists.' });
    };

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUserId = await insertUser(email, hashedPassword);

    // Fetch the created user to get complete user data
    const newUser = await findExistingUser(email);

    // Generate JWT
    // Access Token
    const accesstoken = jwt.sign(
      { userId: newUserId, email, role: 'customer' },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    // Refresh Token
    const refreshToken = jwt.sign(
      { userId: newUserId, email, role: 'customer' },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.status(201).json({
      message: 'User registered successfully.',
      accesstoken,
      user: {
        user_id: newUser.user_id,
        email: newUser.email,
        full_name: newUser.full_name,
        is_google_user: newUser.is_google_user
      }
    });

  } catch (error) {
    console.error("Something went wrong:", error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // First check if it's an admin
    let [adminRows] = await db.query(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    let user = adminRows[0];
    let isAdmin = false;
    let tableName = 'admins';

    // If not found in admins table, check users table
    if (!user) {
      const [userRows] = await db.query( // Added const declaration here
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      user = userRows[0];
      tableName = 'users';
    } else {
      isAdmin = true;
    }

    if (!user) {
      return res.status(400).json({ message: 'User does not exist. Please register.' });
    }

    // Check if password exists
    if (!user.password_hash) {
      return res.status(400).json({ message: 'Password not set for this user.' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    // Determine role and user ID field name based on table
    const role = isAdmin ? 'admin' : 'customer';
    const userIdField = isAdmin ? 'id' : 'user_id';

    // Access Token
    const accesstoken = jwt.sign(
      {
        userId: user[userIdField],
        email: user.email,
        role,
        isAdmin
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    // Refresh Token
    const refreshToken = jwt.sign(
      {
        userId: user[userIdField],
        email: user.email,
        role,
        isAdmin
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Prepare user data response
    const userData = {
      email: user.email,
      role,
      is_admin: isAdmin
    };

    // Add appropriate ID field
    if (isAdmin) {
      userData.admin_id = user.id;
    } else {
      userData.user_id = user.user_id;
      userData.full_name = user.full_name;
      userData.is_google_user = user.is_google_user;
    }

    return res.status(200).json({
      message: 'Login successful.',
      accesstoken,
      user: userData
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Sign up with Google
export const handleGoogleSignup = async (req, res) => {
  const { idToken } = req.body;

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: google_id, email, name: full_name } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google account has no email' });
    }

    // Check if user exists in users table
    let user = await findExistingUser(email);

    if (user) {
      // If user exists and IS a Google user, tell them to login instead
      if (user.is_google_user) {
        return res.status(400).json({ message: 'User already exists. Please login instead.' });
      }
      // If user exists but is NOT a Google user, prevent signup
      if (!user.is_google_user) {
        return res.status(400).json({ message: 'Email already registered manually. Please login with password.' });
      }
    } else {
      // Insert new Google user
      const userId = await insertGoogleSignup(google_id, full_name, email);

      // Fetch inserted user again
      user = await findExistingUser(email);
    }

    // Create JWT token for session
    const accesstoken = jwt.sign(
      { userId: user.user_id, email: user.email, role: 'customer' },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id, email: user.email, role: 'customer' },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      accesstoken,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        is_google_user: user.is_google_user
      }
    });

  } catch (error) {
    console.error('Google signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleGoogleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: google_id, email } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google account has no email' });
    }

    // Check if the user exists
    const user = await findExistingUser(email);

    if (!user) {
      // If they never signed up, tell them to sign up first
      return res.status(404).json({ message: 'User not found. Please sign up first.' });
    }

    // If they exist but were not a Google user, prevent login
    if (!user.is_google_user) {
      return res.status(400).json({ message: 'Email registered with password. Please login manually.' });
    }

    // Verify the Google ID matches (additional security check)
    if (user.google_id !== google_id) {
      return res.status(400).json({ message: 'Google account mismatch. Please use the correct Google account.' });
    }

    // Create JWT token
    const accesstoken = jwt.sign(
      { userId: user.user_id, email: user.email, role: 'customer' },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id, email: user.email, role: 'customer' },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Google login successful',
      accesstoken,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        is_google_user: user.is_google_user
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const generateAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.sendStatus(401);

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Check if user still exists
    const user = await findExistingUser(payload.email);
    if (!user) {
      return res.sendStatus(403);
    }

    const accessToken = jwt.sign(
      { userId: payload.userId, email: payload.email, role: payload.role || 'customer' },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" } // Changed from 15m to 1h for consistency
    );

    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.sendStatus(403);
  }
};

// Logout endpoint to clear refresh token
export const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};

export const sendForgotPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing email credentials in environment variables');
      return res.status(500).json({ message: 'Email service not configured properly' });
    }

    const user = await findExistingUser(email);

    if (!user) {
      return res.status(404).json({
        message: `No user found with that email address.`
      });
    };

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    await db.query(
      `UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?`, [token, expiry, email]
    )

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>You requested a password reset for your account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #9B59B6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetLink}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br>ChauffeurLux</p>
    </div>
  `
    };

    await transporter.sendMail(mailOptions);
    res.json({
      message: `Password reset email sent to your gmail account. Please check your inbox.`
    });

  } catch (error) {
    console.error('Error sending password reset email:', error);

    // More specific error messages based on error type
    if (error.code === 'EAUTH') {
      console.error('Gmail authentication failed. Check your email and app password.');
      res.status(500).json({ message: 'Email authentication failed. Please contact support.' });
    } else if (error.code === 'ENOTFOUND') {
      console.error('Network error - cannot reach email server.');
      res.status(500).json({ message: 'Network error. Please try again later.' });
    } else {
      res.status(500).json({ message: 'Failed to send password reset email. Please try again later.' });
    }
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log('Reset password attempt with token:', token);
    console.log('Password received:', password);

    // Check if the token exists at all
    const [tokenCheck] = await db.query(
      `SELECT * FROM users WHERE resetToken = ?`,
      [token]
    );

    console.log('Token check results:', tokenCheck);

    if (!tokenCheck || tokenCheck.length === 0) {
      console.log('Token not found in database');
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Check if token is expired
    const [rows] = await db.query(
      `SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > NOW()`,
      [token]
    );

    console.log('Valid token check results:', rows);

    if (!rows) {
      console.log('No valid user found for token - likely expired');
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = rows[0];
    console.log('User found:', user.email);

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE users SET password_hash = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE resetToken = ?`,
      [hashedPassword, token]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password. Please try again.' });
  }
};

