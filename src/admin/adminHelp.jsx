import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './admin.css';



function AdminHelp() {
  const [supports, setSupports] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchSupports();
  }, []);

  const fetchSupports = async () => {
    try {
      const res = await axios.get('/help', { withCredentials: true });
      setSupports(res.data);
    } catch (err) {
      setError('Failed to fetch support requests');
      console.error(err);
    }
  };

  const handleSupported = async (id) => {
    try {
      await axios.post('/help/checkedThaDataBtn', { id }, { withCredentials: true });
      setSupports(prev => prev.map(s => s._id === id ? { ...s, supported: true } : s));
    } catch (err) {
      console.error('Error marking as supported:', err);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/admin/logout', {}, { withCredentials: true });
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      <div className="helpPage">
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
        <div className="ContactSupport">
          {error && <p className="error">{error}</p>}
          {supports.map((support) => (
            <div
              className={`ContactSupportMassageBox ${support.supported ? 'attendUserColor' : ''}`}
              key={support._id}
            >
              <h5 className="ContactSupportMassageUseName">
                {support.userId?.name || 'Unknown'}
              </h5>
              <h5 className="ContactSupportMassageUseConnectNumber">
                {support.mobile}
              </h5>
              <p className="ContactSupportMassageUseIssueOrQuestion">
                {support.message}
              </p>
              {!support.supported && (
                <button
                  className="btnSupported"
                  onClick={() => handleSupported(support._id)}
                >
                  Mark as Supported
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AdminHelp;