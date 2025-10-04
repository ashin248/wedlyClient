import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import './css/settings.css';


// ✅ Load dynamic API URL
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;


function Settings() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    emailNotifications: true,
    smsNotifications: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch current notification settings
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API}/settings`, {
          withCredentials: true,
        });
        setFormData((prev) => ({
          ...prev,
          emailNotifications: res.data.emailNotifications || true,
          smsNotifications: res.data.smsNotifications || false,
        }));
      } catch (err) {
        console.error('Error fetching settings:', err);
        toast.error('Failed to load settings.', {
          position: 'top-center',
          className: 'custom-toast',
        });
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    if (formData.newPassword && formData.newPassword.length < 8)
      newErrors.newPassword = 'New password must be at least 8 characters';
    if (formData.newPassword !== formData.confirmNewPassword)
      newErrors.confirmNewPassword = 'Passwords do not match';
    return newErrors;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    const newErrors = validatePasswordForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API}/settings/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        { withCredentials: true }
      );
      setMessage(res.data.message);
      toast.success('Password updated successfully!', {
        position: 'top-center',
        className: 'custom-toast',
      });
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }));
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Failed to update password.' });
      toast.error(err.response?.data?.message || 'Failed to update password.', {
        position: 'top-center',
        className: 'custom-toast',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API}/settings/notifications`,
        {
          emailNotifications: formData.emailNotifications,
          smsNotifications: formData.smsNotifications,
        },
        { withCredentials: true }
      );
      toast.success(res.data.message || 'Notification settings updated!', {
        position: 'top-center',
        className: 'custom-toast',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update notification settings.', {
        position: 'top-center',
        className: 'custom-toast',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.delete(`${API}/settings/delete-account`, {
        withCredentials: true,
      });
      toast.success(res.data.message || 'Account deleted successfully.', {
        position: 'top-center',
        className: 'custom-toast',
      });
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account.', {
        position: 'top-center',
        className: 'custom-toast',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="settings-container">
        <h1>Account Settings</h1>
        <div className="settings-section">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordChange}>
            <label className="labelStyle">
              Current Password:
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="inputStyle"
                required
              />
              {errors.currentPassword && (
                <span className="error">{errors.currentPassword}</span>
              )}
            </label>
            <label className="labelStyle">
              New Password:
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="inputStyle"
                required
              />
              {errors.newPassword && <span className="error">{errors.newPassword}</span>}
            </label>
            <label className="labelStyle">
              Confirm New Password:
              <input
                type="password"
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                className="inputStyle"
                required
              />
              {errors.confirmNewPassword && (
                <span className="error">{errors.confirmNewPassword}</span>
              )}
            </label>
            {errors.form && <div className="alertBox">{errors.form}</div>}
            {message && <div className="successBox">{message}</div>}
            <button type="submit" className="submitBtn" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>

        <div className="settings-section">
          <h2>Notification Preferences</h2>
          <label className="labelStyle">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={formData.emailNotifications}
              onChange={handleChange}
            />
            Receive Email Notifications
          </label>
          <label className="labelStyle">
            <input
              type="checkbox"
              name="smsNotifications"
              checked={formData.smsNotifications}
              onChange={handleChange}
            />
            Receive SMS Notifications
          </label>
          <button
            type="button"
            className="submitBtn"
            onClick={handleNotificationChange}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Notification Settings'}
          </button>
        </div>

        <div className="settings-section">
          <h2>Delete Account</h2>
          <p>
            Deleting your account will remove all your data from our platform. This action cannot be undone.
          </p>
          <button
            type="button"
            className="deleteBtn"
            onClick={handleDeleteAccount}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </>
  );
}

export default Settings;