import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../api/authContext.jsx';
import { 
  fetchVehicleByIdPublic, 
  fetchVehicleImagesPublic, 
  fetchReviewsByCarId,
  createReview 
} from '../api/authToken.js';
import './detail.css';

const CarBookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchCarData = async () => {
      setLoading(true);
      try {
        // Use public endpoints for car details and images
        const vehicleData = await fetchVehicleByIdPublic(id);
        const imagesData = await fetchVehicleImagesPublic(id);

        // For reviews, try to fetch but don't fail if not authenticated
        let reviewsData = [];
        try {
          const reviewsResponse = await fetchReviewsByCarId(id);
          reviewsData = reviewsResponse.reviews || [];
        } catch (reviewError) {
          console.warn('Could not fetch reviews:', reviewError);
          // Reviews will remain empty array
        }

        vehicleData.images = imagesData;
        setCar(vehicleData);
        setReviews(reviewsData);
        setCurrentImageIndex(0);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load car data');
        setLoading(false);
      }
    };

    fetchCarData();
  }, [id]);

  const nextImage = () => {
    if (!car?.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
  };

  const prevImage = () => {
    if (!car?.images) return;
    setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      alert('Please log in to submit a review');
      return;
    }

    setSubmitLoading(true);

    try {
      const reviewData = {
        user_id: user.user_id,
        car_id: parseInt(id),
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      };

      const result = await createReview(reviewData);

      // Create a new review object to add to the list
      const newReview = {
        review_id: result.review_id,
        user_id: user.user_id,
        car_id: parseInt(id),
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        review_date: new Date().toISOString(),
        user_name: user.full_name || user.email
      };

      setReviews([newReview, ...reviews]);
      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: '' });
      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Review submission error:', err);
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      // Redirect to login with return path
      navigate('/customer-login', { 
        state: { 
          returnPath: `/booking`,
          selectedVehicle: car 
        } 
      });
      return;
    }
    navigate('/booking', { state: { selectedVehicle: car } });
  };

  const handleAddReviewClick = () => {
    if (!isAuthenticated) {
      navigate('/customer-login', { 
        state: { 
          returnPath: `/details/${id}`,
          action: 'review'
        } 
      });
      return;
    }
    setShowReviewModal(true);
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
    setReviewForm({ rating: 5, comment: '' });
  };

  if (loading) return <div className="loading">Loading car details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!car) return <div className="error">No car data found.</div>;

  return (
    <div className="car-detail-page">
      <Navbar />

      <div className="container">
        <div className="car-header">
          <h1 className="car-title">{car.brand} {car.model_name}</h1>
          <p className="car-subtitle">{car.year} • {car.category || 'Luxury'} • {car.color}</p>
        </div>

        <div className="main-content">
          <div className="image-gallery">
            <div className="main-image-container">
              <img
                src={
                  car.images && car.images.length > 0
                    ? car.images[currentImageIndex]
                    : 'https://via.placeholder.com/800x600?text=No+Image'
                }
                alt={`${car.brand} ${car.model_name}`}
                className="main-image"
              />
              {car.images && car.images.length > 1 && (
                <>
                  <button className="image-nav prev" onClick={prevImage}>‹</button>
                  <button className="image-nav next" onClick={nextImage}>›</button>
                  <div className="image-counter">{currentImageIndex + 1} / {car.images.length}</div>
                </>
              )}
            </div>

            {car.images && car.images.length > 1 && (
              <div className="thumbnail-container">
                {car.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${car.brand} ${car.model_name} ${index + 1}`}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="car-info">
            <div className="price-card">
              <div className="price">R{car.rental_price_per_day}</div>
              <div className="price-period">per day</div>

              <div className="action-buttons">
                <button className="btn btn-primary" onClick={handleBookNow}>
                  {isAuthenticated ? 'Book Now' : 'Login to Book'}
                </button>
                <button className="btn btn-secondary" onClick={handleAddReviewClick}>
                  {isAuthenticated ? 'Add a Review' : 'Login to Review'}
                </button>
              </div>
            </div>

            <div className="info-card">
              <h3 className="card-title">Quick Specifications</h3>
              <div className="quick-specs">
                <div className="spec-item">
                  <span className="spec-label">Seats:</span>
                  <span className="spec-value">{car.seats}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Year:</span>
                  <span className="spec-value">{car.year}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3 className="card-title">Description</h3>
          <p className="description">{car.description}</p>
        </div>

        <div className="details-section">
          <div className="info-card">
            <h3 className="card-title">Premium Features</h3>
            <div className="features-list">
              {(Array.isArray(car.features)
                ? car.features
                : typeof car.features === 'string'
                  ? car.features.split(',').map(f => f.trim())
                  : ['Luxury Interior', 'Air Conditioning', 'Premium Sound System', 'GPS Navigation']
              ).map((feature, index) => (
                <div key={index} className="feature-item">
                  <span>✓</span> <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="info-card">
            <h3 className="card-title">Full Specifications</h3>
            <div className="specs-grid">
              {car.specifications ? (
                Object.entries(car.specifications).map(([key, value]) => (
                  <div key={key} className="spec-row">
                    <span className="spec-label">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))
              ) : (
                <div className="spec-row">
                  <span className="spec-label">Brand:</span>
                  <span className="spec-value">{car.brand}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="info-card reviews-section">
          <h3 className="card-title">Customer Reviews</h3>
          {reviews.length === 0 ? (
            <div className="no-reviews">
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review, index) => (
                <div key={review.review_id || index} className="review-item">
                  <div className="review-header">
                    <div className="review-user">
                      {review.user_name || 'Anonymous'}
                    </div>
                    <div className="review-rating">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <div className="review-date">
                      {new Date(review.review_date).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showReviewModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Your Review</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">Rating (1-5 stars)</label>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= reviewForm.rating ? 'filled' : ''}`}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      {star <= reviewForm.rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Your Review Comment</label>
                <textarea
                  className="form-textarea"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your detailed experience with this vehicle..."
                  required
                  minLength={10}
                  rows={5}
                />
              </div>
              <button
                type="submit"
                className="btn-submit"
                disabled={submitLoading || reviewForm.rating < 1 || reviewForm.comment.length < 10}
              >
                {submitLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarBookingDetailPage;