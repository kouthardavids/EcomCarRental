// routes/authRoutes.js
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { 
  registerUser, 
  userLogin, 
  generateAccessToken, 
  handleGoogleSignup, 
  handleGoogleLogin,
  logout, 
  resetPassword,
  sendForgotPasswordEmail
} from '../controllers/authController.js';

const router = express.Router();

// Authentication routes - using single login endpoint
router.post('/login', userLogin);
router.post('/register', registerUser);
router.post('/google-signup', handleGoogleSignup);
router.post('/google-login', handleGoogleLogin);
router.post('/refresh-token', generateAccessToken);
router.post('/logout', logout);

router.post('/forgot-password', sendForgotPasswordEmail);
router.post('/reset-password/:token', resetPassword);


router.post("/send-email", async (req, res) => {
  const { to, subject, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ChauffeurLux" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message,
    });

    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

export default router;