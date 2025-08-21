import {
  getAllVehicles,
  getVehicleById as getVehicleByIdModel,
  getVehiclesWithImages,
  getImagesForEachCar,
} from '../models/vehicleModel.js';

// Get all vehicles without images
export const getAllVehiclesController = async (req, res) => {
  try {
    const vehicles = await getAllVehicles();
    if (!vehicles || vehicles.length === 0) {
      return res.status(404).json({ message: 'No vehicles found' });
    }
    res.json(vehicles);
  } catch (err) {
    console.error('Error getting vehicles:', err);
    res.status(500).json({ error: 'Failed to get vehicles' });
  }
};

// Get all vehicles with images grouped
export const getVehiclesWithImagesController = async (req, res) => {
  try {
    const vehicles = await getVehiclesWithImages();
    if (!vehicles || vehicles.length === 0) {
      return res.status(404).json({ message: 'No vehicles found' });
    }
    res.json(vehicles);
  } catch (err) {
    console.error('Error getting vehicles with images:', err);
    res.status(500).json({ error: 'Failed to get vehicles with images' });
  }
};

// Get single vehicle by id (no images)
export const getVehicleById = async (req, res) => {
      console.log('getVehicleById called with id:', req.params.id);

  try {
    const vehicle = await getVehicleByIdModel(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (err) {
    console.error('Error getting vehicle:', err);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
};

// Get images for a vehicle by car_id
export const getImagesByCarId = async (req, res) => {
      console.log('getVehiclesWithImagesController called');

  try {
    const images = await getImagesForEachCar(req.params.id);
    if (!images || images.length === 0) {
      return res.status(404).json({ error: 'No images found for this vehicle' });
    }
    res.json(images);
  } catch (err) {
    console.error('Error getting vehicle images:', err);
    res.status(500).json({ error: 'Failed to fetch vehicle images' });
  }
};