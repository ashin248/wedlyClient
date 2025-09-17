import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './css/interests.css';



function Interest() {
  const [interests, setInterests] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/interest', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => {
        console.log('Get Interests Status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Get Interests Response:', data);
        if (data.pending || data.accepted) {
          setInterests(data.pending || []);
          setAccepted(data.accepted || []);
        } else {
          setError(data.message || 'No interests found');
        }
      })
      .catch(err => {
        console.error('Fetch error:', err.message, err.stack);
        setError(`Failed to load interests: ${err.message}`);
      });
  }, []);

  const handleAcceptToggle = (userId) => {
    fetch(`/interest/accept/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Accept Response:', data);
        if (data.message === 'Interest accepted') {
          setInterests(prev => prev.filter(user => user._id !== userId));
          const acceptedUser = interests.find(user => user._id === userId);
          if (acceptedUser) setAccepted(prev => [...prev, acceptedUser]);
        } else if (data.message === 'Interest unaccepted') {
          setAccepted(prev => prev.filter(user => user._id !== userId));
          const unacceptedUser = accepted.find(user => user._id === userId);
          if (unacceptedUser) setInterests(prev => [...prev, unacceptedUser]);
        } else {
          setError(data.message || 'Failed to process interest');
        }
      })
      .catch(err => {
        console.error('Accept toggle error:', err.message, err.stack);
        setError(`Failed to process interest: ${err.message}`);
      });
  };

  const handleReject = (userId) => {
    fetch(`/interest/reject/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Reject Response:', data);
        if (data.message === 'Interest rejected') {
          setInterests(prev => prev.filter(user => user._id !== userId));
        } else {
          setError(data.message || 'Failed to reject interest');
        }
      })
      .catch(err => {
        console.error('Reject error:', err.message, err.stack);
        setError(`Failed to reject interest: ${err.message}`);
      });
  };

  return (
    <div className="interestContainer">
      <div className="interestHeader">
        <h2 className="interestHeading">People Who Liked You</h2>
        <div className="massageOfInterest">
          {interests.length === 0 && accepted.length === 0 ? (
            <p className='massageInterest'>{error || 'No interests found'}</p>
          ) : (
            <>
              {/* Pending Interests */}
              {interests.map(user => (
                <div className="interestListBox" key={user._id}>
                  <div className="interestUserImage">
                    <img
                      src={user.DPImage || user.profileImage || '/default.jpg'}
                      alt={`${user.name}'s profile`}
                      style={{ width: '100px', height: '50px', objectFit: 'cover' }}
                      onError={(e) => {
                        if (!e.target.dataset.errorHandled) {
                          e.target.dataset.errorHandled = "true";
                          e.target.src = '/default.jpg';
                        }
                      }}
                    />
                  </div>
                  <div className="interestUserName">
                    {user.name} {user.age ? `(${user.age})` : ''}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAcceptToggle(user._id)}
                    className="interestAccept"
                    style={{ width: '100px', height: '50px' }}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(user._id)}
                    className="interestReject"
                    style={{ width: '100px', height: '50px' }}
                  >
                    Reject
                  </button>
                </div>
              ))}

              {/* Accepted Interests */}
              {accepted.map(user => (
                <div className="interestListBox" key={user._id}>
                  <div className="interestUserImage">
                    <img
                      src={user.DpImage || '/default.jpg'}
                      alt={`${user.name}'s profile`}
                      style={{ width: '100px', height: '50px', objectFit: 'cover' }}
                      onError={(e) => {
                        if (!e.target.dataset.errorHandled) {
                          e.target.dataset.errorHandled = "true";
                          e.target.src = '/default.jpg';
                        }
                      }}
                    />
                  </div>
                  <div className="interestUserName">
                    {user.name} {user.age ? `(${user.age})` : ''} (Accepted)
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAcceptToggle(user._id)}
                    className="interestAccept accepted"
                    style={{ width: '100px', height: '50px' }}
                  >
                    Unaccept
                  </button>
                  <button
                    type="button"
                    className="interestAcceptActiveMassageBtn"
                    style={{ width: '100px', height: '40px' }}
                  >

                    <Link to="/message">Chat</Link>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Interest;