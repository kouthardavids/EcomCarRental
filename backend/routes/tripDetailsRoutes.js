import express from "express";
import { 
    getAllTrips, 
    getTrip, 
    createTrip, 
    updateTrip, 
    deleteTrip,
    fetchTripDetails
} from '../controllers/tripDetailsController.js';
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();

router.get('/trips/:booking_id', authenticateToken, fetchTripDetails);
router.put('/trips/:trip_id', authenticateToken, updateTrip);

router.get('/', authenticateToken, getAllTrips);
router.get('/:trip_id', authenticateToken, getTrip);
router.post('/', authenticateToken, createTrip);
router.delete('/:trip_id', authenticateToken, deleteTrip);


export default router;