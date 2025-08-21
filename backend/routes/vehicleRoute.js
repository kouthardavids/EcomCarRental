// routes/vehicleRoute.js
import express from 'express';
import {
  getAllVehiclesController,
  getVehiclesWithImagesController,
  getVehicleById,
  getImagesByCarId,
} from '../controllers/vehicleController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public/vehicles', getVehiclesWithImagesController); // This should return vehicles with images
router.get('/public/vehicles-with-images', getVehiclesWithImagesController); // Alternative endpoint name
router.get('/public/vehicles/:id', getVehicleById);
router.get('/public/vehicles/:id/images', getImagesByCarId);

// Protected routes (require authentication)
router.get('/vehicles', authenticateToken, getAllVehiclesController);
router.get('/vehicles-with-images', authenticateToken, getVehiclesWithImagesController);
router.get('/vehicles/:id', authenticateToken, getVehicleById);
router.get('/vehicles/:id/images', authenticateToken, getImagesByCarId);

export default router;