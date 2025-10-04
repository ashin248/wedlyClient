











import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/css/register.css";

// ✅ Set API base URL using .env
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;

function Register() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    DpImage: null,
  });
  const [selectedFileName, setSelectedFileName] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      setSelectedFileName(files[0] ? files[0].name : "");
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMessage("");
    setIsLoading(true);

    try {
      const { name, email, mobile, password, confirmPassword, DpImage } = formData;
      const form = new FormData();
      form.append("name", name);
      form.append("email", email);
      form.append("mobile", mobile);
      form.append("password", password);
      form.append("confirmPassword", confirmPassword);
      form.append("DpImage", DpImage);

      // ✅ Use dynamic API URL from .env
      const res = await axios.post(`${API}/register`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setMessage(res.data.message);
      setIsLoading(false);
      setFormData({
        name: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        DpImage: null,
      });
      setSelectedFileName("");
      navigate("/information");
    } catch (err) {
      console.error("❌ Registration failed:", err.response?.data || err.message);
      setMessage(
        err.response?.data?.message || "Registration failed. Please try again."
      );
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    console.log(`Attempting to register via ${platform}`);
    setMessage(
      `Connecting with ${platform}... (Feature not fully implemented)`
    );
  };

  return (
    <div className="registration-container">
      <div className="registrationSection">
        <div className="headingSection">
          <h1>Join Wedly: Inclusive Matrimony for All</h1>
          <p>
            Wedly connects people of all genders and sexual orientations,
            fostering authentic relationships based on shared interests and
            values. Begin your journey to love today.
          </p>
        </div>
        <div className="registration">
          <div className="register">
            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="registerForm"
            >
              <label className="labelStyle">
                Name:
                <input
                  className="inputStyle inputStyleName"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>

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
              </label>

              <label className="labelStyle">
                Mobile Number:
                <input
                  className="inputStyle inputStyleMobile"
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
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
              </label>

              <label className="labelStyle">
                Confirm Password:
                <input
                  className="inputStyle"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="labelStyle">
                Profile Image:
                <input
                  className="inputStyle"
                  type="file"
                  name="DpImage"
                  accept="image/*"
                  onChange={handleChange}
                  required
                />
                {selectedFileName && (
                  <span className="fileNameDisplay">
                    Selected: {selectedFileName}
                  </span>
                )}
              </label>

              {message && <div className="alertBox">{message}</div>}
              {isLoading && <p className="loading">Loading...</p>}
              <button
                type="submit"
                className="submitBtn"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </button>

              <div className="loginLink">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="RegisterSocialLoginSection">
        <div className="RegisterOrDivider">
          <span>OR</span>
        </div>
        <div className="RegisterSocialButtons">
          <button
            className="RegisterSocialBtn googleBtn"
            onClick={() => handleSocialLogin("Google")}
            aria-label="Register with Google"
          >
            <i className="bi bi-google"></i>
          </button>
          <button
            className="RegisterSocialBtn instagramBtn"
            onClick={() => handleSocialLogin("Instagram")}
            aria-label="Register with Instagram"
          >
            <i className="bi bi-instagram"></i>
          </button>
          <button
            className="RegisterSocialBtn twitterBtn"
            onClick={() => handleSocialLogin("Twitter")}
            aria-label="Register with Twitter"
          >
            <i className="bi bi-twitter-x"></i>
          </button>
          <button
            className="RegisterSocialBtn youtubeBtn"
            onClick={() => handleSocialLogin("YouTube")}
            aria-label="Register with YouTube"
          >
            <i className="bi bi-youtube"></i>
          </button>
        </div>
      </div>

      <div className="RegisterSocialBtnPrivacyTerms">
        By registering, you agree to our{" "}
        <Link to="/terms">Terms of Service</Link> and{" "}
        <Link to="/privacy">Privacy Policy</Link>.
      </div>
    </div>
  );
}

export default Register;
