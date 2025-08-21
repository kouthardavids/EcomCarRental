import db from '../config/db.js';

// Get all vehicles without images
export const getAllVehicles = async () => {
  try {
    const [result] = await db.query('SELECT * FROM vehicles');
    return result;
  } catch (err) {
    console.error('Database error in getAllVehicles:', err);
    throw err;
  }
};

// Get vehicle by ID
export const getVehicleById = async (car_id) => {
  try {
    const [result] = await db.query(
      'SELECT * FROM vehicles WHERE car_id = ?',
      [car_id]
    );
    return result.length > 0 ? result[0] : null;
  } catch (err) {
    console.error('Database error in getVehicleById:', err);
    throw err;
  }
};

// Get all images for a specific vehicle by car_id
export const getImagesForEachCar = async (car_id) => {
  try {
    const [result] = await db.query(
      'SELECT image_url FROM vehicle_images WHERE car_id = ?',
      [car_id]
    );
    return result.map(row => row.image_url);
  } catch (err) {
    console.error('Database error in getImagesForEachCar:', err);
    throw err;
  }
};

// Get all vehicles with their images grouped together
export const getVehiclesWithImages = async () => {
  try {
    const [rows] = await db.query(
      `SELECT v.*, vi.image_url
       FROM vehicles v
       LEFT JOIN vehicle_images vi ON v.car_id = vi.car_id
       ORDER BY v.car_id, vi.image_id`
    );

    const vehiclesMap = new Map();

    rows.forEach(row => {
      const vehicleData = {
        car_id: row.car_id,
        model_name: row.model_name,
        brand: row.brand,
        year: row.year,
        seats: row.seats,
        color: row.color,
        description: row.description,
        rental_price_per_day: row.rental_price_per_day,
        number_plate: row.number_plate,
        is_available: row.is_available,
        images: [],
      };

      if (!vehiclesMap.has(row.car_id)) {
        vehiclesMap.set(row.car_id, vehicleData);
      }

      if (row.image_url) {
        vehiclesMap.get(row.car_id).images.push(row.image_url);
      }
    });

    return Array.from(vehiclesMap.values());
  } catch (err) {
    console.error('Database error in getVehiclesWithImages:', err);
    throw err;
  }
};