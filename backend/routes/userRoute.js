// routes/userRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { findExistingUser } from '../models/userModel.js';

const router = express.Router();

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await findExistingUser(req.user.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      is_google_user: user.is_google_user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;