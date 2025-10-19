import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaFileAlt, 
  FaTasks, 
  FaMapMarkerAlt,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
  FaPlus,
  FaEdit,
  FaEye
} from 'react-icons/fa';
import './SecretaryDashboard.css';

const SecretaryDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalMeetings: 0,
    upcomingMeetings: 0,
    completedMeetings: 0,
    pendingResolutions: 0
  });
  const [meetings, setMeetings] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationValidation, setLocationValidation] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);

      if (!userData) {
        setError('User not authenticated');
        return;
      }

      // Validate user is a secretary
      if (!isSecretary(userData.role)) {
        setError('Access denied: Secretary role required');
        return;
      }

      // Check location setup
      validateSecretaryLocation(userData);

      // Load secretary-specific meetings
      await loadSecretaryMeetings(userData.id);
      
      // Load resolutions that can be assigned
      await loadPendingResolutions();

    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const isSecretary = (role) => {
    return ['SECRETARY', 'COMMITTEE_SECRETARY', 'DELEGATION_SECRETARY'].includes(role);
  };

  const validateSecretaryLocation = (user) => {
    if (!user.country) {
      setLocationValidation({
        valid: false,
        message: 'No country assigned. Please contact admin to assign your country for location-based access.',
        type: 'error'
      });
    } else {
      setLocationValidation({
        valid: true,
        message: `Location validated: ${user.country.name}. You can manage meetings in this country.`,
        type: 'success'
      });
    }
  };

  const loadSecretaryMeetings = async (secretaryId) => {
    try {
              const response = await fetch(`http://localhost:8081/api/meetings/secretary/${secretaryId}`);
      if (response.ok) {
        const meetingsData = await response.json();
        setMeetings(meetingsData);
        
        // Calculate stats
        const now = new Date();
        const upcoming = meetingsData.filter(m => new Date(m.meetingDate) > now).length;
        const completed = meetingsData.filter(m => m.status === 'COMPLETED').length;
        
        setStats(prev => ({
          ...prev,
          totalMeetings: meetingsData.length,
          upcomingMeetings: upcoming,
          completedMeetings: completed
        }));
      } else if (response.status === 403) {
        setError('Access denied: You can only manage meetings in your assigned country');
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
    }
  };

  const loadPendingResolutions = async () => {
    try {
              const response = await fetch('http://localhost:8081/api/resolutions?status=PENDING');
      if (response.ok) {
        const resolutionsData = await response.json();
        setResolutions(resolutionsData);
        
        setStats(prev => ({
          ...prev,
          pendingResolutions: resolutionsData.length
        }));
      }
    } catch (error) {
      console.error('Error loading resolutions:', error);
    }
  };

  const handleCreateMeeting = () => {
    if (!locationValidation?.valid) {
      alert('Cannot create meeting: Country not assigned. Please contact admin.');
      return;
    }
    window.location.href = '/meetings/create';
  };

  const handleTakeMinutes = (meetingId) => {
    window.location.href = `/meetings/${meetingId}/minutes`;
  };

  const handleAssignResolution = (resolutionId) => {
    window.location.href = `/resolutions/${resolutionId}/assign`;
  };

  const handleSendInvitations = (meetingId) => {
    window.location.href = `/meetings/${meetingId}/invitations`;
  };

  if (loading) {
    return (
      <div className="secretary-dashboard loading">
        <FaSpinner className="loading-spinner" />
        <p>Loading Secretary Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="secretary-dashboard error">
        <FaExclamationTriangle className="error-icon" />
        <h2>Access Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="secretary-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Secretary Dashboard</h1>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
        
        {locationValidation && (
          <div className={`location-validation ${locationValidation.type}`}>
            <FaMapMarkerAlt className="location-icon" />
            <span>{locationValidation.message}</span>
            {locationValidation.valid && <FaCheck className="check-icon" />}
          </div>
        )}
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalMeetings}</div>
            <div className="stat-label">Total Meetings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon upcoming">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.upcomingMeetings}</div>
            <div className="stat-label">Upcoming Meetings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <FaCheck />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.completedMeetings}</div>
            <div className="stat-label">Completed Meetings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <FaTasks />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.pendingResolutions}</div>
            <div className="stat-label">Pending Resolutions</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <button 
              onClick={handleCreateMeeting}
              className={`action-btn primary ${!locationValidation?.valid ? 'disabled' : ''}`}
              disabled={!locationValidation?.valid}
            >
              <FaPlus /> Create Meeting
            </button>
            <button 
              onClick={() => window.location.href = '/meetings'}
              className="action-btn secondary"
            >
              <FaCalendarAlt /> View All Meetings
            </button>
            <button 
              onClick={() => window.location.href = '/resolutions'}
              className="action-btn secondary"
            >
              <FaTasks /> Manage Resolutions
            </button>
            <button 
              onClick={() => window.location.href = '/profile'}
              className="action-btn secondary"
            >
              <FaEdit /> Update Profile
            </button>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Recent Meetings</h2>
            <span className="section-subtitle">Meetings in your country</span>
          </div>
          <div className="meetings-list">
            {meetings.slice(0, 5).map(meeting => (
              <div key={meeting.id} className="meeting-item">
                <div className="meeting-info">
                  <h3>{meeting.title}</h3>
                  <p className="meeting-date">
                    {new Date(meeting.meetingDate).toLocaleDateString()} at{' '}
                    {new Date(meeting.meetingDate).toLocaleTimeString()}
                  </p>
                  <p className="meeting-location">
                    <FaMapMarkerAlt /> {meeting.location} ({meeting.hostingCountry?.name})
                  </p>
                </div>
                <div className="meeting-actions">
                  <button 
                    onClick={() => handleSendInvitations(meeting.id)}
                    className="action-btn small"
                  >
                    <FaUsers /> Invitations
                  </button>
                  <button 
                    onClick={() => handleTakeMinutes(meeting.id)}
                    className="action-btn small"
                  >
                    <FaFileAlt /> Minutes
                  </button>
                  <button 
                    onClick={() => window.location.href = `/meetings/${meeting.id}`}
                    className="action-btn small secondary"
                  >
                    <FaEye /> View
                  </button>
                </div>
              </div>
            ))}
            
            {meetings.length === 0 && (
              <div className="empty-state">
                <FaCalendarAlt className="empty-icon" />
                <p>No meetings found in your country</p>
                <button onClick={handleCreateMeeting} className="action-btn primary">
                  <FaPlus /> Create Your First Meeting
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Pending Resolutions</h2>
            <span className="section-subtitle">Resolutions awaiting assignment</span>
          </div>
          <div className="resolutions-list">
            {resolutions.slice(0, 5).map(resolution => (
              <div key={resolution.id} className="resolution-item">
                <div className="resolution-info">
                  <h3>{resolution.title}</h3>
                  <p>{resolution.description}</p>
                  <p className="resolution-meeting">
                    From: {resolution.meeting?.title}
                  </p>
                </div>
                <div className="resolution-actions">
                  <button 
                    onClick={() => handleAssignResolution(resolution.id)}
                    className="action-btn primary small"
                  >
                    <FaTasks /> Assign
                  </button>
                </div>
              </div>
            ))}
            
            {resolutions.length === 0 && (
              <div className="empty-state">
                <FaTasks className="empty-icon" />
                <p>No pending resolutions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretaryDashboard;