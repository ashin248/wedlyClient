import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './admin.css';

// ✅ Dynamic API base URL from .env
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;


function Blocks() {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API}/admin/blocks`, {
          withCredentials: true,
        });
        setBlocks(Array.isArray(response.data) ? response.data : []);
        console.log('Blocks data:', response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Fetch blocks error:', err);
        setError(err.response?.data?.message || 'Failed to load blocks');
        setIsLoading(false);
        if (err.response?.status === 401) {
          navigate('/admin/login');
        }
      }
    };
    fetchBlocks();
  }, [navigate]);

  const handleRemoveAccount = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user account?')) return;

    try {
      await axios.post(
        `${API}/admin/remove/${userId}`,
        { reason: 'Removed due to blocks' },
        { withCredentials: true }
      );
      setBlocks((prev) => prev.filter((b) => b._id !== userId));
    } catch (err) {
      console.error('Remove account error:', err);
      setError(err.response?.data?.message || 'Failed to remove account');
    }
  };

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
          <div className="BlockSection">
            <div className="AdminBlockHeading">
              <h1 className="AdminBlockHeadingH1">Block List</h1>
            </div>
            <div className="blockSectionBox">
              {blocks.length > 0 ? (
                blocks.map((block) => (
                  <div className="personWhoReceivedTheBlock" key={block._id}>
                    <p>Total block count: {block.count}</p>
                    <ul>
                      <li className="personWhoReceivedTheBlock">
                        <img
                          src={block.blockedUser?.DpImage || 'https://placehold.co/40x40/FF69B4/FFFFFF?text=?'}
                          alt={block.blockedUser?.name || 'User'}
                          className="personWhoReceivedTheBlockImage"
                        />
                        <h2 className="personWhoReceivedTheBlockName">{block.blockedUser?.name || 'Unknown'}</h2>
                      </li>
                    </ul>
                    <button
                      className="personWhoReceivedTheBlockAccountRemove"
                      onClick={() => handleRemoveAccount(block._id)}
                    >
                      Remove Account
                    </button>
                  </div>
                ))
              ) : (
                <p>No blocked users found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Blocks;

