
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/NavBar.css";

// ✅ Dynamic API base URL from .env
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;


function BottomNavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${API}/user`, {
          withCredentials: true,
        });
        console.log("User Data:", res.data);
        setUser(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Fetch User Error:", err.response || err);
        if (err.response?.status === 401) {
          setError("Please log in to view your profile.");
        } else {
          setError("Failed to load user data.");
        }
        setIsLoading(false);
      }
    };

    const fetchCounts = async () => {
      try {
        const res = await axios.get(`${API}/notifications`, {
          withCredentials: true,
        });
        setMessageCount(res.data.messageCount || 0);
        setLikeCount(res.data.likeCount || 0);
      } catch (err) {
        console.error("Fetch Counts Error:", err);
      }
    };

    fetchUserData();
    fetchCounts();
  }, []);

  const handleMessagesClick = async () => {
    try {
      await axios.post(
        `${API}/notifications/mark-messages-viewed`,
        {},
        { withCredentials: true }
      );
      setMessageCount(0);
      navigate("/message");
    } catch (err) {
      console.error("Error marking messages as viewed:", err);
    }
  };

  const handleInterestsClick = async () => {
    try {
      await axios.post(
        `${API}/notifications/mark-interests-viewed`,
        {},
        { withCredentials: true }
      );
      setLikeCount(0);
      navigate("/interest");
    } catch (err) {
      console.error("Error marking interests as viewed:", err);
    }
  };

  return (
    <div className="BottomNavBar">
      <div className="BottomNav">
        <div className="profileImageSection">
          <span className="notification">
            <i className="bi bi-bell-fill"></i>
          </span>
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <>
              <img
                src={user?.DpImage || "/default-profile.png"}
                alt="Profile"
                className="profileImg"
              />
              <p className="userName">{user?.name || "Guest"}</p>
            </>
          )}
        </div>

        <div className={`BottomLink ${isMenuOpen ? "open" : ""}`}>
          <ul className="BottomLinkUl">
            <li className="BottomLinkLi" onClick={handleMessagesClick}>
              <Link to="/message">Message</Link>
              {messageCount > 0 && (
                <span className="count">{messageCount}</span>
              )}
            </li>
            <li className="BottomLinkLi" onClick={handleInterestsClick}>
              <Link to="/interest">Interest</Link>
              {likeCount > 0 && <span className="count">{likeCount}</span>}
            </li>
          </ul>
        </div>

        <div className="BottomNavOptions">
          <i
            className="bi bi-three-dots-vertical"
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          ></i>
          {isOptionsOpen && (
            <div className="BottomSelect">
              <Link to="/block">Block</Link>
              <Link to="/help">Help</Link>
              <Link to="/settings">Settings</Link>
            </div>
          )}
        </div>

        <div className="ToggleIcon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? "✖" : "☰"}
        </div>
      </div>
    </div>
  );
}

export default BottomNavBar;
