
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoImage from "../public/image/LogoImage.png";
import "./css/NavBar.css";
import axios from "axios";

// ✅ Dynamic API base URL from .env
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;



function TopNavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API}/logout`,
        {},
        { withCredentials: true }
      );
      alert(res.data.message);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
      alert(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    <div className="TopNavBar">
      <div className="TopNav">
        <div className="LogoImage">
          <img src={LogoImage} alt="Logo" />
        </div>

        <div className="searchSection">
          <form>
            <input type="search" placeholder="Search..." />
            <button type="submit">
              <i className="bi bi-binoculars-fill"></i>
            </button>
          </form>
        </div>

        <div className="ToggleIcon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? "✖" : "☰"}
        </div>

        <div className={`TopLinkList ${isMenuOpen ? "open" : ""}`}>
          <ul className="TopLinkUl">
            <li className="TopLiNavBar">
              <Link to="/home">Home</Link>
            </li>
            <li className="TopLiNavBar">
              <Link to="/update-information">Update Profile</Link>
            </li>
            <li className="TopLiNavBar">
              <button className="Logout" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TopNavBar;