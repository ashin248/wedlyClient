import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './admin.css';

// ✅ Dynamic API base URL from .env
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;


function Reports() {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${API}/admin/reports`, {
                    withCredentials: true,
                });
                setReports(Array.isArray(response.data) ? response.data : []);
                console.log('Reports data:', response.data);
                setIsLoading(false);
            } catch (err) {
                console.error('Fetch reports error:', err);
                setError(err.response?.data?.message || 'Failed to load reports');
                setIsLoading(false);
                if (err.response?.status === 401) {
                    navigate('/admin/login');
                }
            }
        };
        fetchReports();
    }, [navigate]);

    const handleRemoveAccount = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this user account?')) return;

        try {
            await axios.post(
                `${API}/admin/remove/${userId}`,
                { reason: 'Removed due to reports' },
                { withCredentials: true }
            );
            setReports((prev) => prev.filter((r) => r._id !== userId));
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

    const getReportColor = (count) => {
        if (count >= 5) return 'red';
        if (count === 4) return 'orange';
        if (count === 3) return 'yellow';
        if (count === 2) return 'green';
        return 'transparent';
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
                    <button className="navLink" onClick={() => navigate('/admin/blocks')}>
                        Blocks
                    </button>
                    <button className="navLink" onClick={() => navigate('/admin/history')}>
                        History
                    </button>
                    <button className="navLink navLogout" onClick={handleLogout}>
                        Logout
                    </button>
                    <button className='navLink' onClick={() => navigate('/admin/help')}>
                        help
                    </button>
                </div>
            </nav>
            <div className="adminHomeSection">
                {error && <div className="matrimony-alert-box matrimony-error">{error}</div>}
                {isLoading ? (
                    <p className="matrimony-loading">Loading...</p>
                ) : (
                    <div className="AdminReportAndBlockList">
                        <div className="AdminReportCommentsHeading">
                            <h1 className="AdminReportCommentsHeadingH1">Report List</h1>
                        </div>
                        <div className="AdminReportAndBlockListBox">
                            {reports.length > 0 ? (
                                reports.map((report) => (
                                    <div
                                        className="personWhoReceivedTheReport"
                                        key={report._id}
                                        style={{ backgroundColor: getReportColor(report.count) }}
                                    >
                                        <div className="AdminReportSection">
                                            <div className="AdminReportImg">
                                                <img
                                                    src={report.reportedUser?.DpImage || 'https://placehold.co/40x40/FF69B4/FFFFFF?text=?'}
                                                    alt={report.reportedUser?.name || 'User'}
                                                    className="AdminImgReport"
                                                />
                                            </div>
                                            <div className="AdminNameOfThePersonWhoReceivedTheReport">
                                                <p className="AdminNameReport">{report.reportedUser?.name || 'Unknown'}</p>
                                            </div>
                                            <div className="ReportCommentSection">
                                                <h3>Number of reports: {report.count}</h3>
                                                <ul className="ListOF">
                                                    {report.reports.map((r, index) => (
                                                        <li key={index}>
                                                            <img
                                                                src={r.reporter?.DpImage || 'https://placehold.co/40x40/FF69B4/FFFFFF?text=?'}
                                                                alt={r.reporter?.name || 'Reporter'}
                                                                className="personWhoReportedImg"
                                                            />
                                                            <p className="personWhoReportedReportComment">{r.message}</p>
                                                            <span className="personWhoReportedTo">
                                                                <i className="bi bi-arrow-right"></i>
                                                            </span>
                                                            <h1 className="ReportedUser">{report.reportedUser?.name || 'Unknown'}</h1>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button
                                                    type="button"
                                                    className="personWhoReceivedTheReportAccountRemove"
                                                    onClick={() => handleRemoveAccount(report._id)}
                                                >
                                                    Remove Account
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No reports found.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Reports;

