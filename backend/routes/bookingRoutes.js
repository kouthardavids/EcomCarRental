import express from "express";
import { 
  fetchBooking, 
  fetchBookingById, 
  fetchBookingByUserId,
  createNewBooking, 
  updateExistingBooking, 
  deleteExistingBooking 
} from '../controllers/bookingController.js';
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();

router.get('/user/:id', authenticateToken, fetchBookingByUserId);

// General booking routes
router.get('/', authenticateToken, fetchBooking);
router.get('/:booking_id', authenticateToken, fetchBookingById);
router.post('/', authenticateToken, createNewBooking);
router.put('/:booking_id', authenticateToken, updateExistingBooking);
router.delete('/:booking_id', authenticateToken, deleteExistingBooking);

export default router;