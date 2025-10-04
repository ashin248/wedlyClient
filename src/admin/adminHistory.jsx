import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './admin.css';

// ✅ Dynamic API base URL from .env
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;


function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API}/admin/history`, {
          withCredentials: true,
        });
        setHistory(Array.isArray(response.data) ? response.data : []);
        console.log('History data:', response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Fetch history error:', err);
        setError(err.response?.data?.message || 'Failed to load deletion history');
        setIsLoading(false);
        if (err.response?.status === 401) {
          navigate('/admin/login');
        }
      }
    };
    fetchHistory();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/admin/logout`, {}, { withCredentials: true });
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to log out');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="adminHomePage">
      <nav className="adminNavbar">
        <div className="navbarBrand">
          <h1>Matrimony Admin</h1>
        </div>
        <button className="navbarToggle" onClick={toggleMenu}>
          <i className="bi bi-list"></i>
        </button>
        <div className={`navbarLinks ${isMenuOpen ? 'active' : ''}`}>
          <button className="navLink" onClick={() => navigate('/admin/home')}>
            Home
          </button>
          <button className="navLink" onClick={() => navigate('/admin/reports')}>
            Reports
          </button>
          <button className="navLink" onClick={() => navigate('/admin/blocks')}>
            Blocks
          </button>
          <button className="navLink" onClick={() => navigate('/admin/history')}>
            History
          </button>
          <button className="navLink" onClick={() => navigate('/admin/help')}>
            Help
          </button>
          <button className="navLink navLogout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <div className="adminHomeSection">
        {error && <div className="matrimony-alert-box matrimony-error">{error}</div>}
        {isLoading ? (
          <p className="matrimony-loading">Loading...</p>
        ) : (
          <div className="AdminHistorySection">
            <div className="AdminHistoryHeading">
              <h1 className="AdminHistoryHeadingH1">Deletion History</h1>
            </div>
            <div className="historySectionBox">
              {history.length > 0 ? (
                history.map((entry) => (
                  <div className="historyEntry" key={entry._id}>
                    <h3>{entry.userDetails?.name || 'Unknown'}</h3>
                    <h4>Deleted on: {new Date(entry.deletedAt).toLocaleString()}</h4>
                    <p>Reason: {entry.reason || 'Not provided'}</p>
                    {entry.userDetails ? (
                      <>
                        <p><strong>Email:</strong> {entry.userDetails.email || 'Not provided'}</p>
                        <p><strong>Mobile:</strong> {entry.userDetails.mobile || 'Not provided'}</p>
                        <p><strong>Country:</strong> {entry.userDetails.country || 'Not provided'}</p>
                        <p><strong>State:</strong> {entry.userDetails.state || 'Not provided'}</p>
                        <p><strong>District:</strong> {entry.userDetails.district || 'Not provided'}</p>
                        <p><strong>Religion:</strong> {entry.userDetails.religion || 'Not provided'}</p>
                        <p><strong>Gender:</strong> {entry.userDetails.gender || 'Not provided'}</p>
                        <p><strong>Orientation:</strong> {entry.userDetails.orientation || 'Not provided'}</p>
                        <p><strong>Marital Status:</strong> {entry.userDetails.maritalStatus || 'Not provided'}</p>
                        <p><strong>Date of Birth:</strong> {entry.userDetails.dob ? new Date(entry.userDetails.dob).toLocaleDateString() : 'Not provided'}</p>
                        <p><strong>Height:</strong> {entry.userDetails.height || 'Not provided'}</p>
                        <p><strong>Weight:</strong> {entry.userDetails.weight || 'Not provided'}</p>
                        <p><strong>Education:</strong> {entry.userDetails.education || 'Not provided'}</p>
                        <p><strong>Profession:</strong> {entry.userDetails.profession || 'Not provided'}</p>
                        <p><strong>Income:</strong> {entry.userDetails.income || 'Not provided'}</p>
                        <p><strong>Languages:</strong> {entry.userDetails.languages || 'Not provided'}</p>
                        <p><strong>Habits:</strong> {entry.userDetails.habits || 'Not provided'}</p>
                        <p><strong>Diet:</strong> {entry.userDetails.diet || 'Not provided'}</p>
                        <p><strong>Partner Expectations:</strong> {entry.userDetails.partnerExpectations || 'Not provided'}</p>
                        <p><strong>Disability:</strong> {entry.userDetails.disability || 'Not provided'}</p>
                        <p><strong>Relocate:</strong> {entry.userDetails.relocate || 'Not provided'}</p>
                        <p><strong>Family Details:</strong> {entry.userDetails.familyDetails || 'Not provided'}</p>
                        <p><strong>Horoscope:</strong> {entry.userDetails.horoscope || 'Not provided'}</p>
                      </>
                    ) : (
                      <p>No user details available.</p>
                    )}
                  </div>
                ))
              ) : (
                <p>No deletion history found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
