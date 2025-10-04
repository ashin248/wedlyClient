import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { country } from "../Data/Country";
import { States } from "../Data/States";
import "./css/home.css";

// ✅ Set API base URL using .env
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;


const MARITAL_STATUS = ["Single", "Divorced", "Widowed", "Separated"];

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [compatibleUsers, setCompatibleUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    state: "",
    maritalStatus: "",
    currentPlace: "",
    profession: "",
    education: "",
    age: "",
    height: "",
    weight: "",
    religion: "", // Added to match backend query
    caste: "", // Added to match backend query
    income: "", // Added to match backend query
  });
  const [flippedCards, setFlippedCards] = useState({});
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API}/home`, {
          withCredentials: true,
        });
        const { currentUser, compatibleUsers } = response.data;
        setCurrentUser(currentUser);
        setCompatibleUsers(Array.isArray(compatibleUsers) ? compatibleUsers : []);
      } catch (err) {
        console.error("Fetch home data error:", err);
        setError(err.response?.data?.message || "Failed to fetch home data.");
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams(formData).toString();
      const res = await axios.get(`${API}/home?${queryParams}`, {
        withCredentials: true,
      });
      const { compatibleUsers } = res.data;
      setCompatibleUsers(Array.isArray(compatibleUsers) ? compatibleUsers : []);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.response?.data?.message || "Failed to perform search.");
    } finally {
      setLoading(false);
    }
  };

  const handleInterest = async (targetUserId) => {
    try {
      if (!currentUser?._id) {
        toast.error("User ID not found. Please log in again.", {
          position: "top-center",
          className: "custom-toast",
        });
        return;
      }
      const confirmSend = window.confirm("Are you sure you want to send interest?");
      if (confirmSend) {
        await axios.post(
          `${API}/interest/send/${targetUserId}`,
          {},
          { withCredentials: true }
        );
        toast.success("Interest sent successfully!", {
          position: "top-center",
          className: "custom-toast",
        });
        setCurrentUser((prev) => ({
          ...prev,
          sentInterests: [...(prev.sentInterests || []), targetUserId],
        }));
      }
    } catch (err) {
      console.error("Interest error:", err);
      toast.error(err.response?.data?.message || "Failed to send interest.", {
        position: "top-center",
        className: "custom-toast",
      });
    }
  };

  const handleToggleFlip = (userId) => {
    setFlippedCards((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <>
      <ToastContainer />
      <div className="homePage">
        <div className="filterSection">
          <button
            type="button"
            style={{ color: "whitesmoke" }}
            className={`filter-toggle-button ${isFilterVisible ? "expanded" : ""}`}
            onClick={() => setIsFilterVisible(!isFilterVisible)}
          >
            {isFilterVisible ? "Hide Filters" : "Show Filters"}
          </button>

          {isFilterVisible && (
            <div className={`filter-form ${isFilterVisible ? "show" : ""}`}>
              <h2>Find Your Perfect Match</h2>
              <form onSubmit={handleSearch}>
                {[
                  "name",
                  "currentPlace",
                  "profession",
                  "education",
                  "age",
                  "height",
                  "weight",
                  "religion",
                  "caste",
                  "income",
                ].map((field) => (
                  <label key={field} className="labelStyle">
                    {field[0].toUpperCase() + field.slice(1)}:
                    <input
                      type={
                        field === "age" || field === "height" || field === "weight"
                          ? "number"
                          : "text"
                      }
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      placeholder={`Search by ${field}`}
                    />
                  </label>
                ))}
                <label className="labelStyle">
                  Country:
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  >
                    <option value="">Select Country</option>
                    {Array.isArray(country) ? (
                      country.map((item, i) => (
                        <option key={i} value={item}>
                          {item}
                        </option>
                      ))
                    ) : (
                      <option value="">No countries available</option>
                    )}
                  </select>
                </label>
                <label className="labelStyle">
                  State:
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  >
                    <option value="">Select State</option>
                    {Array.isArray(States) ? (
                      States.map((item, i) => (
                        <option key={i} value={item}>
                          {item}
                        </option>
                      ))
                    ) : (
                      <option value="">No states available</option>
                    )}
                  </select>
                </label>
                <label className="labelStyle">
                  Marital Status:
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    {MARITAL_STATUS.map((item, i) => (
                      <option key={i} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" className="btnFilter">
                  Search
                </button>
              </form>
            </div>
          )}
        </div>
        <div className="userBody">
          {compatibleUsers.length > 0 ? (
            compatibleUsers.map((user) => {
              const isFlipped = flippedCards[user.id || user._id] || false;
              const alreadyInterested = currentUser?.sentInterests?.includes(
                user.id || user._id
              );
              return (
                <div
                  key={user.id || user._id}
                  className={`userBodyCard ${isFlipped ? "flipped" : ""}`}
                >
                  <div className="card-front">
                    <div className="UserBodyBox">
                      <div className="image">
                        <h5 className="frontName">{user.name}</h5>
                        <img
                          className="userImage"
                          src={
                            user.DpImage ||
                            "https://placehold.co/100x100/A270AF/FFFFFF?text=No+Image"
                          }
                          alt={`${user.name}'s profile`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/100x100/A270AF/FFFFFF?text=No+Image";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="card-back">
                    <div className="userInfo">
                      <h5>{user.name}</h5>
                      <p>Age: {user.age || "N/A"}</p>
                      <p>Height: {user.height || "N/A"}</p>
                      <p>Profession: {user.profession || "N/A"}</p>
                      <p>Location: {user.location || "N/A"}</p>
                      <p>Marital Status: {user.maritalStatus || "N/A"}</p>
                      <p>Education: {user.education || "N/A"}</p>
                      <p>Religion: {user.religion || "N/A"}</p>
                      <p>Caste: {user.caste || "N/A"}</p>
                      <p>Income: {user.income || "N/A"}</p>
                    </div>
                  </div>
                  <div className="btnSection">
                    <button
                      id="idInterested"
                      className={`btn ${alreadyInterested ? "btn-interested" : ""}`}
                      disabled={alreadyInterested}
                      onClick={() =>
                        !alreadyInterested && handleInterest(user.id || user._id)
                      }
                    >
                      {alreadyInterested ? "Interested" : "Send Interest"}
                    </button>
                    <button
                      id="idDetails&Image"
                      className="btn"
                      onClick={() => handleToggleFlip(user.id || user._id)}
                    >
                      {isFlipped ? "Show Image" : "Show Details"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No compatible users found based on your criteria.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;