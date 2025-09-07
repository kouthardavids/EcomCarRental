import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useLocation, useNavigate } from 'react-router-dom';
import './booking.css';
import { Link } from "react-router-dom";
import { fetchVehiclesWithImages, createBooking } from "../api/auth.js";
import { useAuth } from "../api/authContext.jsx";

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const preselectedVehicle = location.state?.selectedVehicle || null;
  const { user, isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState(preselectedVehicle ? 2 : 1);
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    selectedVehicle: preselectedVehicle,
    serviceType: 'one-way',
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
    pickupLocation: '',
    dropoffLocation: '',
    passengerCount: 1,
    specialRequests: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentMethod: 'stripe'
  });

  const isStepValid = (step) => {
    switch (step) {
      case 1: // Vehicle selection
        return !!formData.selectedVehicle;

      case 2: // Trip details
        if (!formData.pickupDate || !formData.pickupTime || !formData.pickupLocation || !formData.dropoffLocation) {
          return false;
        }
        if (formData.serviceType === 'round-trip' && (!formData.returnDate || !formData.returnTime)) {
          return false;
        }
        return true;

      case 3: // Personal info
        return (
          formData.firstName.trim() !== "" &&
          formData.lastName.trim() !== "" &&
          formData.email.trim() !== "" &&
          formData.phone.trim() !== ""
        );

      default:
        return true;
    }
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await fetchVehiclesWithImages();
        setVehicles(data);
        const uniqueCategories = [...new Set(data.map(v => v.category || "All Vehicles"))];
        setCategories(uniqueCategories);
        setSelectedCategory(uniqueCategories[0] || "");
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const getVehicleImage = (vehicle) => {
    if (vehicle.images && vehicle.images.length > 0) {
      return vehicle.images[0];
    }
    return `https://images.unsplash.com/photo-1549317336-206569e8475c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80`;
  };

  const filteredVehicles = vehicles.filter(
    (v) => selectedCategory === "" || (v.category || "All Vehicles") === selectedCategory
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVehicleSelect = (vehicle) => {
    setFormData(prev => ({ ...prev, selectedVehicle: vehicle }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateTotal = () => {
    const vehicle = formData.selectedVehicle;
    if (!vehicle) return 0;

    const basePrice = vehicle.rental_price_per_day || 0;
    const passengerMultiplier = Math.max(1, Math.ceil(formData.passengerCount / 4));
    const serviceMultiplier = formData.serviceType === 'round-trip' ? 1.8 : 1;

    return Math.round(basePrice * passengerMultiplier * serviceMultiplier);
  };

  const handleSubmitBooking = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    // Basic validation
    if (!formData.selectedVehicle) {
      setSubmitError('Please select a vehicle');
      setCurrentStep(1);
      setIsSubmitting(false);
      return;
    }

    if (!formData.pickupDate || !formData.pickupTime || !formData.pickupLocation || !formData.dropoffLocation) {
      setSubmitError('Please fill in all required trip details');
      setCurrentStep(2);
      setIsSubmitting(false);
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setSubmitError('Please fill in all personal information');
      setCurrentStep(3);
      setIsSubmitting(false);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      setSubmitError('Please log in to complete your booking');
      setIsSubmitting(false);
      // Redirect to login page
      navigate('/customer-login', {
        state: {
          returnPath: '/booking',
          selectedVehicle: formData.selectedVehicle
        }
      });
      return;
    }

    try {
      const totalPrice = calculateTotal(); // Calculate total first

      // Prepare the trip data for the backend
      const tripData = {
        user_id: user.user_id,
        car_id: formData.selectedVehicle.car_id,
        service_type: formData.serviceType,
        passengers: formData.passengerCount,
        pickup_date: formData.pickupDate,
        pickup_time: formData.pickupTime,
        return_date: formData.returnDate || null,
        return_time: formData.returnTime || null,
        pickup_location: formData.pickupLocation,
        dropoff_location: formData.dropoffLocation,
        special_requests: formData.specialRequests,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        total_price: totalPrice, // Store the calculated total
        base_price: formData.selectedVehicle.rental_price_per_day // Store base price too
      };

      console.log('Submitting booking data:', tripData);

      const result = await createBooking(tripData);
      console.log('Booking created:', result);
      setShowModal(true);
    } catch (error) {
      console.error('Error submitting booking:', error);
      setSubmitError(error.message || 'Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RenderProgressBar = () => (
    <div className="progress-bar">
      <div className="progress-steps">
        {[1, 2, 3, 4].map(step => (
          <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
            <div className="step-number">{step}</div>
            <div className="step-label">
              {step === 1 && 'Vehicle'}
              {step === 2 && 'Details'}
              {step === 3 && 'Information'}
              {step === 4 && 'Confirmation'}
            </div>
          </div>
        ))}
      </div>
      <div className="progress-line">
        <div className="progress-fill" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
      </div>
    </div>
  );

  const RenderStep1 = () => {
    if (loading) {
      return (
        <div className="booking-step">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading luxury vehicles...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="booking-step">
          <div className="error">
            <p>⚠️ {error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="booking-step">
        <h2>Select Your Vehicle</h2>

        <div className="categories">
          <button
            className={`category-btn ${selectedCategory === "" ? "active" : ""}`}
            onClick={() => setSelectedCategory("")}
          >
            All Vehicles
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${category === selectedCategory ? "active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="vehicles-grid">
          {filteredVehicles.length === 0 ? (
            <div className="no-vehicles">
              <h3>No vehicles available</h3>
              <p>Please check back later or try a different category.</p>
            </div>
          ) : (
            filteredVehicles.map((vehicle) => (
              <div
                className={`vehicle-card ${formData.selectedVehicle?.car_id === vehicle.car_id ? 'selected' : ''}`}
                key={vehicle.car_id}
                onClick={() => handleVehicleSelect(vehicle)}
              >
                <div className="vehicle-image">
                  <img
                    src={getVehicleImage(vehicle)}
                    alt={`${vehicle.brand} ${vehicle.model_name}`}
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80";
                    }}
                  />
                  <div className="price-badge">
                    R{vehicle.rental_price_per_day || "TBD"}/day
                  </div>
                </div>

                <div className="vehicle-content">
                  <h3 className="vehicle-title">
                    {vehicle.brand} {vehicle.model_name}
                  </h3>

                  <div className="vehicle-meta">
                    <span>🗓️ {vehicle.year}</span>
                    <span>👥 {vehicle.seats} seats</span>
                    <span>🎨 {vehicle.color}</span>
                  </div>

                  <p className="vehicle-description">
                    {vehicle.description || "Experience luxury and comfort with this premium vehicle, perfect for any occasion."}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="booking-step">
      <h2>Trip Details</h2>

      <div className="form-grid">
        <div className="form-group">
          <label>Service Type</label>
          <select
            value={formData.serviceType}
            onChange={(e) => handleInputChange('serviceType', e.target.value)}
          >
            <option value="one-way">One Way</option>
            <option value="round-trip">Round Trip</option>
            <option value="hourly">Hourly Service</option>
          </select>
        </div>

        <div className="form-group">
          <label>Number of Passengers</label>
          <input
            type="number"
            min="1"
            max="12"
            value={formData.passengerCount}
            onChange={(e) => handleInputChange('passengerCount', parseInt(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Pickup Date</label>
          <input
            type="date"
            value={formData.pickupDate}
            onChange={(e) => handleInputChange('pickupDate', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Pickup Time</label>
          <input
            type="time"
            value={formData.pickupTime}
            onChange={(e) => handleInputChange('pickupTime', e.target.value)}
          />
        </div>

        {formData.serviceType === 'round-trip' && (
          <>
            <div className="form-group">
              <label>Return Date</label>
              <input
                type="date"
                value={formData.returnDate}
                onChange={(e) => handleInputChange('returnDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Return Time</label>
              <input
                type="time"
                value={formData.returnTime}
                onChange={(e) => handleInputChange('returnTime', e.target.value)}
              />
            </div>
          </>
        )}

        <div className="form-group full-width">
          <label>Pickup Location</label>
          <input
            type="text"
            placeholder="Enter pickup address"
            value={formData.pickupLocation}
            onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
          />
        </div>

        <div className="form-group full-width">
          <label>Drop-off Location</label>
          <input
            type="text"
            placeholder="Enter destination address"
            value={formData.dropoffLocation}
            onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
          />
        </div>

        <div className="form-group full-width">
          <label>Special Requests (Optional)</label>
          <textarea
            placeholder="Any special requirements or requests..."
            value={formData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            rows={3}
          ></textarea>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="booking-step">
      <h2>Personal Information</h2>

      <div className="form-grid">
        <div className="form-group">
          <label>First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Payment Method</label>
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={formData.paymentMethod === 'stripe'}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              />
              <span>Stripe</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const selectedVehicle = formData.selectedVehicle;
    const total = calculateTotal();

    return (
      <div className="booking-step">
        <h2>Booking Confirmation</h2>

        <div className="confirmation-details">
          <div className="booking-summary">
            <h3>Booking Summary</h3>

            {selectedVehicle && (
              <div className="summary-section">
                <h4>Vehicle</h4>
                <div className="vehicle-summary">
                  <img src={getVehicleImage(selectedVehicle)} alt={`${selectedVehicle.brand} ${selectedVehicle.model_name}`} />
                  <div>
                    <p><strong>{selectedVehicle.brand} {selectedVehicle.model_name}</strong></p>
                    <p>Year: {selectedVehicle.year} | Color: {selectedVehicle.color}</p>
                    <p>Seats: {selectedVehicle.seats} | Category: {selectedVehicle.category}</p>
                    <p>Base Price: R{selectedVehicle.rental_price_per_day}/day</p>
                  </div>
                </div>
              </div>
            )}

            <div className="summary-section">
              <h4>Trip Details</h4>
              <p><strong>Service:</strong> {formData.serviceType.replace('-', ' ').toUpperCase()}</p>
              <p><strong>Date:</strong> {formData.pickupDate}</p>
              <p><strong>Time:</strong> {formData.pickupTime}</p>
              <p><strong>Passengers:</strong> {formData.passengerCount}</p>
              <p><strong>From:</strong> {formData.pickupLocation}</p>
              <p><strong>To:</strong> {formData.dropoffLocation}</p>
              {formData.serviceType === 'round-trip' && (
                <>
                  <p><strong>Return Date:</strong> {formData.returnDate}</p>
                  <p><strong>Return Time:</strong> {formData.returnTime}</p>
                </>
              )}
            </div>

            <div className="summary-section">
              <h4>Contact Information</h4>
              <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Phone:</strong> {formData.phone}</p>
              <p><strong>Payment:</strong> {formData.paymentMethod.replace('-', ' ').toUpperCase()}</p>
            </div>

            {formData.specialRequests && (
              <div className="summary-section">
                <h4>Special Requests</h4>
                <p>{formData.specialRequests}</p>
              </div>
            )}
          </div>

          <div className="price-breakdown">
            <h3>Price Breakdown</h3>
            <div className="price-item">
              <span>Base Price (per day)</span>
              <span>R{selectedVehicle?.rental_price_per_day || 0}</span>
            </div>
            <div className="price-item">
              <span>Service Type</span>
              <span>{formData.serviceType === 'round-trip' ? '×1.8' : '×1.0'}</span>
            </div>
            <div className="price-item">
              <span>Passenger Factor</span>
              <span>×{Math.max(1, Math.ceil(formData.passengerCount / 4))}</span>
            </div>
            <div className="price-total">
              <span><strong>Total</strong></span>
              <span><strong>R{total}</strong></span>
            </div>
          </div>
        </div>

        <div className="terms">
          <label className="checkbox-label">
            <input type="checkbox" required />
            <span>I agree to the Terms & Conditions and Privacy Policy</span>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="booking-page">
      <Navbar />

      <div className="booking-container">
        <RenderProgressBar />

        <div className="booking-content">
          {currentStep === 1 && <RenderStep1 />}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {submitError && (
            <div className="error-message" style={{
              color: 'red',
              margin: '10px 20px',
              textAlign: 'center'
            }}>
              {submitError}
            </div>
          )}

          <div className="navigation-buttons">
            <div>
              {currentStep > 1 && (
                <button className="btn btn-secondary" onClick={prevStep}>
                  Previous
                </button>
              )}
            </div>
            <div>
              {currentStep < 4 ? (
                <button
                  className="btn btn-primary"
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                >
                  Next Step
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={handleSubmitBooking}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3>Booking Confirmed</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                &times;
              </button>
            </div>
            <p>Your booking has been successfully created!</p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '20px'
            }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <Link to="/rentalcart" className="btn btn-primary">
                View My Trips
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;