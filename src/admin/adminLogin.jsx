import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './admin.css';

// ✅ Dynamic API base URL from .env
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;


function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Development autofill (for testing)
  const isDevMode = true;

  useEffect(() => {
    setIsFormVisible(true);
    if (isDevMode) {
      setFormData({
        email: 'admin@hmail.com',
        password: 'admin123',
      });
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMessage('');
    setErrors({});

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(`${API}/admin/login`, formData, {
        withCredentials: true,
      });
      setMessage(res.data.message);
      setIsLoading(false);
      navigate('/admin/home');
    } catch (err) {
      console.error('Admin login failed:', err);
      setMessage(err.response?.data?.message || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="adminLoginPage">
      <div className="adminLoginSection">
        <div className="headingSection">
          <h1>Admin Login</h1>
          <p>Access the admin dashboard to manage users and reports.</p>
        </div>
        <div className="adminLoginBox">
          <form className="adminLoginForm" onSubmit={handleSubmit}>
            {message && <div className="matrimony-alert-box matrimony-error">{message}</div>}
            <div className="matrimony-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="matrimony-form-input email"
              />
              {errors.email && <span className="matrimony-error">{errors.email}</span>}
            </div>
            <div className="matrimony-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="matrimony-form-input"
              />
              {errors.password && <span className="matrimony-error">{errors.password}</span>}
            </div>
            {isLoading && <p className="matrimony-loading">Loading...</p>}
            <button type="submit" className="matrimony-form-submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <div className="loginLink">
              Back to <Link to="/login">User Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;