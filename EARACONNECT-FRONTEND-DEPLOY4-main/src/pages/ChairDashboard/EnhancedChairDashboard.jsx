import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaUser, FaBell, FaFileAlt, FaChartLine, FaClock, FaExclamationTriangle, 
  FaCheckCircle, FaEye, FaEdit, FaSpinner, FaTasks, FaCalendarAlt,
  FaEnvelope, FaPhone, FaUserTie, FaBuilding, FaPercent, FaComment,
  FaPlus, FaTimes, FaSave, FaTrash, FaArrowLeft, FaInfoCircle,
  FaUsers, FaCalendar, FaCheckDouble
} from 'react-icons/fa';
import ChairService from '../../services/chairService';
import ProfileService from '../../services/profileService';
import './EnhancedChairDashboard.css';

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

  // Resolution details view state
  const [showResolutionDetails, setShowResolutionDetails] = useState(false);
  const [selectedResolutionDetails, setSelectedResolutionDetails] = useState(null);
  const [resolutionDetailsLoading, setResolutionDetailsLoading] = useState(false);

  // Report submission state
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState(null);
  const [reportForm, setReportForm] = useState({
    progressDetails: '',
    hindrances: '',
    performancePercentage: 75
  });
  const [submitting, setSubmitting] = useState(false);

  // Report resubmission state
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [selectedRejectedReport, setSelectedRejectedReport] = useState(null);
  const [resubmitForm, setResubmitForm] = useState({
    progressDetails: '',
    hindrances: '',
    performancePercentage: 75
  });
  const [resubmitting, setResubmitting] = useState(false);

  // Profile editing state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // State for user profile data including profile picture
  const [userProfile, setUserProfile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Get current user from localStorage or auth context
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('🔍 EnhancedChairDashboard: Current user:', user);
        return user;
      }
    } catch (error) {
      console.error('❌ EnhancedChairDashboard: Error getting current user:', error);
    }
    
    // Fallback for testing - remove in production
    return {
      id: 1,
      email: "chair@tech.eara.org",
      subcommitteeId: 1,
      role: "CHAIR"
    };
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    initializeDashboard();
    
    // Set up notification polling every 30 seconds
    const notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(notificationInterval);
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 EnhancedChairDashboard: Initializing dashboard for user:', currentUser);
      
      await Promise.all([
        fetchUserProfile(),
        fetchResolutions(),
        fetchReports(),
        fetchNotifications()
      ]);
    } catch (error) {
      console.error('❌ EnhancedChairDashboard: Error initializing dashboard:', error);
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      console.log('🔍 EnhancedChairDashboard: Fetching user profile for:', currentUser.email);
      const profile = await ChairService.getUserProfile(currentUser.email);
      setUser(profile);
      setUserProfile(profile);
      setProfileForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || ''
      });
      
      // If profile has a profile picture, get the full URL
      if (profile.profilePicture) {
        const fullPictureUrl = ProfileService.getFullProfilePictureUrl(profile.profilePicture);
        setProfilePictureUrl(fullPictureUrl);
      }
      
      console.log('✅ EnhancedChairDashboard: User profile loaded:', profile);
    } catch (error) {
      console.error('❌ EnhancedChairDashboard: Error fetching profile:', error);
      // Use fallback data
      setUser(currentUser);
      setUserProfile(currentUser);
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchResolutions = async () => {
    try {
      console.log('🔍 EnhancedChairDashboard: Fetching assigned resolutions for chair:', currentUser.id);
      const resolutions = await ChairService.getAssignedResolutions(currentUser.id);
      console.log('✅ EnhancedChairDashboard: Loaded resolutions:', resolutions);
      setResolutions(resolutions);
    } catch (error) {
      console.error('❌ EnhancedChairDashboard: Error fetching resolutions:', error);
      
      // Check if it's a user validation error
      if (error.message && error.message.includes('User validation failed')) {
        setError('User validation failed. Please ensure you are logged in as a Chair and have proper permissions.');
      } else if (error.message && error.message.includes('Network error')) {
        setError('Backend server is not available. Please check if the server is running.');
      } else {
        setError('Failed to load assigned resolutions: ' + error.message);
      }
    }
  };

  const fetchReports = async () => {
    try {
      console.log('🔍 EnhancedChairDashboard: Fetching reports for chair:', currentUser.id);
      const reports = await ChairService.getChairReports(currentUser.id);
      console.log('✅ EnhancedChairDashboard: Loaded reports:', reports);
      setReports(reports);
    } catch (error) {
      console.error('❌ EnhancedChairDashboard: Error fetching reports:', error);
      setError('Failed to load reports');
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      console.log('🔍 EnhancedChairDashboard: Fetching notifications for user:', currentUser.id);
      const [notificationsData, unreadCountData] = await Promise.all([
        ChairService.getUserNotifications(currentUser.id),
        ChairService.getUnreadNotificationCount(currentUser.id)
      ]);
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
      console.log('✅ EnhancedChairDashboard: Notifications loaded:', notificationsData.length, 'unread:', unreadCountData);
    } catch (error) {
      console.error('❌ EnhancedChairDashboard: Error fetching notifications:', error);
    }
  }, [currentUser.id]);

  const handleResolutionDetailsView = async (resolution) => {
    try {
      setResolutionDetailsLoading(true);
      setError('');
      
      console.log('🔍 EnhancedChairDashboard: Fetching detailed resolution:', resolution.id);
      const detailedResolution = await ChairService.getResolutionDetails(resolution.id, currentUser.id);
      
      if (detailedResolution) {
        setSelectedResolutionDetails(detailedResolution);
        setShowResolutionDetails(true);
        console.log('✅ EnhancedChairDashboard: Resolution details loaded:', detailedResolution);
      } else {
        setError('Failed to load resolution details');
      }
    } catch (error) {
      console.error('❌ EnhancedChairDashboard: Error fetching resolution details:', error);
      setError('Failed to load resolution details: ' + error.message);
    } finally {
      setResolutionDetailsLoading(false);
    }
  };

  const closeResolutionDetails = () => {
    setShowResolutionDetails(false);
    setSelectedResolutionDetails(null);
    setError('');
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError('');
      
      // Validate report data
      const validationErrors = ChairService.validateReportData(reportForm);
      if (validationErrors.length > 0) {
        setError('Validation failed: ' + validationErrors.join(', '));
        return;
      }

      console.log('🔍 EnhancedChairDashboard: Submitting report for resolution:', selectedResolution.id);
      
      const reportData = {
        resolutionId: selectedResolution.id,
        subcommitteeId: currentUser.subcommitteeId,
        chairId: currentUser.id,
        progressDetails: reportForm.progressDetails,
        hindrances: reportForm.hindrances,
        performancePercentage: reportForm.performancePercentage
      };

      const savedReport = await ChairService.submitReport(reportData);
      console.log('✅ EnhancedChairDashboard: Report submitted successfully:', savedReport);
      
      // Show success message with HOD confirmation
      const successMessage = savedReport.successMessage || 'Report submitted successfully! It has been sent to HOD for review.';
      setSuccess(successMessage);
      setShowReportModal(false);
      setReportForm({
        progressDetails: '',
        hindrances: '',
        performancePercentage: 75
      });
      
      // Refresh reports list
      await fetchReports();
      
    } catch (error) {
      console.error('❌ EnhancedChairDashboard: Error submitting report:', error);
      setError('Failed to submit report: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setError('');

    try {
      console.log('🔍 EnhancedChairDashboard: Updating profile for:', currentUser.email);
      await ChairService.updateUserProfile(currentUser.email, profileForm);
      setSuccess('Profile updated successfully!');
      setShowProfileModal(false);
      await fetchUserProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ EnhancedChairDashboard: Error updating profile:', error);
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

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setError('');
  };

  const openResubmitModal = (report) => {
    setSelectedRejectedReport(report);
    setResubmitForm({
      progressDetails: report.progressDetails || '',
      hindrances: report.hindrances || '',
      performancePercentage: report.performancePercentage || 75
    });
    setShowResubmitModal(true);
    setError('');
  };

  const closeResubmitModal = () => {
    setShowResubmitModal(false);
    setSelectedRejectedReport(null);
    setResubmitForm({
      progressDetails: '',
      hindrances: '',
      performancePercentage: 75
    });
    setError('');
  };

  const handleReportResubmit = async (e) => {
    e.preventDefault();
    
    try {
      setResubmitting(true);
      setError('');
      
      // Validate report data
      const validationErrors = ChairService.validateReportData(resubmitForm);
      if (validationErrors.length > 0) {
        setError('Validation failed: ' + validationErrors.join(', '));
        return;
      }

      console.log('🔍 EnhancedChairDashboard: Resubmitting report:', selectedRejectedReport.id);
      
      const reportData = {
        reportId: selectedRejectedReport.id,
        chairId: currentUser.id,
        progressDetails: resubmitForm.progressDetails,
        hindrances: resubmitForm.hindrances,
        performancePercentage: resubmitForm.performancePercentage
      };

      const updatedReport = await ChairService.updateReport(selectedRejectedReport.id, reportData);
      console.log('✅ EnhancedChairDashboard: Report resubmitted successfully:', updatedReport);
      
      setSuccess('Report resubmitted successfully! It has been sent to HOD for review.');
      setShowResubmitModal(false);
      setResubmitForm({
        progressDetails: '',
        hindrances: '',
        performancePercentage: 75
      });
      
      // Refresh reports list
      await fetchReports();
      
    } catch (error) {
      console.error('❌ EnhancedChairDashboard: Error resubmitting report:', error);
      setError('Failed to resubmit report: ' + error.message);
    } finally {
      setResubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <FaSpinner className="loading-spinner" />
        <p>Loading Commissional General Dashboard...</p>
      </div>
    );
  }

  // Resolution Details View
  if (showResolutionDetails && selectedResolutionDetails) {
    return (
      <div className="enhanced-chair-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="user-info">
              <button 
                className="back-btn"
                onClick={closeResolutionDetails}
              >
                <FaArrowLeft />
                Back to Dashboard
              </button>
              <div>
                <h1>Resolution Details</h1>
                <p>Viewing: {selectedResolutionDetails.title}</p>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className="btn btn-primary"
                onClick={() => openReportModal(selectedResolutionDetails)}
              >
                <FaFileAlt />
                Submit Report to HOD
              </button>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="alert alert-error">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <FaCheckCircle />
            <span>{success}</span>
          </div>
        )}

        {/* Resolution Details Content */}
        <div className="resolution-details-content">
          <div className="resolution-details-card">
            <div className="resolution-details-header">
              <h2>{selectedResolutionDetails.title}</h2>
              <span className={`status ${selectedResolutionDetails.status?.toLowerCase() || 'assigned'}`}>
                {selectedResolutionDetails.status || 'ASSIGNED'}
              </span>
            </div>

            <div className="resolution-details-body">
              <div className="detail-section">
                <h3><FaFileAlt /> Description</h3>
                <p>{selectedResolutionDetails.description}</p>
              </div>

              <div className="detail-section">
                <h3><FaInfoCircle /> Basic Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Created:</span>
                    <span className="info-value">{ChairService.formatDate(selectedResolutionDetails.createdAt)}</span>
                  </div>
                  {selectedResolutionDetails.meeting && (
                    <div className="info-item">
                      <span className="info-label">Meeting:</span>
                      <span className="info-value">{selectedResolutionDetails.meeting.title}</span>
                    </div>
                  )}
                  {selectedResolutionDetails.createdBy && (
                    <div className="info-item">
                      <span className="info-label">Created By:</span>
                      <span className="info-value">{selectedResolutionDetails.createdBy.name}</span>
                    </div>
                  )}
                  {selectedResolutionDetails.assignments && selectedResolutionDetails.assignments.length > 0 && (
                    <div className="info-item">
                      <span className="info-label">Your Contribution:</span>
                      <span className="info-value">
                        {selectedResolutionDetails.assignments.find(a => a.subcommittee?.id === currentUser.subcommitteeId)?.contributionPercentage || 0}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedResolutionDetails.assignments && selectedResolutionDetails.assignments.length > 0 && (
                <div className="detail-section">
                  <h3><FaUsers /> Subcommittee Assignments</h3>
                  <div className="assignments-list">
                    {selectedResolutionDetails.assignments.map((assignment, index) => (
                      <div key={index} className="assignment-item">
                        <div className="assignment-header">
                          <span className="subcommittee-name">{assignment.subcommittee?.name}</span>
                          <span className="contribution-percentage">{assignment.contributionPercentage}%</span>
                        </div>
                        {assignment.subcommittee?.chair && (
                          <div className="assignment-chair">
                            <FaUserTie />
                            <span>Chair: {assignment.subcommittee.chair.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedResolutionDetails.reports && selectedResolutionDetails.reports.length > 0 && (
                <div className="detail-section">
                  <h3><FaFileAlt /> Reports History</h3>
                  <div className="reports-history">
                    {selectedResolutionDetails.reports.map((report, index) => (
                      <div key={index} className="report-history-item">
                        <div className="report-history-header">
                          <span className="report-date">{ChairService.formatDate(report.submittedAt)}</span>
                          <span className={`report-status ${report.status.toLowerCase()}`}>
                            {report.status}
                          </span>
                        </div>
                        <div className="report-history-content">
                          <p><strong>Progress:</strong> {report.progressDetails}</p>
                          {report.hindrances && (
                            <p><strong>Hindrances:</strong> {report.hindrances}</p>
                          )}
                          <p><strong>Performance:</strong> {report.performancePercentage}%</p>
                          {report.hodComments && (
                            <div className="hod-comments">
                              <FaComment />
                              <strong>HOD Comments:</strong> {report.hodComments}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="resolution-details-actions">
              <button 
                className="btn btn-primary"
                onClick={() => openReportModal(selectedResolutionDetails)}
              >
                <FaFileAlt />
                Submit Report to HOD
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-chair-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <FaUserTie className="user-icon" />
            <div>
              <h1>Commissional General</h1>
              <p>Welcome back, {user?.name || 'Chair'}</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="notification-btn"
              onClick={() => setActiveTab('notifications')}
            >
              <FaBell />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            <div 
              className="profile-avatar"
              onClick={() => setShowProfileModal(true)}
              title="Click to view profile"
            >
              {loadingProfile ? (
                <div className="avatar-loading">
                  <FaSpinner className="loading-spinner" />
                </div>
              ) : profilePictureUrl ? (
                <img 
                  src={profilePictureUrl} 
                  alt={`${userProfile?.name || currentUser?.name || 'User'}'s profile`}
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
                   currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <FaCheckCircle />
          <span>{success}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'resolutions' ? 'active' : ''}`}
          onClick={() => setActiveTab('resolutions')}
        >
          <FaTasks />
          <span>Assigned Resolutions ({resolutions.length})</span>
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FaFileAlt />
          <span>My Reports ({reports.length})</span>
        </button>
        <button 
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <FaBell />
          <span>Notifications ({notifications.length})</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {activeTab === 'resolutions' && (
          <div className="resolutions-tab">
            <div className="tab-header">
              <h2>Assigned Resolutions</h2>
              <p>Manage and report on your assigned resolution tasks</p>
            </div>
            
            {resolutions.length === 0 ? (
              <div className="empty-state">
                <FaTasks className="empty-icon" />
                <h3>No Resolutions Assigned</h3>
                <p>You don't have any resolutions assigned to your subcommittee at this time.</p>
              </div>
            ) : (
              <div className="resolutions-grid">
                {resolutions.map(resolution => (
                  <div key={resolution.id} className="resolution-card">
                    <div className="resolution-header">
                      <h3>{resolution.title}</h3>
                      <span className={`status ${resolution.status?.toLowerCase() || 'assigned'}`}>
                        {resolution.status || 'ASSIGNED'}
                      </span>
                    </div>
                    <p className="resolution-description">{resolution.description}</p>
                    <div className="resolution-details">
                      <div className="detail">
                        <FaCalendarAlt />
                        <span>Created: {ChairService.formatDate(resolution.createdAt)}</span>
                      </div>
                      {resolution.assignments && resolution.assignments.length > 0 && (
                        <div className="detail">
                          <FaPercent />
                          <span>Your Contribution: {resolution.assignments.find(a => a.subcommittee?.id === currentUser.subcommitteeId)?.contributionPercentage || 0}%</span>
                        </div>
                      )}
                      {resolution.meeting && (
                        <div className="detail">
                          <FaBuilding />
                          <span>Meeting: {resolution.meeting.title}</span>
                        </div>
                      )}
                    </div>
                    <div className="resolution-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => openReportModal(resolution)}
                      >
                        <FaFileAlt />
                        Submit Report to HOD
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleResolutionDetailsView(resolution)}
                        disabled={resolutionDetailsLoading}
                      >
                        {resolutionDetailsLoading ? <FaSpinner className="spinner" /> : <FaEye />}
                        {resolutionDetailsLoading ? 'Loading...' : 'View Details'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-tab">
            <div className="tab-header">
              <h2>My Reports</h2>
              <p>Track your submitted reports and their status</p>
            </div>
            
            {reports.length === 0 ? (
              <div className="empty-state">
                <FaFileAlt className="empty-icon" />
                <h3>No Reports Submitted</h3>
                <p>You haven't submitted any reports yet. Submit your first report for an assigned resolution.</p>
              </div>
            ) : (
              <div className="reports-list">
                {reports.map(report => (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <h3>{report.resolution?.title || 'Unknown Resolution'}</h3>
                      <span className={`status ${report.status.toLowerCase()}`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="report-content">
                      <div className="report-details">
                        <div className="detail">
                          <FaPercent />
                          <span>Performance: {report.performancePercentage}%</span>
                        </div>
                        <div className="detail">
                          <FaClock />
                          <span>Submitted: {ChairService.formatDate(report.submittedAt)}</span>
                        </div>
                      </div>
                      <div className="report-text">
                        <div>
                          <strong>Progress:</strong> {report.progressDetails}
                        </div>
                        {report.hindrances && (
                          <div>
                            <strong>Hindrances:</strong> {report.hindrances}
                          </div>
                        )}
                      </div>
                      {report.hodComments && (
                        <div className="hod-comments">
                          <FaComment />
                          <strong>HOD Comments:</strong> {report.hodComments}
                        </div>
                      )}
                      {report.status === 'REJECTED_BY_HOD' && (
                        <div className="report-actions">
                          <button 
                            className="btn btn-warning"
                            onClick={() => openResubmitModal(report)}
                          >
                            <FaEdit />
                            Resubmit Report
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-tab">
            <div className="tab-header">
              <h2>Notifications</h2>
              <p>Stay updated with important messages and updates</p>
            </div>
            
            {notifications.length === 0 ? (
              <div className="empty-state">
                <FaBell className="empty-icon" />
                <h3>No Notifications</h3>
                <p>You're all caught up! No new notifications at this time.</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div key={notification.id} className="notification-card">
                    <div className="notification-icon">
                      {ChairService.getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      {notification.hodComments && (
                        <div className="notification-comments">
                          <strong>HOD Comments:</strong> {notification.hodComments}
                        </div>
                      )}
                      <span className="notification-time">
                        {ChairService.formatDate(notification.createdAt)}
                      </span>
                      {notification.type === 'REPORT_REJECTION' && notification.relatedEntityId && (
                        <div className="notification-actions">
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => {
                              // Find the rejected report and open resubmit modal
                              const rejectedReport = reports.find(r => r.id === notification.relatedEntityId);
                              if (rejectedReport) {
                                openResubmitModal(rejectedReport);
                              }
                            }}
                          >
                            <FaEdit />
                            Resubmit Report
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Submission Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Submit Report to HOD</h2>
              <button onClick={closeReportModal} className="close-btn">
                <FaTimes />
              </button>
            </div>
            <div className="modal-info">
              <div className="info-alert">
                <FaExclamationTriangle />
                <span>This report will be submitted directly to the Head of Delegation (HOD) for review.</span>
              </div>
            </div>
            <form onSubmit={handleReportSubmit}>
              <div className="form-group">
                <label>Resolution</label>
                <input 
                  type="text" 
                  value={selectedResolution?.title || ''} 
                  readOnly 
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Progress Details *</label>
                <textarea
                  value={reportForm.progressDetails}
                  onChange={(e) => setReportForm({...reportForm, progressDetails: e.target.value})}
                  placeholder="Describe the progress made on this resolution. Include specific achievements, milestones reached, and work completed..."
                  required
                  className="form-control"
                  rows="4"
                />
                <small className="form-help">Minimum 10 characters required</small>
              </div>
              <div className="form-group">
                <label>Hindrances (Optional)</label>
                <textarea
                  value={reportForm.hindrances}
                  onChange={(e) => setReportForm({...reportForm, hindrances: e.target.value})}
                  placeholder="Describe any challenges, obstacles, or hindrances encountered during implementation..."
                  className="form-control"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Performance Percentage *</label>
                <div className="percentage-input">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={reportForm.performancePercentage}
                    onChange={(e) => setReportForm({...reportForm, performancePercentage: parseInt(e.target.value) || 0})}
                    required
                    className="form-control"
                  />
                  <span className="percentage-symbol">%</span>
                </div>
                <small className="form-help">Rate your subcommittee's performance (0-100%)</small>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeReportModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? <FaSpinner className="spinner" /> : <FaSave />}
                  {submitting ? 'Submitting to HOD...' : 'Submit to HOD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Update Profile</h2>
              <button onClick={closeProfileModal} className="close-btn">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  className="form-control"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeProfileModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={updatingProfile} className="btn btn-primary">
                  {updatingProfile ? <FaSpinner className="spinner" /> : <FaSave />}
                  {updatingProfile ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Resubmission Modal */}
      {showResubmitModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Resubmit Report to HOD</h2>
              <button onClick={closeResubmitModal} className="close-btn">
                <FaTimes />
              </button>
            </div>
            <div className="modal-info">
              <div className="info-alert">
                <FaExclamationTriangle />
                <span>This report will be resubmitted directly to the Head of Delegation (HOD) for review.</span>
              </div>
            </div>
            <form onSubmit={handleReportResubmit}>
              <div className="form-group">
                <label>Resolution</label>
                <input 
                  type="text" 
                  value={selectedRejectedReport?.resolution?.title || ''} 
                  readOnly 
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Progress Details *</label>
                <textarea
                  value={resubmitForm.progressDetails}
                  onChange={(e) => setResubmitForm({...resubmitForm, progressDetails: e.target.value})}
                  placeholder="Describe the progress made on this resolution. Include specific achievements, milestones reached, and work completed..."
                  required
                  className="form-control"
                  rows="4"
                />
                <small className="form-help">Minimum 10 characters required</small>
              </div>
              <div className="form-group">
                <label>Hindrances (Optional)</label>
                <textarea
                  value={resubmitForm.hindrances}
                  onChange={(e) => setResubmitForm({...resubmitForm, hindrances: e.target.value})}
                  placeholder="Describe any challenges, obstacles, or hindrances encountered during implementation..."
                  className="form-control"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Performance Percentage *</label>
                <div className="percentage-input">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={resubmitForm.performancePercentage}
                    onChange={(e) => setResubmitForm({...resubmitForm, performancePercentage: parseInt(e.target.value) || 0})}
                    required
                    className="form-control"
                  />
                  <span className="percentage-symbol">%</span>
                </div>
                <small className="form-help">Rate your subcommittee's performance (0-100%)</small>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeResubmitModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={resubmitting} className="btn btn-primary">
                  {resubmitting ? <FaSpinner className="spinner" /> : <FaSave />}
                  {resubmitting ? 'Resubmitting to HOD...' : 'Resubmit to HOD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedChairDashboard;