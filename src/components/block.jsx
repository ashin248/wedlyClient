import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Ban } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import './css/block.css';


// ✅ Set API base URL using .env
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;

const CustomAlertDialog = ({ message, onClose, onConfirm, showConfirmButton = false, confirmText = "Confirm" }) => {
  if (!message) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-dialog">
        <p className="alert-message">{message}</p>
        <div className="alert-buttons">
          <button onClick={onClose} className="ok-button">
            OK
          </button>
          {showConfirmButton && (
            <button onClick={onConfirm} className="confirm-button">
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function BlockList() {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [reportMessages, setReportMessages] = useState({});
  const [isLoading, setIsLoading] = useState({});

  const showAlert = (message) => {
    setModalMessage(message);
    setShowModal(true);
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  const fetchBlockedUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/block/blockedUsers`, { withCredentials: true });
      setBlockedUsers(res.data);
    } catch (err) {
      console.error("Error fetching blocked users:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch blocked users.";
      showAlert(errorMessage);
    }
  }, []);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const unblockUser = useCallback(async (userId, userName) => {
    const previousBlockedUsers = [...blockedUsers];
    setBlockedUsers(prev => prev.filter(user => user._id !== userId));
    setIsLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const res = await axios.post(
        `${API}/block/unblock/${userId}`,
        {},
        { withCredentials: true }
      );
      showAlert(res.data.message || `${userName} has been unblocked.`);
    } catch (err) {
      console.error("Error unblocking user:", err);
      setBlockedUsers(previousBlockedUsers);
      const errorMessage = err.response?.data?.message || "Failed to unblock user.";
      showAlert(errorMessage);
    } finally {
      setIsLoading(prev => ({ ...prev, [userId]: false }));
    }
  }, [blockedUsers]);

  const handleReportChange = (userId, value) => {
    setReportMessages(prev => ({ ...prev, [userId]: value.slice(0, 500) }));
  };

  const submitReport = useCallback(async (userId, userName) => {
    const reportMessage = reportMessages[userId]?.trim();
    if (!reportMessage) {
      showAlert("Please enter a report message.");
      return;
    }
    setIsLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const res = await axios.post(
        `${API}/block/report/${userId}`,
        { message: reportMessage },
        { withCredentials: true }
      );
      showAlert(res.data.message || `Report for ${userName} submitted successfully.`);
      setReportMessages(prev => ({ ...prev, [userId]: '' }));
    } catch (err) {
      console.error("Error submitting report:", err);
      const errorMessage = err.response?.data?.message || "Failed to submit report.";
      showAlert(errorMessage);
    } finally {
      setIsLoading(prev => ({ ...prev, [userId]: false }));
    }
  }, [reportMessages]);

  return (
    <>
      <ToastContainer />
      <div className="main-container">
        <div className="headingBlock">
          <h2 className="card-title-blocked">Blocked Users</h2>
        </div>
        <CustomAlertDialog message={modalMessage} onClose={closeModal} />
        <div className="card-container">
          {blockedUsers.length === 0 ? (
            <p className="no-users">No users are currently blocked.</p>
          ) : (
            <ul className="blocked-user-list">
              {blockedUsers.map(user => (
                <li key={user._id} className="blocked-user-item">
                  <div className="user-info">
                    <img
                      src={user.DpImage}
                      className="user-image"
                      alt={`${user.name}'s profile`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/40x40/FF69B4/FFFFFF?text=${user.name ? user.name.substring(0, 2).toUpperCase() : '?'}`;
                      }}
                    />
                    <span className="user-name">{user.name}</span>
                  </div>
                  <div className="user-actions">
                    <textarea
                      className="report-textarea"
                      value={reportMessages[user._id] || ''}
                      onChange={(e) => handleReportChange(user._id, e.target.value)}
                      placeholder={`Report ${user.name}...`}
                      maxLength={500}
                    />
                    <button
                      onClick={() => submitReport(user._id, user.name)}
                      className="report-button"
                      title={`Submit report for ${user.name}`}
                      disabled={isLoading[user._id]}
                    >
                      {isLoading[user._id] ? 'Submitting...' : 'Submit Report'}
                    </button>
                    <button
                      onClick={() => unblockUser(user._id, user.name)}
                      className="unblock-button"
                      title={`Unblock ${user.name}`}
                      disabled={isLoading[user._id]}
                    >
                      <Ban size={16} />
                      <span>{isLoading[user._id] ? 'Unblocking...' : 'Unblock'}</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}