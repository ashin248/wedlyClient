import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, Mic, Image, Ban, Phone, Video, X } from 'lucide-react';
import './css/message.css';


// ✅ Set API base URL using .env
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;


export default function Message() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [opacity, setOpacity] = useState(100);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [callState, setCallState] = useState(null); // null | 'incoming' | 'initiating' | 'ringing' | 'active'
  const [callType, setCallType] = useState(null); // 'audio' | 'video'
  const [callId, setCallId] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const navigate = useNavigate();

  // Show alert modal
  const showAlert = (message, type = 'info') => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
      setModalMessage('');
      setModalType('info');
    }, 2500);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
    setModalType('info');
  };

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Fetch current user and blocked users
  useEffect(() => {
    axios
      .get(`${API}/blockedUsers`, { withCredentials: true })
      .then((res) => {
        console.log('Current user response:', res.data);
        setCurrentUserId(res.data.user._id);
        if (res.data.user.blockedUsers) {
          setBlockedUsers(res.data.user.blockedUsers.map((id) => id.toString()));
        }
      })
      .catch((err) => {
        console.error('Error fetching current user:', err);
        showAlert('Failed to fetch current user', 'error');
        if (err.response?.status === 401) {
          console.log('Unauthorized, redirecting to login');
          navigate('/login');
        }
      });
  }, [navigate]);

  // Fetch interested users
  useEffect(() => {
    if (!currentUserId) return;
    setIsLoadingUsers(true);
    axios
      .get(`${API}/message`, { withCredentials: true })
      .then((res) => {
        console.log('Interested users response:', res.data);
        setInterestedUsers(res.data);
      })
      .catch((err) => {
        console.error('Error fetching interested users:', err);
        showAlert('Failed to fetch interested users', 'error');
      })
      .finally(() => setIsLoadingUsers(false));
  }, [currentUserId]);

  // Handle conversation and polling
  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      setCallState(null);
      setCallType(null);
      setCallId(null);
      return;
    }

    let polling = true;

    const fetchConversation = async () => {
      try {
        const res = await axios.get(`${API}/message/conversation/${selectedUser.id}`, {
          withCredentials: true,
        });
        setMessages(res.data);
      } catch (err) {
        console.error('Fetch conversation error:', err);
        showAlert('Failed to fetch conversation', 'error');
      }
    };

    fetchConversation();

    const poll = async () => {
      if (!polling) return;
      try {
        const res = await axios.get(`${API}/message/poll/${selectedUser.id}?lastChecked=${Date.now()}`, {
          withCredentials: true,
        });
        if (res.status === 200 && res.data.messages.length > 0) {
          setMessages((prev) => {
            const newMessages = res.data.messages.filter((m) => !prev.some((x) => x._id === m._id));
            return [...prev, ...newMessages];
          });
        }

        const callMessages = res.data.messages.filter((m) => m.callType);
        if (callMessages.length) {
          const latest = callMessages[callMessages.length - 1];

          if (latest.receiverId.toString() === currentUserId && !latest.callDuration) {
            if (callState !== 'active' && callState !== 'incoming') {
              setCallState('incoming');
              setCallType(latest.callType);
              setCallId(latest._id);
              showAlert(`Incoming ${latest.callType} call from ${selectedUser.name}`, 'info');
            }
          }

          if (latest.senderId.toString() === currentUserId && !latest.callDuration) {
            if (callState === 'initiating') {
              setCallState('ringing');
            }
          }

          if (latest.callDuration && callId && latest._id === callId) {
            endCallLocal();
            showAlert(`Call ended (${latest.callDuration}s)`, 'info');
          }

          if (latest.callRejected && latest._id === callId) {
            showAlert('Call was rejected', 'warning');
            endCallLocal();
          }
        }
      } catch (err) {
        console.error('Poll error:', err);
      } finally {
        if (polling) setTimeout(poll, 3000);
      }
    };

    poll();

    return () => {
      polling = false;
      endCallLocal();
    };
  }, [selectedUser, currentUserId, callState, callId]);

  // Setup WebRTC peer connection
  const setupPeerConnection = useCallback(() => {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
    peerConnectionRef.current = new RTCPeerConnection(config);

    peerConnectionRef.current.ontrack = (ev) => {
      if (!remoteStreamRef.current) remoteStreamRef.current = new MediaStream();
      ev.streams?.[0]?.getTracks().forEach((t) => remoteStreamRef.current.addTrack(t));
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStreamRef.current;
    };

    peerConnectionRef.current.onicecandidate = async (ev) => {
      if (ev.candidate && callId) {
        try {
          await axios.post(
            `${API}/message/call/ice-candidate`,
            { callId, candidate: ev.candidate },
            { withCredentials: true }
          );
        } catch (err) {
          console.error('ICE send error', err);
        }
      }
    };
  }, [callId]);

  // Poll ICE candidates
  useEffect(() => {
    if (!callId || callState !== 'active') return;
    const pollIce = async () => {
      try {
        const res = await axios.get(`${API}/message/call/ice-candidate?callId=${callId}`, {
          withCredentials: true,
        });
        if (res.data.candidate && peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(res.data.candidate));
        }
      } catch (err) {
        console.error('ICE poll error', err);
      }
    };
    const interval = setInterval(pollIce, 1000);
    return () => clearInterval(interval);
  }, [callId, callState]);

  // Send text message
  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedUser) return;
    try {
      const res = await axios.post(
        `${API}/message`,
        { receiverId: selectedUser.id, text: input },
        { withCredentials: true }
      );
      setMessages((p) => [...p, res.data]);
      setInput('');
    } catch (err) {
      console.error('Send message error:', err);
      showAlert('Failed to send message', 'error');
    }
  }, [input, selectedUser]);

  // Start voice recording
  const startVoiceRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      // audioChunksRef = useRef([]);
      let audioChunksRef = useRef([]);
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const fd = new FormData();
        fd.append('audio', audioBlob, 'voice.webm');
        fd.append('receiverId', selectedUser.id);
        try {
          const res = await axios.post(`${API}/message/messageVoice`, fd, {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          setMessages((p) => [...p, res.data]);
        } catch (err) {
          console.error('Send voice message error:', err);
          showAlert('Failed to send voice message', 'error');
        }
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Start recording error:', err);
      showAlert('Failed to start recording', 'error');
    }
  }, [selectedUser]);

  // Stop voice recording
  const stopVoiceRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  // Send image
  const sendImage = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file || !selectedUser) return;
      const fd = new FormData();
      fd.append('image', file);
      fd.append('receiverId', selectedUser.id);
      try {
        const res = await axios.post(`${API}/message/messageImage`, fd, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessages((p) => [...p, res.data]);
      } catch (err) {
        console.error('Send image error:', err);
        showAlert('Failed to send image', 'error');
      }
    },
    [selectedUser]
  );

  // Toggle block/unblock user
  const toggleBlock = useCallback(async () => {
    if (!selectedUser) return;
    const uid = selectedUser.id;
    const wasBlocked = blockedUsers.includes(uid);
    setBlockedUsers((p) => (wasBlocked ? p.filter((x) => x !== uid) : [...p, uid]));
    try {
      const endpoint = wasBlocked ? `/block/unblock/${uid}` : `/block/block/${uid}`;
      await axios.post(`${API}${endpoint}`, {}, { withCredentials: true });
      showAlert(wasBlocked ? 'User unblocked' : 'User blocked', 'success');
    } catch (err) {
      console.error('Toggle block error:', err);
      // Revert optimistic update on error
      setBlockedUsers((p) => (wasBlocked ? [...p, uid] : p.filter((x) => x !== uid)));
      showAlert('Failed to toggle block', 'error');
    }
  }, [selectedUser, blockedUsers]);

  // Initiate a call
  const initiateCall = useCallback(
    async (type) => {
      if (!selectedUser) return;
      try {
        setCallType(type);
        setCallState('initiating');

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' }).catch((err) => {
          throw new Error(`Media device access denied: ${err.message}`);
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        setupPeerConnection();
        stream.getTracks().forEach((t) => peerConnectionRef.current.addTrack(t, stream));

        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);

        const res = await axios.post(
          `${API}/message/call/initiate`,
          { receiverId: selectedUser.id, callType: type, offer },
          { withCredentials: true }
        );

        setCallId(res.data.callId);
        setCallState('ringing');

        const waitForAnswer = async () => {
          try {
            const ans = await axios.get(`${API}/message/call/answer?callId=${res.data.callId}`, {
              withCredentials: true,
            });
            if (ans.data.answer) {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(ans.data.answer));
              setCallState('active');
            } else {
              const conv = await axios.get(`${API}/message/conversation/${selectedUser.id}`, {
                withCredentials: true,
              });
              const callMsg = conv.data.find((m) => m._id === res.data.callId);
              if (callMsg?.callRejected) {
                showAlert('Call rejected by receiver', 'warning');
                endCallLocal();
                return;
              }
              if (callState === 'ringing' || callState === 'initiating') setTimeout(waitForAnswer, 1000);
            }
          } catch (err) {
            console.error('Poll answer error:', err);
            showAlert('Failed during call setup', 'error');
            endCallLocal();
          }
        };

        waitForAnswer();
      } catch (err) {
        console.error('Initiate call error:', err);
        showAlert(`Failed to initiate call: ${err.message}`, 'error');
        endCallLocal();
      }
    },
    [selectedUser, setupPeerConnection, callState]
  );

  // Accept a call
  const acceptCall = useCallback(
    async (incomingCallId, type) => {
      try {
        setCallType(type);
        setCallState('active');
        setCallId(incomingCallId);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' }).catch((err) => {
          throw new Error(`Media device access denied: ${err.message}`);
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        setupPeerConnection();
        stream.getTracks().forEach((t) => peerConnectionRef.current.addTrack(t, stream));

        const conv = await axios.get(`${API}/message/conversation/${selectedUser.id}`, {
          withCredentials: true,
        });
        const callMsg = conv.data.find((m) => m._id === incomingCallId);
        if (!callMsg) throw new Error('Call message not found');

        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(callMsg.sdp.offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        await axios.post(
          `${API}/message/call/answer`,
          { callId: incomingCallId, answer },
          { withCredentials: true }
        );
      } catch (err) {
        console.error('Accept call error:', err);
        showAlert('Failed to accept call', 'error');
        endCallLocal();
      }
    },
    [selectedUser, setupPeerConnection]
  );

  // Reject a call
  const rejectCall = useCallback(async (incomingCallId) => {
    try {
      await axios.post(
        `${API}/message/call/reject`,
        { callId: incomingCallId },
        { withCredentials: true }
      );
      showAlert('Call rejected', 'warning');
      setCallState(null);
      setCallType(null);
      setCallId(null);
    } catch (err) {
      console.error('Reject call error:', err);
      showAlert('Failed to reject call', 'error');
    }
  }, []);

  // End call locally
  const endCallLocal = useCallback(async () => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((t) => t.stop());
        remoteStreamRef.current = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (callId) {
        try {
          await axios.post(`${API}/message/call/end`, { callId }, { withCredentials: true });
        } catch (e) {
          console.error('Notify end error:', e);
        }
      }
    } finally {
      setCallState(null);
      setCallType(null);
      setCallId(null);
    }
  }, [callId]);

  // Handle opacity change
  const handleOpacityChange = (e) => setOpacity(e.target.value);

  return (
    <div className="main-container">
      {showModal && (
        <div className={`alert-overlay ${modalType}`}>
          <div className={`alert-dialog ${modalType}`}>
            <p>{modalMessage}</p>
            <button onClick={closeModal} className="ok-button" aria-label="Close alert">
              OK
            </button>
          </div>
        </div>
      )}

      <div className="app-container" style={{ opacity: opacity / 100 }}>
        <div className="sidebar">
          <h2>Interested Users</h2>
          {isLoadingUsers ? (
            <p>Loading...</p>
          ) : interestedUsers.length === 0 ? (
            <p>No interested users found.</p>
          ) : (
            interestedUsers.map((u) => (
              <div
                key={u.id}
                className={`user-item ${selectedUser?.id === u.id ? 'selected' : ''}`}
                onClick={() => setSelectedUser(u)}
              >
                <img src={u.DpImage} alt="Profile" className="user-image" />
                <span className="User-item-name">{u.name}</span>
              </div>
            ))
          )}
        </div>

        <div className="chat-container">
          <div className="chat-header">
            <h4>{selectedUser ? `Chat with ${selectedUser.name}` : 'Select user'}</h4>

            {selectedUser && (
              <div className="header-buttons">
                <button onClick={toggleBlock} title="Block or Unblock this user" aria-label="Block or Unblock">
                  <Ban size={18} />
                </button>
                <button
                  onClick={() => initiateCall('audio')}
                  disabled={callState !== null || blockedUsers.includes(selectedUser.id)}
                  title="Start audio call"
                  aria-label="Start audio call"
                >
                  <Phone size={18} />
                </button>
                <button
                  onClick={() => initiateCall('video')}
                  disabled={callState !== null || blockedUsers.includes(selectedUser.id)}
                  title="Start video call"
                  aria-label="Start video call"
                >
                  <Video size={18} />
                </button>
                <button onClick={() => setSelectedUser(null)} title="Close Chat" aria-label="Close Chat">
                  Close Chat
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    navigate('/home');
                  }}
                  title="Back to Home"
                  aria-label="Back to Home"
                >
                  Back to Home
                </button>
              </div>
            )}
          </div>

          <div className="chat-messages">
            {selectedUser ? (
              messages.length === 0 ? (
                <p>Say hello!</p>
              ) : (
                messages.map((m) => (
                  <div key={m._id} className={`message ${m.senderId === currentUserId ? 'sent' : 'recv'}`}>
                    <div className="message-content">
                      {m.text && <p>{m.text}</p>}
                      {m.audioPath && <audio controls src={`${API}/${m.audioPath}`} />}
                      {m.imagePath && <img src={`${API}/${m.imagePath}`} alt="Message" />}
                      {m.callType && (
                        <p className="call-msg">
                          {m.callDuration ? `${m.callType} call (${m.callDuration}s)` : `${m.callType} call started`}
                        </p>
                      )}
                      <small>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                  </div>
                ))
              )
            ) : (
              <p>Select a user to start</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {selectedUser && !blockedUsers.includes(selectedUser.id) && (
            <div className="message-input-area">
              {callState === 'incoming' && (
                <div className="incoming-controls">
                  <span>Incoming {callType} call</span>
                  <button className="accept" onClick={() => acceptCall(callId, callType)}>
                    Accept
                  </button>
                  <button className="reject" onClick={() => rejectCall(callId)}>
                    Reject
                  </button>
                </div>
              )}

              {callState === 'initiating' && (
                <div className="initiating-controls">
                  <span>Starting call...</span>
                  <button className="cancel" onClick={endCallLocal}>
                    <X size={14} /> Cancel
                  </button>
                </div>
              )}

              {callState === 'ringing' && (
                <div className="ringing-controls">
                  <span>Ringing...</span>
                  <button className="cancel" onClick={endCallLocal}>
                    <X size={14} /> Cancel
                  </button>
                </div>
              )}

              {callState === 'active' && (
                <div className="active-controls">
                  <span>{callType === 'video' ? 'Video Call' : 'Audio Call'} in progress</span>
                  <button className="end" onClick={endCallLocal}>
                    End Call
                  </button>
                </div>
              )}

              <div className="input-row">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isRecording || callState === 'active'}
                />
                <button onClick={sendMessage} disabled={!input.trim() || isRecording || callState === 'active'}>
                  <Send size={16} />
                </button>
                <button onClick={isRecording ? stopVoiceRecording : startVoiceRecording} disabled={callState === 'active'}>
                  <Mic size={16} />
                </button>
                <label className="image-upload">
                  <Image size={16} />
                  <input type="file" accept="image/*" onChange={sendImage} disabled={callState === 'active'} />
                </label>
              </div>

              {callState === 'active' && callType === 'video' && (
                <div className="video-area">
                  <video ref={localVideoRef} autoPlay muted className="local-video" />
                  <video ref={remoteVideoRef} autoPlay className="remote-video" />
                </div>
              )}
            </div>
          )}

          <div className="opacity-control">
            <label>Opacity: {opacity}%</label>
            <input type="range" min="50" max="100" value={opacity} onChange={handleOpacityChange} />
          </div>
        </div>
      </div>
    </div>
  );
}