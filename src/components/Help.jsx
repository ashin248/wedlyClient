import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './css/help.css';



function Help() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/help', { message: formData.message }, { withCredentials: true });
      setSuccess(res.data.message);
      setFormData({ name: '', email: '', message: '' });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit');
      setSuccess(null);
    }
  };

  return (
    <div className="help-container">
      <div className="help-header">
        <h1>Help & Support</h1>
        <p>Find answers to common questions or get in touch with our support team.</p>
      </div>

      <div className="help-content">
        <h2>Frequently Asked Questions (FAQs)</h2>
        <div className="faq-section">
          <h3>How do I create an account?</h3>
          <p>
            To create an account, click on the "Register" link on the login page or navigate to the registration page directly. Fill out the required fields, including your name, email, mobile number, password, and upload a profile image. Once submitted, you'll be redirected to complete your profile information.
          </p>

          <h3>How can I update my profile information?</h3>
          <p>
            After logging in, navigate to the "Update Profile" section from the top navigation bar. You can update your personal details, preferences, and other information there.
          </p>

          <h3>How do I send an interest to another user?</h3>
          <p>
            On the home page, browse through compatible user profiles. Click the "Send Interest" button on a user's profile card to express interest. You'll be prompted to confirm before the interest is sent.
          </p>

          <h3>What should I do if I encounter an issue with messaging?</h3>
          <p>
            Ensure you're logged in and have a stable internet connection. If issues persist, try refreshing the page or logging out and back in. For further assistance, contact our support team using the form below.
          </p>

          <h3>How do I block or report a user?</h3>
          <p>
            Navigate to the "Block" section from the bottom navigation bar. You can view blocked users, unblock them, or submit a report with details about any inappropriate behavior.
          </p>
        </div>

        <h2>Contact Support</h2>
        <div className="contact-section">
          <p>
            If you need further assistance, please reach out to our support team. We'll get back to you within 24-48 hours.
          </p>
          <form className="contact-form" onSubmit={handleSubmit}>
            <label className="labelStyle">
              Name:
              <input
                type="text"
                name="name"
                className="inputStyle"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
            <label className="labelStyle">
              Email:
              <input
                type="email"
                name="email"
                className="inputStyle"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>
            <label className="labelStyle">
              Message:
              <textarea
                name="message"
                className="textareaStyle"
                placeholder="Describe your issue or question"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </label>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <button type="submit" className="submitBtn">Send Message</button>
          </form>
        </div>

        <div className="links-section">
          <p>
            For more information, review our{' '}
            <Link to="/terms">Terms of Service</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Help;