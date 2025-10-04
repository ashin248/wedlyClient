import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import './css/login.css';

// ✅ Load dynamic API URL
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setIsFormVisible(true);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    else if (!/^\+?\d{10,15}$/.test(formData.mobile))
      newErrors.mobile = "Invalid mobile number";
    if (!formData.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMessage("");
    setErrors({});

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(`${API}/login`, formData, {
        withCredentials: true,
      });
      setMessage(res.data.message);
      setIsLoading(false);
      navigate("/home");
    } catch (err) {
      console.error("❌ Login failed:", err);
      setMessage(err.response?.data?.message || "Login failed");
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    console.log(`Attempting to login via ${platform}`);
    setMessage(
      `Connecting with ${platform}... (Feature not fully implemented)`
    );
  };

  return (
    <>
      <div className="loginSection">
        <div className="headingSection">
          <h1>Join Wedly: Inclusive Matrimony for All</h1>
          <p>
            Wedly connects people of all genders and sexual orientations,
            fostering authentic relationships based on shared interests and
            values. Begin your journey to love today.
          </p>
        </div>
        <div className="loginBox">
          <div className={`loginForm ${isFormVisible ? "form-visible" : ""}`}>
            <form onSubmit={handleSubmit}>
              <label className="labelStyle">
                Email:
                <input
                  className="inputStyle inputStyleEmail"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </label>

              <label className="labelStyle">
                Mobile:
                <input
                  className="inputStyle inputStyleMobile"
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
                {errors.mobile && <span className="error">{errors.mobile}</span>}
              </label>

              <label className="labelStyle">
                Password:
                <input
                  className="inputStyle inputStylePassword"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && <span className="error">{errors.password}</span>}
              </label>

              {message && <div className="alertBox">{message}</div>}
              {isLoading && <p className="loading">Loading...</p>}

              <button type="submit" className="submitBtn" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </button>

              <div className="registerLink">
                Don’t have an account? <Link to="/register">Register</Link>
              </div>
            </form>
          </div>
        </div>

        <div className="LoginSocialLoginSection">
          <div className="LoginOrDivider">
            <span>OR</span>
          </div>
          <div className="LoginSocialButtons">
            <button
              className="LoginSocialBtn googleBtn"
              onClick={() => handleSocialLogin("Google")}
              aria-label="Login with Google"
            >
              <i className="bi bi-google"></i>
            </button>
            <button
              className="LoginSocialBtn instagramBtn"
              onClick={() => handleSocialLogin("Instagram")}
              aria-label="Login with Instagram"
            >
              <i className="bi bi-instagram"></i>
            </button>
            <button
              className="LoginSocialBtn twitterBtn"
              onClick={() => handleSocialLogin("Twitter")}
              aria-label="Login with Twitter"
            >
              <i className="bi bi-twitter-x"></i>
            </button>
            <button
              className="LoginSocialBtn youtubeBtn"
              onClick={() => handleSocialLogin("YouTube")}
              aria-label="Login with YouTube"
            >
              <i className="bi bi-youtube"></i>
            </button>
          </div>

          <div className="LoginPrivacyTerms">
            By logging in, you agree to our{" "}
            <Link to="/terms">Terms of Service</Link> and{" "}
            <Link to="/privacy">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
