import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaUser, FaBell, FaFileAlt, FaChartLine, FaClock, FaExclamationTriangle, 
  FaCheckCircle, FaEye, FaEdit, FaSpinner, FaTasks, FaCalendarAlt,
  FaEnvelope, FaPhone, FaUserTie, FaBuilding, FaPercent, FaComment,
  FaTimes, FaCheck, FaFilter, FaClear, FaSearch, FaSort,
  FaChevronDown, FaChevronUp, FaThumbsUp, FaThumbsDown, FaHistory,
  FaArrowUp, FaArrowDown, FaArrowRight, FaLock, FaUsers, FaUserShield
} from 'react-icons/fa';
import ChairService from '../services/chairService';
import AuthService from '../services/authService';
import ProfileService from '../services/profileService';
import './ChairDashboard.css';
import { useNavigate } from 'react-router-dom';

const EnhancedChairDashboard = () => {
  const [activeTab, setActiveTab] = useState('resolutions');
  const [user, setUser] = useState(null);
  const [resolutions, setResolutions] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Report submission state
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState(null);
  const [reportForm, setReportForm] = useState({
    progressDetails: '',
    hindrances: '',
    performancePercentage: 75
  });
  const [submitting, setSubmitting] = useState(false);

  // Profile editing state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Mock user data for demonstration
  const mockUser = {
    id: 1,
    name: "John Chair",
    email: "chair@tech.eara.org",
    phone: "+256-700-345678",
    role: "CHAIR",
    subcommitteeId: 1
  };

  const navigate = useNavigate();

  // Fetch user profile and profile picture
  const fetchUserProfile = async () => {
    if (!mockUser?.email) return;
    
    try {
      setLoadingProfile(true);
      
      // Fetch user profile from database
      const profileData = await ProfileService.getUserProfile(mockUser.email);
      setUserProfile(profileData);
      
      // If profile has a profile picture, get the full URL
      if (profileData.profilePicture) {
        const fullPictureUrl = ProfileService.getFullProfilePictureUrl(profileData.profilePicture);
        setProfilePictureUrl(fullPictureUrl);
      }
    } catch (error) {
      console.warn('Failed to fetch user profile, using fallback data:', error);
      // Use fallback data from localStorage
      setUserProfile(mockUser);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUserProfile();
    
    // Set up notification polling every 30 seconds
    const notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(notificationInterval);
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUserProfile(),
        fetchResolutions(),
        fetchReports(),
        fetchNotifications()
      ]);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchResolutions = async () => {
    try {
      const resolutionsData = await ChairService.getAssignedResolutions(currentUser.subcommitteeId);
      setResolutions(resolutionsData);
    } catch (error) {
      console.error('Error fetching resolutions:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const reportsData = await ChairService.getChairReports(currentUser.id);
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const [notificationsData, unreadCountData] = await Promise.all([
        ChairService.getUserNotifications(currentUser.id),
        ChairService.getUnreadNotificationCount(currentUser.id)
      ]);
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [currentUser.id]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const reportData = {
        resolutionId: selectedResolution.id,
        subcommitteeId: currentUser.subcommitteeId,
        progressDetails: reportForm.progressDetails,
        hindrances: reportForm.hindrances,
        performancePercentage: reportForm.performancePercentage
      };

      const validationErrors = ChairService.validateReportData(reportData);
      if (validationErrors.length > 0) {
        setError(validationErrors.join('. '));
        return;
      }

      await ChairService.submitReport(reportData);
      setSuccess('Report submitted successfully!');
      
      // Reset form and close modal
      setReportForm({
        progressDetails: '',
        hindrances: '',
        performancePercentage: 75
      });
      setShowReportModal(false);
      setSelectedResolution(null);
      
      // Refresh data
      await fetchReports();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setError('');

    try {
      await ChairService.updateUserProfile(currentUser.email, profileForm);
      setSuccess('Profile updated successfully!');
      setShowProfileModal(false);
      await fetchUserProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const openReportModal = (resolution) => {
    setSelectedResolution(resolution);
    setShowReportModal(true);
    setError('');
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedResolution(null);
    setReportForm({
      progressDetails: '',
      hindrances: '',
      performancePercentage: 75
    });
    setError('');
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await ChairService.markNotificationAsRead(notification.id);
        await fetchNotifications();
      }
      
      // Handle different notification types
      if (notification.type === 'REPORT_REJECTION') {
        setActiveTab('reports');
      } else if (notification.type === 'TASK_ASSIGNMENT') {
        setActiveTab('resolutions');
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const getDeadlineBadgeClass = (deadline) => {
    const urgency = ChairService.getDeadlineUrgency(deadline);
    return `deadline-badge ${urgency}`;
  };

  const getPerformanceCircleStyle = (percentage) => {
    const color = ChairService.getPerformanceColor(percentage);
    return {
      backgroundColor: color
    };
  };

  const getReportStatusBadgeClass = (status) => {
    return `report-status-badge ${status.toLowerCase().replace('_', '-')}`;
  };

  if (loading) {
    return (
      <div className="chair-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="chair-dashboard">
      <div className="chair-container">
        {/* Header */}
        <div className="chair-header">
          <div className="chair-title-section">
            <div className="chair-icon">
              <FaUserTie />
            </div>
            <div>
              <h1 className="chair-title">Commissional General</h1>
              <p className="chair-subtitle">
                {user?.subcommittee?.name} • {user?.name}
              </p>
            </div>
          </div>
          
          <div className="header-actions">
            <div 
              className="profile-avatar"
              onClick={() => navigate('/profile')}
              title="Click to view profile"
            >
              {loadingProfile ? (
                <div className="avatar-loading">
                  <FaSpinner className="loading-spinner" />
                </div>
              ) : profilePictureUrl ? (
                <img 
                  src={profilePictureUrl} 
                  alt={`${userProfile?.name || mockUser?.name || 'User'}'s profile`}
                  className="avatar-image"
                  onError={(e) => {
                    // Hide image on error and show placeholder
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              {(!profilePictureUrl || loadingProfile) && (
                <div className="avatar-placeholder">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 
                   mockUser?.name ? mockUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="alert alert-error">
            <FaExclamationTriangle />
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <FaCheckCircle />
            {success}
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon resolutions">
                <FaTasks />
              </div>
              <div className="stat-info">
                <p className="stat-label">Assigned Resolutions</p>
                <p className="stat-value">{resolutions.length}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon reports">
                <FaFileAlt />
              </div>
              <div className="stat-info">
                <p className="stat-label">Reports Submitted</p>
                <p className="stat-value">{reports.length}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon performance">
                <FaChartLine />
              </div>
              <div className="stat-info">
                <p className="stat-label">Avg Performance</p>
                <p className="stat-value">
                  {reports.length > 0 
                    ? Math.round(reports.reduce((sum, r) => sum + r.performancePercentage, 0) / reports.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon notifications">
                <FaBell />
              </div>
              <div className="stat-info">
                <p className="stat-label">Notifications</p>
                <p className="stat-value">{unreadCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="chair-main-content">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'resolutions' ? 'active' : ''}`}
              onClick={() => setActiveTab('resolutions')}
            >
              <FaTasks />
              Assigned Resolutions
            </button>
            <button
              className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <FaFileAlt />
              Report History
            </button>
            <button
              className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <FaBell />
              Notifications
              {unreadCount > 0 && ` (${unreadCount})`}
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Assigned Resolutions Tab */}
            {activeTab === 'resolutions' && (
              <div>
                {resolutions.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaTasks />
                    </div>
                    <h3 className="empty-state-title">No Assigned Resolutions</h3>
                    <p className="empty-state-description">
                      You don't have any resolutions assigned to your subcommittee yet.
                    </p>
                  </div>
                ) : (
                  <div className="resolutions-grid">
                    {resolutions.map(resolution => (
                      <div key={resolution.id} className="resolution-card">
                        <div className="resolution-header">
                          <div>
                            <h3 className="resolution-title">{resolution.title}</h3>
                            <span className={`resolution-status ${resolution.status.toLowerCase().replace('_', '-')}`}>
                              {resolution.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        
                        <p className="resolution-description">{resolution.description}</p>
                        
                        <div className="resolution-meta">
                          <div className="resolution-meta-item">
                            <FaCalendarAlt />
                            <span>Assigned: {ChairService.formatDate(resolution.assignedDate)}</span>
                          </div>
                          <div className="resolution-meta-item">
                            <FaClock />
                            <span>Deadline: {ChairService.formatDate(resolution.deadline)}</span>
                            <span className={getDeadlineBadgeClass(resolution.deadline)}>
                              {ChairService.getDaysUntilDeadline(resolution.deadline) > 0 
                                ? `${ChairService.getDaysUntilDeadline(resolution.deadline)} days left`
                                : 'Overdue'
                              }
                            </span>
                          </div>
                          <div className="resolution-meta-item">
                            <FaPercent />
                            <span>Your contribution: {resolution.contributionPercentage}%</span>
                          </div>
                        </div>
                        
                        <div className="resolution-actions">
                          <button
                            className="btn-primary"
                            onClick={() => openReportModal(resolution)}
                          >
                            <FaFileAlt />
                            Submit Report
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => {/* View history logic */}}
                          >
                            <FaEye />
                            View History
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Report History Tab */}
            {activeTab === 'reports' && (
              <div>
                {reports.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaFileAlt />
                    </div>
                    <h3 className="empty-state-title">No Reports Yet</h3>
                    <p className="empty-state-description">
                      You haven't submitted any reports yet. Start by submitting a report for an assigned resolution.
                    </p>
                  </div>
                ) : (
                  <div className="reports-list">
                    {reports.map(report => (
                      <div key={report.id} className="report-item">
                        <div className="report-header">
                          <div className="report-info">
                            <h4 className="report-resolution">{report.resolution.title}</h4>
                            <p className="report-date">
                              Submitted: {ChairService.formatDate(report.submittedAt)}
                            </p>
                          </div>
                          <span className={getReportStatusBadgeClass(report.status)}>
                            {report.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="report-content">
                          <div className="report-section">
                            <h5 className="report-section-title">Progress Details</h5>
                            <p className="report-text">{report.progressDetails}</p>
                          </div>
                          
                          {report.hindrances && (
                            <div className="report-section">
                              <h5 className="report-section-title">Hindrances</h5>
                              <p className="report-text">{report.hindrances}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="performance-indicator">
                          <div 
                            className="performance-circle"
                            style={getPerformanceCircleStyle(report.performancePercentage)}
                          >
                            {report.performancePercentage}%
                          </div>
                          <div>
                            <strong>Performance Rating</strong>
                            <p>Self-assessed completion percentage</p>
                          </div>
                        </div>
                        
                        {report.status === 'REJECTED_BY_HOD' && report.hodComments && (
                          <div className="hod-comments">
                            <h5 className="hod-comments-title">
                              <FaComment />
                              HOD Comments
                            </h5>
                            <p className="hod-comments-text">{report.hodComments}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaBell />
                    </div>
                    <h3 className="empty-state-title">No Notifications</h3>
                    <p className="empty-state-description">
                      You're all caught up! No new notifications at this time.
                    </p>
                  </div>
                ) : (
                  <div className="notifications-list">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="notification-header">
                          <h4 className="notification-title">
                            {ChairService.getNotificationIcon(notification.type)}
                            {notification.title}
                          </h4>
                          <span className="notification-time">
                            {ChairService.formatDate(notification.createdAt)}
                          </span>
                        </div>
                        
                        <p className="notification-message">{notification.message}</p>
                        
                        {notification.hodComments && (
                          <div className="hod-comments">
                            <h5 className="hod-comments-title">
                              <FaComment />
                              HOD Comments
                            </h5>
                            <p className="hod-comments-text">{notification.hodComments}</p>
                          </div>
                        )}
                        
                        <div className="notification-actions">
                          {notification.type === 'REPORT_REJECTION' && (
                            <button className="btn-primary">
                              <FaEdit />
                              Resubmit Report
                            </button>
                          )}
                          {notification.type === 'TASK_ASSIGNMENT' && (
                            <button className="btn-primary">
                              <FaEye />
                              View Task
                            </button>
                          )}
                          {notification.type === 'MEETING_INVITATION' && (
                            <button className="btn-primary">
                              <FaCalendarAlt />
                              View Meeting
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Report Submission Modal */}
        {showReportModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <form onSubmit={handleReportSubmit} className="report-form">
                <div className="form-header">
                  <h3 className="form-title">Submit Progress Report</h3>
                  <p className="form-subtitle">{selectedResolution?.title}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Progress Details *</label>
                  <textarea
                    className="form-textarea"
                    value={reportForm.progressDetails}
                    onChange={(e) => setReportForm(prev => ({
                      ...prev,
                      progressDetails: e.target.value
                    }))}
                    placeholder="Describe the progress made on this resolution..."
                    required
                    minLength={10}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hindrances (Optional)</label>
                  <textarea
                    className="form-textarea"
                    value={reportForm.hindrances}
                    onChange={(e) => setReportForm(prev => ({
                      ...prev,
                      hindrances: e.target.value
                    }))}
                    placeholder="Describe any obstacles or delays encountered..."
                  />
                </div>

                <div className="form-group">
                  <div className="performance-group">
                    <label className="form-label">Performance Percentage</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={reportForm.performancePercentage}
                      onChange={(e) => setReportForm(prev => ({
                        ...prev,
                        performancePercentage: parseInt(e.target.value)
                      }))}
                      className="performance-slider"
                    />
                    <div className="performance-display">
                      <span className="performance-value">
                        {reportForm.performancePercentage}%
                      </span>
                      <span>Complete</span>
                    </div>
                    <div className="performance-labels">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={closeReportModal}
                    className="btn-secondary"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="loading-spinner" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaFileAlt />
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Profile Update Modal */}
        {showProfileModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <form onSubmit={handleProfileUpdate} className="report-form">
                <div className="form-header">
                  <h3 className="form-title">Update Profile</h3>
                  <p className="form-subtitle">Edit your personal information</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role (Read-only)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={user?.role || 'CHAIR'}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subcommittee (Read-only)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={user?.subcommittee?.name || ''}
                    disabled
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="btn-secondary"
                    disabled={updatingProfile}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={updatingProfile}
                  >
                    {updatingProfile ? (
                      <>
                        <FaSpinner className="loading-spinner" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaUser />
                        Update Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedChairDashboard;
