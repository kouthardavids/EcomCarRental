import { userCheck, vehicleCheck, insertReview, fetchReviews, fetchReviewsByCar } from "../models/reviewModel.js";

// Handle reviews when user creates one
export const handleReview = async (req, res) => {
  try {
    const { user_id, car_id, rating, comment } = req.body;

    // Validate required fields
    if (!user_id || !car_id || !rating || !comment) {
      return res.status(400).json({ 
        message: "All fields are required: user_id, car_id, rating, comment" 
      });
    }

    // Check if the user exists
    const user = await userCheck(user_id);
    if (!user) {
      return res.status(404).json({ message: "User does not exist. Cannot make a review." });
    }

    // Check if the vehicle exists
    const vehicle = await vehicleCheck(car_id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle does not exist. Cannot make a review." });
    }

    // Validate rating (must be between 1 and 5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Insert review into database
    const reviewId = await insertReview(user_id, car_id, rating, comment);

    return res.status(201).json({
      message: "Review added successfully.",
      review_id: reviewId
    });

  } catch (error) {
    console.error("Error handling review:", error);
    return res.status(500).json({ message: "Server error while adding review." });
  }
};

// Get all the reviews or reviews for a specific car
export const getReviews = async (req, res) => {
    try {
        // Check for car_id in both query params and route params
        const car_id = req.query.car_id || req.params.car_id;
        
        let reviews;
        if (car_id) {
            // Get reviews for a specific car
            reviews = await fetchReviewsByCar(car_id);
        } else {
            // Get all reviews
            reviews = await fetchReviews();
        }

        return res.status(200).json({ 
            reviews: reviews || [],
            count: reviews ? reviews.length : 0 
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ message: 'Server error while fetching reviews.' });
    }
};