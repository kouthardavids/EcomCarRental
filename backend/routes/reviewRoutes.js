// routes/reviewRoutes.js - FIXED
import express from 'express';
import { handleReview, getReviews } from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = express.Router();

// Public route for getting reviews - add specific route for car reviews
router.get('/public/:car_id', getReviews); // For fetching reviews by car ID
router.get('/public', getReviews); // For fetching all reviews

// Protected routes
router.post('/', authenticateToken, handleReview);
router.get('/:car_id', authenticateToken, getReviews); // Protected route for specific car
router.get('/', authenticateToken, getReviews);

export default router;