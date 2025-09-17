import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/css/register.css";


const API = import.meta.env.VITE_ENV === 'development'
 ? import.meta.env.VITE_LOCALHOST_BASE_URL
 : import.meta.env.VITE_API_BASE_URL;



function Register() {
  // State variables for form data, messages, loading, and file name display
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    DpImage: null, // Stores the File object for the profile image
  });
  const [selectedFileName, setSelectedFileName] = useState(""); // Displays the selected file's name

  // React Router hook for navigation
  const navigate = useNavigate();

  // Handles changes to form input fields
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      // If the input is a file input, store the first selected file
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      // Update the display name for the selected file
      setSelectedFileName(files[0] ? files[0].name : "");
    } else {
      // For text, email, password, etc., update the value directly
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents default form submission behavior (page reload)
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top with smooth behavior
    setMessage(""); // Clear previous messages
    setIsLoading(true); // Set loading state to true

    try {
      // Destructure form data for easier access
      const { name, email, mobile, password, confirmPassword, DpImage } =
        formData;

      // Create a FormData object to send multipart/form-data (required for file uploads)
      const form = new FormData();
      form.append("name", name);
      form.append("email", email);
      form.append("mobile", mobile);
      form.append("password", password);
      form.append("confirmPassword", confirmPassword);
      form.append("DpImage", DpImage); // Append the profile image file

      // Make a POST request to the registration API endpoint
      const res = await axios.post(`${API}/register`, form, {
        headers: {
          "Content-Type": "multipart/form-data", // Essential for FormData
        },
        withCredentials: true, // Important if your backend uses sessions/cookies
      });

      // On successful registration
      setMessage(res.data.message); // Display success message
      setIsLoading(false); // End loading state
      // Reset form fields
      setFormData({
        name: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        DpImage: null,
      });
      setSelectedFileName(""); // Clear selected file name display
      navigate("/information"); // Redirect to the login page
    } catch (err) {
      // On registration failure
      console.error(
        "❌ Registration failed:",
        err.response?.data || err.message
      );
      setMessage(
        err.response?.data?.message || "Registration failed. Please try again."
      );
      setIsLoading(false); // End loading state
    }
  };

  // Function to handle social login clicks (for demonstration)
  const handleSocialLogin = (platform) => {
    console.log(`Attempting to register via ${platform}`);
    // In a real application, this would initiate the OAuth flow for the selected platform
    setMessage(
      `Connecting with ${platform}... (Feature not fully implemented)`
    );
  };

  return (
    <>
      {/* The main container for the entire registration page, used for centering */}
      <div className="registration-container">
        {/* Section holding the heading/description and the registration form */}
        <div className="registrationSection">
          {/* Heading and introductory paragraph */}
          <div className="headingSection">
            <h1>Join Wedly: Inclusive Matrimony for All</h1>
            <p>
              Wedly connects people of all genders and sexual orientations,
              fostering authentic relationships based on shared interests and
              values. Begin your journey to love today.
            </p>
          </div>
          {/* The container for the registration form with the glowing effect */}
          <div className="registration">
            {/* The actual registration form box */}
            <div className="register">
              <form
                onSubmit={handleSubmit}
                encType="multipart/form-data"
                className="registerForm"
              >
                {/* Name Input */}
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

                {/* Email Input */}
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

                {/* Mobile Number Input */}
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

                {/* Password Input */}
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

                {/* Confirm Password Input */}
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

                {/* Profile Image File Input */}
                <label className="labelStyle">
                  Profile Image:
                  <input
                    className="inputStyle"
                    type="file"
                    name="DpImage"
                    accept="image/*" // Only allows image files
                    onChange={handleChange}
                    required
                  />
                  {/* Display selected file name */}
                  {selectedFileName && (
                    <span className="fileNameDisplay">
                      Selected: {selectedFileName}
                    </span>
                  )}
                </label>
                {/* Display messages (success/error) */}
                {message && <div className="alertBox">{message}</div>}
                {/* Display loading indicator */}
                {isLoading && <p className="loading">Loading...</p>}
                {/* Submit Button */}
                <button
                  type="submit"
                  className="submitBtn"
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register"}
                </button>

                {/* Link to Login page */}
                <div className="loginLink">
                  Already have an account? <Link to="/login">Login</Link>
                </div>
              </form>
            </div>{" "}
            {/* End of .register */}
          </div>{" "}
          {/* End of .registration */}
        </div>{" "}
        {/* End of .registrationSection */}

        {/* End of .registration-container */}
        {/* Social Login Section */}
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
              <i className="bi bi-twitter-x"></i> {/* Using X icon for Twitter */}
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
        {/* Terms and Privacy Policy Link */}
        <div className="RegisterSocialBtnPrivacyTerms">
          By registering, you agree to our{" "}
          <Link to="/terms">Terms of Service</Link> and{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </div>


      </div>{" "}

    </>
  );
}

export default Register;
