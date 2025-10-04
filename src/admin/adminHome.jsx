import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './admin.css';

// ✅ Dynamic API base URL from .env
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;


function AdminHome() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    totalUsers: 0,
    genders: {
      Man: 0,
      Woman: 0,
      TransgenderMan: 0,
      TransgenderWoman: 0,
      'Non-Binary': 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API}/admin/home`, {
          withCredentials: true,
        });
        setData({
          totalUsers: response.data.totalUsers,
          genders: response.data.genders,
        });
        console.log('Admin data:', response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Fetch admin data error:', err);
        setError(err.response?.data?.message || 'Failed to load admin data');
        setIsLoading(false);
        if (err.response?.status === 401) {
          navigate('/admin/login');
        }
      }
    };
    fetchAdminData();
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
          <>
            <div className="adminHomePageTotalUsers">
              <div className="adminTotalUser">
                <div className="adminHomePageTotalUsersHeading">
                  <h1 className="adminHomePageTotalUsersHeadingH1">Total Users</h1>
                  <div className="totalUser">
                    <h3 className="UserCount">User total: {data.totalUsers}</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="adminHomePageGenderUser">
              <div className="adminTotalGender">
                <div className="adminGenderHeading">
                  <h1>Total Gender</h1>
                </div>
                <div className="AdminListOfGender">
                  <h3 className="GenderForMen">Men: {data.genders.Man}</h3>
                  <h3 className="GenderForWoman">Women: {data.genders.Woman}</h3>
                  <h3 className="GenderForTransgenderMan">Transgender Men: {data.genders.TransgenderMan}</h3>
                  <h3 className="GenderForTransgenderWoman">Transgender Women: {data.genders.TransgenderWoman}</h3>
                  <h3 className="GenderForNonBinary">Non-Binary: {data.genders['Non-Binary']}</h3>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminHome;
