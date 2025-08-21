import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './forgot-password.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await axios.post('http://localhost:5005/api/forgot-password', {
                email
            });
            setSuccessMessage(res.data.message);
        } catch (err) {
            console.error('Full error:', err);
            if (err.response) {
                console.error('Response data:', err.response.data);
                console.error('Response status:', err.response.status);
                setError(err.response.data?.message || `Server error: ${err.response.status}`);
            } else if (err.request) {
                console.error('No response received:', err.request);
                setError('No response from server. Is the backend running?');
            } else {
                console.error('Request setup error:', err.message);
                setError('Failed to send request');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            {/* Top-left logo and brand name */}
            <Link to="/" className="logo-link">
                <img
                    src="https://via.placeholder.com/40" // ✅ simplified placeholder
                    alt="ChauffeurLux Logo"
                    style={{ height: '40px', width: '40px' }}
                />
                ChauffeurLux
            </Link>

            {/* Main form container */}
            <div className="form-card">
                <h2 className="form-title">
                    Forgot Your Password?
                </h2>

                <p className="form-description">
                    Enter your email to receive a password reset link.
                </p>

                {/* Email submission form */}
                <form className="forgot-password-form" onSubmit={handleEmailSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        className="form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="form-button"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                {/* Display error or success message */}
                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                {/* Link to return to the login page */}
                <p className="return-link">
                    <Link to="/login" className="return-link-anchor">
                        Return to Log In
                    </Link>
                </p>
            </div>
        </div>
    );
}
