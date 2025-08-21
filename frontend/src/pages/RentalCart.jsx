import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAccessToken, getCurrentUser } from '../api/authToken.js';
import './rental.css';
import { loadStripe } from '@stripe/stripe-js';


const RentalCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const makePayment = async () => {
    try {
      const totalAmount = calculateTotal();
      const token = getAccessToken();
      const user = getCurrentUser();

      const sessionRes = await fetch('http://localhost:5005/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'zar',
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/cart`,
          metadata: {
            userId: user.user_id,
            bookingIds: cartItems.map(item => item.booking_id).join(',')
          },
          lineItems: cartItems.map(item => ({
            name: `${item.brand} ${item.model}`,
            amount: Math.round(calculateItemTotal(item) * 100), // in cents
            currency: 'zar',
            quantity: 1
          }))
        })
      });

      if (!sessionRes.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await sessionRes.json();
      const stripe = await loadStripe("pk_test_51RyEanEd8kY11YD6AtYvofazIQzoEKqJ9EgZsNyyCGhTXlWuGXwskAzKyMGFcomrUMRwoMCPbzPw5fJluvhhP0nI00iCykb96c");

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Checkout error:', error);
        alert('Checkout failed: ' + error.message);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed: ' + error.message);
    }
  };

  // Fetch user's cart data
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const token = getAccessToken();
        const user = getCurrentUser();

        if (!user || !user.user_id) {
          throw new Error('Please login to view your cart');
        }

        // 1. Fetch user's bookings
        console.log('User ID:', user.user_id);
        console.log('Token exists:', !!token);

        const bookingsRes = await fetch(`http://localhost:5005/api/booking/user/${user.user_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (bookingsRes.status === 404) {
          setCartItems([]);
          return;
        }

        if (!bookingsRes.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const bookings = await bookingsRes.json();
        setCartItems(bookings);


        // 2. Process each booking to get complete cart item
        const items = await Promise.all(
          bookings.map(async (booking) => {
            try {
              // 2a. Fetch trip details
              let tripDetails = null;
              try {
                const tripRes = await fetch(
                  `http://localhost:5005/api/trip/trips/${booking.booking_id}`,
                  { headers: { 'Authorization': `Bearer ${token}` } }
                );
                if (tripRes.ok) tripDetails = await tripRes.json();
              } catch (tripErr) {
                console.warn(`Trip details not found for booking ${booking.booking_id}`);
              }

              // 2b. Fetch vehicle details and images
              let vehicle = {
                brand: 'Unknown',
                model_name: 'Unknown Model',
                year: new Date().getFullYear(),
                color: 'Unknown',
                rental_price_per_day: 0,
                image_url: '/default-vehicle.jpg'
              };

              try {
                // Fetch vehicle details
                const vehicleRes = await fetch(
                  `http://localhost:5005/api/vehicle/vehicles/${booking.car_id}`,
                  { headers: { 'Authorization': `Bearer ${token}` } }
                );

                if (vehicleRes.ok) {
                  const vehicleData = await vehicleRes.json();
                  vehicle = { ...vehicle, ...vehicleData };

                  // Fetch vehicle images
                  const imagesRes = await fetch(
                    `http://localhost:5005/api/vehicle/vehicles/${booking.car_id}/images`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                  );

                  if (imagesRes.ok) {
                    const images = await imagesRes.json();
                    vehicle.image_url = images.length > 0 ? images[0] : '/default-vehicle.jpg';
                  }
                }
              } catch (vehicleErr) {
                console.warn(`Vehicle ${booking.car_id} not found`);
              }

              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);

              const pickupDate = tripDetails?.pickup_date ? new Date(tripDetails.pickup_date) : today;
              let returnDate;

              if (tripDetails?.return_date) {
                returnDate = new Date(tripDetails.return_date);
              } else {
                // If no return date, default to pickup + 1 day
                returnDate = new Date(pickupDate);
                returnDate.setDate(pickupDate.getDate() + 1);
              }

              const timeDiff = returnDate.getTime() - pickupDate.getTime();
              const days = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

              // 2d. Create cart item
              return {
                id: tripDetails?.trip_id || `temp-${booking.booking_id}`,
                booking_id: booking.booking_id,
                trip_id: tripDetails?.trip_id,
                user_id: booking.user_id,
                car_id: booking.car_id,
                brand: vehicle.brand,
                model: vehicle.model_name,
                year: vehicle.year,
                color: vehicle.color,
                image: vehicle.image_url,
                dailyRate: tripDetails?.base_price || vehicle.rental_price_per_day || 0,
                days,
                pickupDate: pickupDate.toISOString().split('T')[0],
                returnDate: returnDate.toISOString().split('T')[0],
                pickupLocation: tripDetails?.pickup_location || 'Not specified',
                dropoffLocation: tripDetails?.dropoff_location || 'Not specified',
                passengers: tripDetails?.passengers || 1,
                status: booking.status,
                addOns: tripDetails?.special_requests ? [
                  { name: 'Special Requests', price: 0, selected: true }
                ] : []
              };
            } catch (err) {
              console.error(`Error processing booking ${booking.booking_id}:`, err);
              return null;
            }
          })
        );

        setCartItems(items.filter(item => item !== null));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  // Edit functions
  const startEdit = (id) => {
    const item = cartItems.find(i => i.id === id);
    setEditForm({
      ...item,
      passengers: item.passengers || 1
    });
    setEditingItemId(id);
  };

  const saveEdit = async () => {
    try {
      const token = getAccessToken();
      const item = cartItems.find(i => i.id === editingItemId);

      if (item.trip_id) {
        const tripUpdateData = {
          booking_id: item.booking_id,
          pickup_date: editForm.pickupDate,
          pickup_location: editForm.pickupLocation,
          dropoff_location: editForm.dropoffLocation,
          passengers: parseInt(editForm.passengers) || 1,
          pickup_time: editForm.pickup_time || '09:00:00',
          special_requests: editForm.special_requests || '',
          base_price: editForm.dailyRate || item.dailyRate,
          passenger_factor: 1 + ((parseInt(editForm.passengers) || 1) - 1) * 0.1,
          total_price: (editForm.dailyRate || item.dailyRate) * (1 + ((parseInt(editForm.passengers) || 1) - 1) * 0.1)
        };

        const tripRes = await fetch(`http://localhost:5005/api/trip/trips/${item.trip_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(tripUpdateData)
        });

        if (!tripRes.ok) {
          const errorData = await tripRes.json();
          throw new Error(errorData.error || 'Failed to update trip details');
        }
      }

      // Update booking status
      const bookingRes = await fetch(`http://localhost:5005/api/booking/${item.booking_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: item.user_id,
          car_id: item.car_id,
          status: 'Confirmed'
        })
      });

      if (!bookingRes.ok) throw new Error('Failed to update booking status');

      // Update local state
      const updatedDays = Math.max(1, Math.ceil(
        (new Date(editForm.returnDate) - new Date(editForm.pickupDate)) /
        (1000 * 60 * 60 * 24)
      ));

      setCartItems(items =>
        items.map(i =>
          i.id === editingItemId ? {
            ...i,
            ...editForm,
            days: updatedDays,
            passengers: parseInt(editForm.passengers) || 1,
            status: 'Confirmed'
          } : i
        )
      );
      setEditingItemId(null);
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const removeItem = async () => {
    if (!itemToDelete) return;

    try {
      const token = getAccessToken();
      const item = cartItems.find(i => i.id === itemToDelete);

      // Delete trip if it exists
      if (item.trip_id) {
        const tripRes = await fetch(`http://localhost:5005/api/trip/${item.trip_id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!tripRes.ok) console.warn('Failed to delete trip');
      }

      // Delete booking
      const bookingRes = await fetch(`http://localhost:5005/api/booking/${item.booking_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!bookingRes.ok) throw new Error('Failed to delete booking');

      setCartItems(items => items.filter(i => i.id !== itemToDelete));
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (err) {
      alert('Delete failed: ' + err.message);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  // Promo code functions
  const applyPromoCode = () => {
    const promoCodes = {
      'LUXURY10': { discount: 0.10, description: '10% off total' },
      'FIRST20': { discount: 0.20, description: '20% off first booking' },
      'VIP15': { discount: 0.15, description: '15% VIP discount' }
    };

    if (promoCodes[promoCode.toUpperCase()]) {
      setAppliedPromo(promoCodes[promoCode.toUpperCase()]);
      setShowPromoInput(false);
      setPromoCode('');
    } else {
      alert('Invalid promo code');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  // Calculation functions
  const calculateItemTotal = (item) => {
    const baseTotal = (item.dailyRate || 0) * (item.days || 1);
    const addOnsTotal = item.addOns
      .filter(addOn => addOn.selected)
      .reduce((sum, addOn) => sum + (addOn.price || 0), 0);
    return baseTotal + addOnsTotal;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.15;
  };

  const calculateDiscount = () => {
    return appliedPromo ? calculateSubtotal() * appliedPromo.discount : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - calculateDiscount();
  };

  // Render loading state
  if (loading) {
    return (
      <div className="rental-cart">
        <Navbar />
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Your Rental Cart</h1>
            <p className="page-subtitle">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="rental-cart">
        <Navbar />
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Error</h1>
            <p className="page-subtitle">{error}</p>
            <Link to="/" className="continue-shopping">Return Home</Link>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="rental-cart">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Your Rental Cart</h1>
          <p className="page-subtitle">Review and manage your bookings</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2 className="empty-title">Your cart is empty</h2>
            <p className="empty-text">You haven't made any bookings yet.</p>
            <Link to="/catalogue" className="continue-shopping">Browse Vehicles</Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <button
                    className="remove-btn"
                    onClick={() => confirmDelete(item.id)}
                  >
                    ×
                  </button>

                  <div className="item-header">
                    <img
                      src={item.image}
                      alt={`${item.brand} ${item.model}`}
                      className="item-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-vehicle.jpg';
                      }}
                    />
                    <div className="item-info">
                      <h3 className="item-title">{item.brand} {item.model}</h3>
                      <div className="item-meta">
                        <span>{item.year}</span>
                        <span>{item.color}</span>
                        <span>Status: {item.status}</span>
                      </div>
                    </div>
                  </div>

                  {editingItemId === item.id ? (
                    <div className="edit-form">
                      <label>Pickup Date:</label>
                      <input
                        type="date"
                        value={editForm.pickupDate || ''}
                        onChange={(e) => setEditForm({ ...editForm, pickupDate: e.target.value })}
                      />

                      <label>Return Date:</label>
                      <input
                        type="date"
                        value={editForm.returnDate || ''}
                        min={editForm.pickupDate}
                        onChange={(e) => setEditForm({ ...editForm, returnDate: e.target.value })}
                      />

                      <label>Pickup Location:</label>
                      <input
                        type="text"
                        value={editForm.pickupLocation || ''}
                        onChange={(e) => setEditForm({ ...editForm, pickupLocation: e.target.value })}
                      />

                      <label>Drop-off Location:</label>
                      <input
                        type="text"
                        value={editForm.dropoffLocation || ''}
                        onChange={(e) => setEditForm({ ...editForm, dropoffLocation: e.target.value })}
                      />

                      <label>Passengers:</label>
                      <input
                        type="number"
                        min="1"
                        value={editForm.passengers || 1}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          passengers: parseInt(e.target.value) || 1
                        })}
                      />

                      <div className="edit-actions">
                        <button onClick={saveEdit}>Save Changes</button>
                        <button onClick={() => setEditingItemId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="item-details">
                        <div className="detail-group">
                          <div className="detail-label">Pickup Date</div>
                          <div className="detail-value">{item.pickupDate}</div>
                        </div>
                        <div className="detail-group">
                          <div className="detail-label">Return Date</div>
                          <div className="detail-value">{item.returnDate}</div>
                        </div>
                        <div className="detail-group">
                          <div className="detail-label">Duration</div>
                          <div className="detail-value">{item.days} day{item.days !== 1 ? 's' : ''}</div>
                        </div>
                        <div className="detail-group">
                          <div className="detail-label">Pickup Location</div>
                          <div className="detail-value">{item.pickupLocation}</div>
                        </div>
                        <div className="detail-group">
                          <div className="detail-label">Drop-off Location</div>
                          <div className="detail-value">{item.dropoffLocation}</div>
                        </div>
                      </div>
                      <button className="edit-btn" onClick={() => startEdit(item.id)}>
                        Edit Booking
                      </button>
                    </>
                  )}

                  <div className="item-total">
                    <span className="total-label">Rental Total:</span>
                    <span className="total-price">
                      R{calculateItemTotal(item).toLocaleString('en-US')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3 className="summary-title">Order Summary</h3>

              <div className="summary-line">
                <span>Subtotal:</span>
                <span>R{calculateSubtotal().toLocaleString('en-US')}</span>
              </div>

              {appliedPromo && (
                <div className="summary-line discount">
                  <span>Discount ({(appliedPromo.discount * 100)}%):</span>
                  <span>-R{calculateDiscount().toLocaleString('en-US')}</span>
                </div>
              )}

              <div className="summary-line">
                <span>VAT (15%):</span>
                <span>R{calculateTax().toLocaleString('en-US')}</span>
              </div>

              <div className="summary-line total">
                <span>Total:</span>
                <span>R{calculateTotal().toLocaleString('en-US')}</span>
              </div>

              <button
                className="checkout-btn"
                onClick={makePayment}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this booking? This action cannot be undone.</p>
              <div className="modal-actions">
                <button
                  className="modal-btn confirm-btn"
                  onClick={removeItem}
                >
                  Yes, Delete
                </button>
                <button
                  className="modal-btn cancel-btn"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalCart;