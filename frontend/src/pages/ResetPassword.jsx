import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './reset-password.css';

export default function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage(null);
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(`http://localhost:5005/api/reset-password/${token}`, {
                password
            });
            
            setSuccessMessage(res.data.message + ' Redirecting to login...');
            setTimeout(() => navigate('/customer-login'), 2500);
            
        } catch (err) {
            console.error('Reset error:', err);
            
            if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                setError('Cannot connect to server. Please make sure the backend is running on port 5005.');
            } 
            else if (err.response?.status === 404) {
                setError('Reset endpoint not found. Please check your server configuration.');
            }
            else if (err.response?.status === 400) {
                setError(err.response.data.message || 'Invalid or expired reset link. Please request a new password reset.');
            }
            else {
                setError(err.response?.data?.message || 'Reset failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <Link to="/" className="logo-link">
                <img
                    src="https://via.placeholder.com/40"
                    alt="ChauffeurLux Logo"
                    style={{ height: '40px', width: '40px' }}
                />
                ChauffeurLux
            </Link>

            <div className="form-card">
                <h2 className="form-title">
                    Reset Your Password
                </h2>

                <p className="form-description">
                    Enter a new password for your account.
                </p>

                <form className="reset-password-form" onSubmit={handleReset}>
                    <input
                        type="password"
                        placeholder="New Password (min 6 characters)"
                        required
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength="6"
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        required
                        className="form-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength="6"
                    />
                    <button
                        type="submit"
                        className="form-button"
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <p className="return-link">
                    <Link to="/login" className="return-link-anchor">
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
}