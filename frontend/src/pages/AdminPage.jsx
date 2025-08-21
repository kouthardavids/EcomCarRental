import React, { useState, useMemo, useEffect } from 'react';
import { Search, Users, Clock, CheckCircle, XCircle, Eye, Check, X, Calendar, MapPin, Car, Mail, Phone, RefreshCw, LogOut } from 'lucide-react';
import axiosInstance from '../api/axiosInstance.js';
import { useAuth } from '../api/authContext.jsx';
import logo from '../assets/logo__1_-removebg-preview.png';
import './admin.css';

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, logout } = useAuth();

  // Fetch bookings data
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch trips data from the correct endpoint
      const response = await axiosInstance.get('/trip');
      const tripsData = response.data;

      console.log('Raw trips data:', tripsData);

      // Transform the data with proper mapping
      const transformedBookings = tripsData.map((trip, index) => {
        // Use the actual data from the API response
        const customerName = trip.full_name || `Customer ${trip.user_id || index + 1}`;
        const customerEmail = trip.email || 'No email provided';
        const customerPhone = trip.phone || trip.phone_number || 'No phone provided';
        const vehicleModel = trip.model_name || 'Unknown vehicle';
        const vehicleMake = trip.brand || '';
        const vehicleFullName = vehicleMake ? `${vehicleMake} ${vehicleModel}` : vehicleModel;

        // Use booking_status from the query, fallback to trip status
        let status = (trip.booking_status || trip.status || 'pending').toLowerCase();
        if (status === 'accepted') status = 'confirmed';
        if (status === 'rejected') status = 'cancelled';

        return {
          trip_id: trip.trip_id,
          booking_id: trip.booking_id || `B${(trip.trip_id || index + 1000).toString().padStart(4, '0')}`,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          service_type: trip.service_type || 'Car rental',
          vehicle_model: vehicleModel,
          vehicle_make: vehicleMake,
          vehicle_full_name: vehicleFullName,
          pickup_date: trip.pickup_date,
          pickup_time: trip.pickup_time,
          pickup_location: trip.pickup_location,
          dropoff_location: trip.dropoff_location,
          total_price: trip.total_price || 0,
          status: status,
          special_requests: trip.special_requests || 'No special requests',
          created_at: trip.created_at,
          passengers: trip.passengers || 1,
          user_id: trip.user_id,
          car_id: trip.car_id
        };
      });

      console.log('Transformed bookings:', transformedBookings);
      setBookings(transformedBookings);

    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings from server. Please check your API connection.');
      setBookings([]); // Clear any previous data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch bookings on component mount
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login page or home page after logout
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Filter bookings based on search and status
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        booking.customer_name?.toLowerCase().includes(searchLower) ||
        booking.customer_email?.toLowerCase().includes(searchLower) ||
        booking.customer_phone?.toLowerCase().includes(searchLower) ||
        booking.service_type?.toLowerCase().includes(searchLower) ||
        booking.vehicle_model?.toLowerCase().includes(searchLower) ||
        booking.vehicle_make?.toLowerCase().includes(searchLower) ||
        booking.vehicle_full_name?.toLowerCase().includes(searchLower) ||
        booking.pickup_location?.toLowerCase().includes(searchLower) ||
        booking.dropoff_location?.toLowerCase().includes(searchLower) ||
        booking.booking_id?.toString().toLowerCase().includes(searchLower) ||
        booking.trip_id?.toString().toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === 'all' ||
        booking.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const statusCounts = {
      total: bookings.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };

    bookings.forEach(booking => {
      const status = booking.status?.toLowerCase();
      if (status === 'pending') statusCounts.pending++;
      else if (status === 'confirmed' || status === 'accepted') statusCounts.confirmed++;
      else if (status === 'completed') statusCounts.completed++;
      else if (status === 'cancelled' || status === 'rejected') statusCounts.cancelled++;
    });

    return statusCounts;
  }, [bookings]);

  const updateBookingStatus = async (tripId, newStatus, customerEmail, customerVehicle) => {
    try {
      // Update API first
      const response = await axiosInstance.put(`/trip/trips/${tripId}`, {
        status: newStatus.toUpperCase()
      });

      console.log('API response:', response.data);

      // Only update local state if API call was successful
      setBookings(prev => prev.map(booking =>
        booking.trip_id === tripId ? { ...booking, status: newStatus } : booking
      ));

      // Also update the selected booking if it's the one being modified
      if (selectedBooking && selectedBooking.trip_id === tripId) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      }

      if (newStatus === 'confirmed' || newStatus === 'cancelled') {
        try {
          await axiosInstance.post('/send-email', {
            to: customerEmail,
            subject: `Your booking has been ${newStatus}`,
            message: `Hi, your booking for ${customerVehicle}  has been ${newStatus}. Thank you for choosing ChauffeurLux!`
          });
          console.log(`Email sent to ${customerEmail}`);
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          // Don't throw the error here as the booking status was updated successfully
        }
      }

    } catch (err) {
      console.error('Error updating booking status:', err);
      setError(`Failed to update booking status: ${err.response?.data?.error || err.message}`);
    }
  };
  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return `R ${numAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';

      return date.toLocaleDateString('en-ZA', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time not set';

    try {
      // Handle "HH:MM" format
      if (typeof timeString === 'string' && timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        if (hours && minutes) {
          return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }
      }

      return 'Invalid time';
    } catch {
      return 'Invalid time';
    }
  };

  // CSS for animations
  const spinningStyle = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spinning {
      animation: spin 1s linear infinite;
    }
    
    .fade-in {
      animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  if (loading) {
    return (
      <div className="admin-dashboard">
        <style>{spinningStyle}</style>
        <nav className="admin-nav">
          <div className="admin-nav-content">
            <div className="admin-logo">
              <img src={logo} alt="ChauffeurLux Logo" style={{ height: "40px", objectFit: "contain" }} />
              <div className="admin-logo-text">ChauffeurLux</div>
            </div>
            <div className="admin-badge">Admin Dashboard</div>
          </div>
        </nav>
        <div className="admin-content">
          <div className="empty-state">
            <RefreshCw size={32} className="spinning" style={{ marginBottom: '16px' }} />
            <div className="empty-state-text">Loading bookings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <style>{spinningStyle}</style>

      {/* Navigation */}
      <nav className="admin-nav">
        <div className="admin-nav-content">
          <div className="admin-logo">
              <img src={logo} alt="ChauffeurLux Logo" style={{ height: "40px", objectFit: "contain" }} />
            <div className="admin-logo-text">ChauffeurLux</div>
          </div>
          <div className="admin-badge">Admin Dashboard</div>

          {/* Logout Button */}
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={confirmLogout}
              className="modal-btn modal-btn-reject"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '14px'
              }}
              title="Logout from admin panel"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="admin-content">
        {/* Header */}
        <div className="admin-header fade-in">
          <h1>Booking Management</h1>
          <p>Manage and review all customer booking requests ({bookings.length} total bookings)</p>
          <button
            onClick={handleRefresh}
            className="modal-btn modal-btn-accept"
            disabled={refreshing}
            style={{ marginTop: '10px' }}
          >
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          {error && (
            <div style={{
              color: '#dc2626',
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#fef2f2',
              borderRadius: '5px',
              border: '1px solid #fecaca'
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="stats-grid fade-in">
          <div className="stat-card">
            <div className="stat-card-content">
              <div className="stat-info">
                <h3>Total Bookings</h3>
                <div className="stat-number">{stats.total}</div>
              </div>
              <div className="stat-icon total">
                <Users size={24} />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <div className="stat-info">
                <h3>Pending</h3>
                <div className="stat-number pending">{stats.pending}</div>
              </div>
              <div className="stat-icon pending">
                <Clock size={24} />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <div className="stat-info">
                <h3>Confirmed</h3>
                <div className="stat-number accepted">{stats.confirmed}</div>
              </div>
              <div className="stat-icon accepted">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <div className="stat-info">
                <h3>Cancelled</h3>
                <div className="stat-number rejected">{stats.cancelled}</div>
              </div>
              <div className="stat-icon rejected">
                <XCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section fade-in">
          <div className="filters-content">
            <div className="search-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, phone, vehicle, location, or booking ID..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-container">
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bookings-table-container fade-in">
          <table className="bookings-table">
            <thead className="table-header">
              <tr>
                <th>Booking ID</th>
                <th>Customer Details</th>
                <th>Service & Vehicle</th>
                <th>Date & Time</th>
                <th>Route</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.trip_id} className="table-row fade-in">
                    <td className="table-cell">
                      <div className="booking-id">
                        <strong>#{booking.booking_id}</strong>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="customer-info">
                        <div className="customer-name">
                          {booking.customer_name}
                        </div>
                        <div className="customer-email">
                          {booking.customer_email}
                        </div>
                        <div className="customer-phone">
                          {booking.customer_phone}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="service-info">
                        <div className="service-name">{booking.service_type}</div>
                        <div className="service-vehicle">
                          {booking.vehicle_full_name}
                        </div>
                        {booking.passengers > 1 && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                            {booking.passengers} passengers
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="datetime-info">
                        <div className="date">{formatDate(booking.pickup_date)}</div>
                        <div className="time">{formatTime(booking.pickup_time)}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="route-info">
                        <div className="route-from" title={booking.pickup_location}>
                          📍 {booking.pickup_location}
                        </div>
                        <div className="route-arrow">↓</div>
                        <div className="route-to" title={booking.dropoff_location}>
                          🏁 {booking.dropoff_location}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="cost">{formatCurrency(booking.total_price)}</div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="actions-container">
                        <button
                          className="action-btn btn-view"
                          onClick={() => setSelectedBooking(booking)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {booking.status.toLowerCase() === 'pending' && (
                          <>
                            <button
                              className="action-btn btn-accept"
                              onClick={() => updateBookingStatus(booking.trip_id, 'confirmed', booking.customer_email, booking.customer_email, booking.vehicle_full_name)}
                              title="Accept Booking"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              className="action-btn btn-reject"
                              onClick={() => updateBookingStatus(booking.trip_id, 'cancelled', booking.customer_email, booking.vehicle_full_name)}
                              title="Reject Booking"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-state-text">
                        {searchTerm || statusFilter !== 'all'
                          ? 'No bookings found matching your search criteria'
                          : 'No bookings found in the system'}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={cancelLogout}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Logout</h2>
              <button className="modal-close" onClick={cancelLogout}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to logout from the admin dashboard?</p>
              <div className="modal-actions" style={{ justifyContent: 'center', gap: '15px' }}>
                <button
                  className="modal-btn"
                  onClick={cancelLogout}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white'
                  }}
                >
                  Cancel
                </button>
                <button
                  className="modal-btn modal-btn-reject"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Booking Details - #{selectedBooking.booking_id}</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedBooking(null)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              {/* Customer Information */}
              <div className="info-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <Users className="info-icon" size={16} />
                    <span className="info-label">Name:</span>
                    <span className="info-value">{selectedBooking.customer_name}</span>
                  </div>
                  <div className="info-item">
                    <Mail className="info-icon" size={16} />
                    <span className="info-label">Email:</span>
                    <span className="info-value">{selectedBooking.customer_email}</span>
                  </div>
                  <div className="info-item">
                    <Phone className="info-icon" size={16} />
                    <span className="info-label">Phone:</span>
                    <span className="info-value">{selectedBooking.customer_phone}</span>
                  </div>
                  <div className="info-item">
                    <Users className="info-icon" size={16} />
                    <span className="info-label">Passengers:</span>
                    <span className="info-value">{selectedBooking.passengers}</span>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="info-section">
                <h3>Service Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <Car className="info-icon" size={16} />
                    <span className="info-label">Service Type:</span>
                    <span className="info-value">{selectedBooking.service_type}</span>
                  </div>
                  <div className="info-item">
                    <Car className="info-icon" size={16} />
                    <span className="info-label">Vehicle:</span>
                    <span className="info-value">{selectedBooking.vehicle_full_name}</span>
                  </div>
                  <div className="info-item">
                    <Calendar className="info-icon" size={16} />
                    <span className="info-label">Date:</span>
                    <span className="info-value">{formatDate(selectedBooking.pickup_date)}</span>
                  </div>
                  <div className="info-item">
                    <Clock className="info-icon" size={16} />
                    <span className="info-label">Time:</span>
                    <span className="info-value">{formatTime(selectedBooking.pickup_time)}</span>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="info-section">
                <h3>Route Information</h3>
                <div className="route-details">
                  <div className="info-item">
                    <MapPin className="info-icon" size={16} />
                    <span className="info-label">Pickup Location:</span>
                    <span className="info-value">{selectedBooking.pickup_location}</span>
                  </div>
                  <div className="info-item">
                    <MapPin className="info-icon" size={16} />
                    <span className="info-label">Dropoff Location:</span>
                    <span className="info-value">{selectedBooking.dropoff_location}</span>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="info-section">
                <h3>Booking Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Booking ID:</span>
                    <span className="info-value">#{selectedBooking.booking_id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Trip ID:</span>
                    <span className="info-value">#{selectedBooking.trip_id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Created:</span>
                    <span className="info-value">{formatDate(selectedBooking.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="special-requests">
                <h3>Special Requests</h3>
                <p>{selectedBooking.special_requests}</p>
              </div>

              {/* Cost and Status */}
              <div className="cost-status-section">
                <div className="cost-info">
                  <div className="cost-label">Total Cost</div>
                  <div className="cost-amount">{formatCurrency(selectedBooking.total_price)}</div>
                </div>
                <div className="status-info">
                  <span>Status:</span>
                  <span className={`status-badge status-${selectedBooking.status.toLowerCase()}`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              {selectedBooking.status.toLowerCase() === 'pending' && (
                <div className="modal-actions">
                  <button
                    className="modal-btn modal-btn-accept"
                    onClick={() => updateBookingStatus(
                      selectedBooking.trip_id,
                      'confirmed',
                      selectedBooking.customer_email,
                      selectedBooking.vehicle_full_name  // Add this parameter
                    )}
                  >
                    <Check size={16} />
                    Accept Booking
                  </button>
                  <button
                    className="modal-btn modal-btn-reject"
                    onClick={() => updateBookingStatus(
                      selectedBooking.trip_id,
                      'cancelled',
                      selectedBooking.customer_email,
                      selectedBooking.vehicle_full_name  // Add this parameter
                    )}
                  >
                    <X size={16} />
                    Reject Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;