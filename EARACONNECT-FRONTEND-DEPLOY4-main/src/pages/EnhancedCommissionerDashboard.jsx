import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaUser, FaBell, FaFileAlt, FaChartLine, FaClock, FaExclamationTriangle, 
  FaCheckCircle, FaEye, FaEdit, FaSpinner, FaTasks, FaCalendarAlt,
  FaEnvelope, FaPhone, FaUserTie, FaBuilding, FaPercent, FaComment,
  FaTimes, FaCheck, FaFilter, FaClear, FaSearch, FaSort,
  FaChevronDown, FaChevronUp, FaThumbsUp, FaThumbsDown, FaHistory,
  FaArrowUp, FaArrowDown, FaArrowRight, FaLock, FaUsers, FaCrown,
  FaChartBar, FaChartPie, FaStar, FaAward, FaTrophy
} from 'react-icons/fa';
import CommissionerService from '../services/commissionerService';
import AuthService from '../services/authService';
import ProfileService from '../services/profileService';
import './CommissionerDashboard.css';
import { useNavigate } from 'react-router-dom';

const EnhancedCommissionerDashboard = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalReports: 0,
    averagePerformance: 0,
    pendingReview: 0,
    approvedReports: 0,
    rejectedReports: 0,
    completedResolutions: 0,
    activeResolutions: 0,
    statusCounts: {},
    subcommitteePerformance: [],
    monthlyTrends: [],
    resolutionProgress: []
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter state
  const [filters, setFilters] = useState({
    status: 'APPROVED_BY_HOD', // Default to pending reviews
    subcommitteeId: '',
    resolutionId: '',
    searchTerm: ''
  });

  // Report review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    approved: null,
    commissionerComments: ''
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

  // Expanded report text state
  const [expandedReports, setExpandedReports] = useState(new Set());

  // State for user profile data including profile picture
  const [userProfile, setUserProfile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Mock user data for demonstration
  const currentUser = {
    id: 1,
    email: "commissioner@eara.org",
    name: "Commissioner General",
    profilePicture: null // In a real app, this would be a URL
  };

  const navigate = useNavigate();

  // Fetch user profile and profile picture
  const fetchUserProfile = async () => {
    if (!currentUser?.email) return;
    
    try {
      setLoadingProfile(true);
      
      // Fetch user profile from database
      const profileData = await ProfileService.getUserProfile(currentUser.email);
      setUserProfile(profileData);
      
      // If profile has a profile picture, get the full URL
      if (profileData.profilePicture) {
        const fullPictureUrl = ProfileService.getFullProfilePictureUrl(profileData.profilePicture);
        setProfilePictureUrl(fullPictureUrl);
      }
    } catch (error) {
      console.warn('Failed to fetch user profile, using fallback data:', error);
      // Use fallback data from localStorage
      setUserProfile(currentUser);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    initializeDashboard();
    fetchUserProfile();
    
    // Set up polling intervals
    const notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    const reportsInterval = setInterval(() => {
      fetchReports();
    }, 120000);

    const statsInterval = setInterval(() => {
      fetchDashboardStats();
    }, 300000);

    return () => {
      clearInterval(notificationInterval);
      clearInterval(reportsInterval);
      clearInterval(statsInterval);
    };
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUserProfile(),
        fetchReports(),
        fetchNotifications(),
        fetchDashboardStats()
      ]);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };



  const fetchReports = async () => {
    try {
      const reportsData = await CommissionerService.getAllReports();
      setAllReports(reportsData);
      applyFilters(reportsData, filters);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const [notificationsData, unreadCountData] = await Promise.all([
        CommissionerService.getNotifications(currentUser.id),
        CommissionerService.getUnreadCount(currentUser.id)
      ]);
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [currentUser.id]);

  const fetchDashboardStats = async () => {
    try {
      const stats = await CommissionerService.getDashboardStats(currentUser.id);
      // Ensure stats has proper structure with defaults
      const safeStats = {
        totalReports: stats.totalReports || 0,
        averagePerformance: stats.averagePerformance || 0,
        pendingReview: stats.pendingReview || 0,
        approvedReports: stats.approvedReports || 0,
        rejectedReports: stats.rejectedReports || 0,
        completedResolutions: stats.completedResolutions || 0,
        activeResolutions: stats.activeResolutions || 0,
        statusCounts: stats.statusCounts || {},
        subcommitteePerformance: Array.isArray(stats.subcommitteePerformance) ? stats.subcommitteePerformance : [],
        monthlyTrends: Array.isArray(stats.monthlyTrends) ? stats.monthlyTrends : [],
        resolutionProgress: Array.isArray(stats.resolutionProgress) ? stats.resolutionProgress : []
      };
      setDashboardStats(safeStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set fallback stats in case of error
      setDashboardStats({
        totalReports: 0,
        averagePerformance: 0,
        pendingReview: 0,
        approvedReports: 0,
        rejectedReports: 0,
        completedResolutions: 0,
        activeResolutions: 0,
        statusCounts: {},
        subcommitteePerformance: [],
        monthlyTrends: [],
        resolutionProgress: []
      });
    }
  };

  const applyFilters = (reportsData, currentFilters) => {
    const filtered = CommissionerService.filterReports(reportsData, currentFilters);
    const sorted = CommissionerService.sortReports(filtered, 'hodReviewedAt', 'desc');
    setReports(sorted);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(allReports, newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      status: '',
      subcommitteeId: '',
      resolutionId: '',
      searchTerm: ''
    };
    setFilters(emptyFilters);
    applyFilters(allReports, emptyFilters);
  };

  const openReviewModal = (report) => {
    setSelectedReport(report);
    setShowReviewModal(true);
    setReviewForm({
      approved: null,
      commissionerComments: ''
    });
    setError('');
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedReport(null);
    setReviewForm({
      approved: null,
      commissionerComments: ''
    });
    setError('');
  };

  const handleReportReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (reviewForm.approved === null) {
        setError('Please select approve or reject');
        return;
      }

      await CommissionerService.reviewReport(
        selectedReport.id,
        reviewForm.approved,
        reviewForm.commissionerComments
      );

      const action = reviewForm.approved ? 'approved' : 'rejected';
      setSuccess(`Report ${action} successfully!`);
      
      closeReviewModal();
      await Promise.all([fetchReports(), fetchNotifications(), fetchDashboardStats()]);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to review report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAction = async (reportId, approved) => {
    try {
      setSubmitting(true);
      await CommissionerService.reviewReport(reportId, approved, '');
      
      const action = approved ? 'approved' : 'rejected';
      setSuccess(`Report ${action} successfully!`);
      
      await Promise.all([fetchReports(), fetchNotifications(), fetchDashboardStats()]);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to process quick action');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setError('');

    try {
      await CommissionerService.updateProfile(currentUser.email, profileForm);
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

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await CommissionerService.markNotificationAsRead(notification.id);
        await fetchNotifications();
      }
      
      // Handle different notification types
      if (notification.type === 'REPORT_APPROVAL') {
        setActiveTab('reports');
        if (notification.relatedEntityId) {
          const report = allReports.find(r => r.id === notification.relatedEntityId);
          if (report) {
            openReviewModal(report);
          }
        }
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const toggleReportExpansion = (reportId) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  const getReportPriorityClass = (report) => {
    const priority = CommissionerService.getReportPriority(
      report.performancePercentage, 
      report.hodReviewedAt
    );
    return priority === 'high' || priority === 'urgent' ? `${priority}-priority` : '';
  };

  const getUniqueSubcommittees = () => {
    const subcommittees = new Map();
    allReports.forEach(report => {
      if (report.subcommittee) {
        subcommittees.set(report.subcommittee.id, report.subcommittee);
      }
    });
    return Array.from(subcommittees.values());
  };

  const getUniqueResolutions = () => {
    const resolutions = new Map();
    allReports.forEach(report => {
      if (report.resolution) {
        resolutions.set(report.resolution.id, report.resolution);
      }
    });
    return Array.from(resolutions.values());
  };

  if (loading) {
    return (
      <div className="commissioner-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="commissioner-dashboard">
      <div className="commissioner-container">
        {/* Header */}
        <div className="commissioner-header">
          <div className="commissioner-title-section">
            <div className="commissioner-icon">
              <FaCrown />
            </div>
            <div>
              <h1 className="commissioner-title">Commissioner General</h1>
              <p className="commissioner-subtitle">
                {user?.name} • Strategic Oversight
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
              <div className="stat-icon pending">
                <FaClock />
              </div>
              <div className="stat-info">
                <p className="stat-label">Pending Review</p>
                <p className="stat-value">{dashboardStats.pendingReview}</p>
                <p className="stat-trend">
                  Awaiting your decision
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon approved">
                <FaCheckCircle />
              </div>
              <div className="stat-info">
                <p className="stat-label">Approved Reports</p>
                <p className="stat-value">{dashboardStats.approvedReports}</p>
                <p className="stat-trend trend-up">
                  <FaArrowUp />
                  {CommissionerService.calculateCompletionRate(
                    dashboardStats.approvedReports,
                    dashboardStats.totalReports
                  )}% approval rate
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon performance">
                <FaTrophy />
              </div>
              <div className="stat-info">
                <p className="stat-label">Avg Performance</p>
                <p className="stat-value">{dashboardStats.averagePerformance}%</p>
                <p className="stat-trend">
                  Organizational excellence
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon reports">
                <FaFileAlt />
              </div>
              <div className="stat-info">
                <p className="stat-label">Total Reports</p>
                <p className="stat-value">{dashboardStats.totalReports}</p>
                <p className="stat-trend">
                  {dashboardStats.activeResolutions} active resolutions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="commissioner-main-content">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <FaFileAlt />
              Report Reviews
            </button>
            <button
              className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FaChartLine />
              Performance Dashboard
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
            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                {/* Filter Bar */}
                <div className="filter-bar">
                  <div className="filter-group">
                    <label className="filter-label">Status</label>
                    <select
                      className="filter-select"
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="APPROVED_BY_HOD">Pending Review</option>
                      <option value="APPROVED_BY_COMMISSIONER">Approved</option>
                      <option value="REJECTED_BY_COMMISSIONER">Rejected</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Subcommittee</label>
                    <select
                      className="filter-select"
                      value={filters.subcommitteeId}
                      onChange={(e) => handleFilterChange('subcommitteeId', parseInt(e.target.value) || '')}
                    >
                      <option value="">All Subcommittees</option>
                      {getUniqueSubcommittees().map(sub => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} ({sub.memberCount} members)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Resolution</label>
                    <select
                      className="filter-select"
                      value={filters.resolutionId}
                      onChange={(e) => handleFilterChange('resolutionId', parseInt(e.target.value) || '')}
                    >
                      <option value="">All Resolutions</option>
                      {getUniqueResolutions().map(res => (
                        <option key={res.id} value={res.id}>
                          {res.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Search</label>
                    <input
                      type="text"
                      className="filter-input"
                      placeholder="Search by title or chair..."
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    />
                  </div>

                  <div className="filter-actions">
                    <button className="btn-clear" onClick={clearFilters}>
                      <FaTimes />
                      Clear
                    </button>
                  </div>
                </div>

                {/* Reports Grid */}
                {reports.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaFileAlt />
                    </div>
                    <h3 className="empty-state-title">No Reports Found</h3>
                    <p className="empty-state-description">
                      {Object.values(filters).some(f => f) 
                        ? 'No reports match your current filters.' 
                        : 'No reports available for review at this time.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="reports-grid">
                    {reports.map(report => (
                      <div 
                        key={report.id} 
                        className={`report-card ${getReportPriorityClass(report)}`}
                      >
                        <div className="report-header">
                          <div>
                            <h3 className="report-title">{report.resolution.title}</h3>
                            <div className="report-meta">
                              <span>Chair: {report.submittedBy.name}</span>
                              <span>Subcommittee: {report.subcommittee.name}</span>
                              <span>HOD Approved: {CommissionerService.formatDate(report.hodReviewedAt)}</span>
                            </div>
                          </div>
                          <span className={CommissionerService.getStatusBadgeClass(report.status)}>
                            {report.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="report-content">
                          <div className="report-section">
                            <h5 className="report-section-title">Progress Details</h5>
                            <p className={`report-text ${expandedReports.has(report.id) ? 'expanded' : ''}`}>
                              {report.progressDetails}
                            </p>
                            {report.progressDetails.length > 200 && (
                              <button 
                                className="expand-btn"
                                onClick={() => toggleReportExpansion(report.id)}
                              >
                                {expandedReports.has(report.id) ? 'Show less' : 'Show more'}
                              </button>
                            )}
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
                            style={{
                              backgroundColor: CommissionerService.getPerformanceColor(report.performancePercentage)
                            }}
                          >
                            {report.performancePercentage}%
                          </div>
                          <div className="performance-info">
                            <h5 className="performance-label">Performance Rating</h5>
                            <p className="performance-description">Chair's self-assessment</p>
                          </div>
                        </div>

                        {report.hodComments && (
                          <div className="hod-comments">
                            <h5 className="hod-comments-title">
                              <FaComment />
                              HOD Comments
                            </h5>
                            <p className="hod-comments-text">{report.hodComments}</p>
                          </div>
                        )}

                        {report.commissionerComments && (
                          <div className="commissioner-comments">
                            <h5 className="commissioner-comments-title">
                              <FaCrown />
                              Your Comments
                            </h5>
                            <p className="commissioner-comments-text">{report.commissionerComments}</p>
                          </div>
                        )}

                        <div className="report-actions">
                          {report.status === 'APPROVED_BY_HOD' && (
                            <>
                              <button
                                className="btn-primary btn-approve"
                                onClick={() => handleQuickAction(report.id, true)}
                                disabled={submitting}
                              >
                                <FaCheck />
                                Quick Approve
                              </button>
                              <button
                                className="btn-primary btn-reject"
                                onClick={() => openReviewModal(report)}
                                disabled={submitting}
                              >
                                <FaTimes />
                                Review/Reject
                              </button>
                            </>
                          )}
                          <button
                            className="btn-secondary"
                            onClick={() => openReviewModal(report)}
                          >
                            <FaEye />
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="dashboard-grid">
                <div className="chart-card">
                  <h3 className="chart-title">
                    <FaChartBar />
                    Subcommittee Performance
                  </h3>
                  {Array.isArray(dashboardStats.subcommitteePerformance) && dashboardStats.subcommitteePerformance.length > 0 ? (
                    <table className="performance-table">
                      <thead>
                        <tr>
                          <th>Subcommittee</th>
                          <th>Avg Performance</th>
                          <th>Reports</th>
                          <th>Completion</th>
                          <th>Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardStats.subcommitteePerformance.map((sub, index) => (
                          <tr key={index}>
                            <td>{sub.name}</td>
                            <td className="performance-value">{sub.avgPerformance}%</td>
                            <td>{sub.totalReports}</td>
                            <td className="performance-value">{sub.completionRate}%</td>
                            <td>
                              <span className="trend-indicator">
                                {CommissionerService.getTrendIcon(sub.trend)}
                                <span className={sub.trend === 'up' ? 'trend-up' : sub.trend === 'down' ? 'trend-down' : ''}>
                                  {sub.trend}
                                </span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="chart-placeholder">
                      No performance data available
                    </div>
                  )}
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">
                    <FaChartPie />
                    Report Status Distribution
                  </h3>
                  <div className="chart-placeholder">
                    <div style={{ textAlign: 'left', padding: '2rem' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <strong>Approved by Commissioner:</strong> {dashboardStats.statusCounts['APPROVED_BY_COMMISSIONER'] || 0}
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <strong>Pending Review:</strong> {dashboardStats.statusCounts['APPROVED_BY_HOD'] || 0}
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <strong>Rejected:</strong> {dashboardStats.statusCounts['REJECTED_BY_COMMISSIONER'] || 0}
                      </div>
                      <div>
                        <strong>In Review:</strong> {dashboardStats.statusCounts['IN_REVIEW'] || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">
                    <FaTasks />
                    Resolution Progress
                  </h3>
                  {Array.isArray(dashboardStats.resolutionProgress) && dashboardStats.resolutionProgress.length > 0 ? (
                    <div style={{ padding: '1rem 0' }}>
                      {dashboardStats.resolutionProgress.map((resolution, index) => (
                        <div key={index} style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <strong>{resolution.title}</strong>
                            <span style={{ 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '12px', 
                              fontSize: '0.75rem',
                              background: resolution.status === 'Completed' ? '#dcfce7' : 
                                         resolution.status === 'On Track' ? '#dbeafe' : 
                                         resolution.status === 'At Risk' ? '#fef3c7' : '#fee2e2',
                              color: resolution.status === 'Completed' ? '#166534' : 
                                     resolution.status === 'On Track' ? '#1e40af' : 
                                     resolution.status === 'At Risk' ? '#92400e' : '#991b1b'
                            }}>
                              {resolution.status}
                            </span>
                          </div>
                          <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
                            <div 
                              style={{ 
                                width: `${resolution.progress}%`, 
                                background: CommissionerService.getPerformanceColor(resolution.progress),
                                height: '100%',
                                borderRadius: '4px',
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                            {resolution.progress}% Complete
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="chart-placeholder">
                      No resolution progress data available
                    </div>
                  )}
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">
                    <FaChartLine />
                    Monthly Trends
                  </h3>
                  {Array.isArray(dashboardStats.monthlyTrends) && dashboardStats.monthlyTrends.length > 0 ? (
                    <table className="performance-table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Approved</th>
                          <th>Rejected</th>
                          <th>Pending</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardStats.monthlyTrends.map((trend, index) => (
                          <tr key={index}>
                            <td>{trend.month}</td>
                            <td className="performance-value trend-up">{trend.approved}</td>
                            <td className="performance-value trend-down">{trend.rejected}</td>
                            <td className="performance-value">{trend.pending}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="chart-placeholder">
                      No monthly trend data available
                    </div>
                  )}
                </div>
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
                            {CommissionerService.getNotificationIcon(notification.type)}
                            {notification.title}
                          </h4>
                          <span className="notification-time">
                            {CommissionerService.formatDate(notification.createdAt)}
                          </span>
                        </div>
                        
                        <p className="notification-message">{notification.message}</p>
                        
                        {notification.type === 'REPORT_APPROVAL' && notification.report && (
                          <div className="notification-actions">
                            <button 
                              className="btn-notification btn-view-report"
                              onClick={(e) => {
                                e.stopPropagation();
                                const report = allReports.find(r => r.id === notification.relatedEntityId);
                                if (report) openReviewModal(report);
                              }}
                            >
                              <FaEye />
                              Review Report ({notification.report.performancePercentage}%)
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Report Review Modal */}
        {showReviewModal && selectedReport && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">Review Report</h3>
                  <p className="modal-subtitle">{selectedReport.resolution.title}</p>
                </div>
                <button className="close-btn" onClick={closeReviewModal}>
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body">
                <div className="detail-section">
                  <h4 className="detail-section-title">
                    <FaUser />
                    Report Information
                  </h4>
                  <div className="detail-content">
                    <p><strong>Chair:</strong> {selectedReport.submittedBy.name}</p>
                    <p><strong>Subcommittee:</strong> {selectedReport.subcommittee.name}</p>
                    <p><strong>Submitted:</strong> {CommissionerService.formatDate(selectedReport.submittedAt)}</p>
                    <p><strong>HOD Approved:</strong> {CommissionerService.formatDate(selectedReport.hodReviewedAt)}</p>
                    <p><strong>Performance:</strong> {selectedReport.performancePercentage}%</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="detail-section-title">
                    <FaFileAlt />
                    Progress Details
                  </h4>
                  <p className="detail-content">{selectedReport.progressDetails}</p>
                </div>

                {selectedReport.hindrances && (
                  <div className="detail-section">
                    <h4 className="detail-section-title">
                      <FaExclamationTriangle />
                      Hindrances
                    </h4>
                    <p className="detail-content">{selectedReport.hindrances}</p>
                  </div>
                )}

                {selectedReport.hodComments && (
                  <div className="detail-section">
                    <h4 className="detail-section-title">
                      <FaComment />
                      HOD Comments
                    </h4>
                    <p className="detail-content">{selectedReport.hodComments}</p>
                  </div>
                )}

                {selectedReport.status === 'APPROVED_BY_HOD' && (
                  <form onSubmit={handleReportReview} className="review-form">
                    <div className="form-group">
                      <label className="form-label">Your Decision</label>
                      <div className="decision-buttons">
                        <button
                          type="button"
                          className={`decision-btn ${reviewForm.approved === true ? 'active approve' : ''}`}
                          onClick={() => setReviewForm(prev => ({ ...prev, approved: true }))}
                        >
                          <FaCheck />
                          Approve
                        </button>
                        <button
                          type="button"
                          className={`decision-btn ${reviewForm.approved === false ? 'active reject' : ''}`}
                          onClick={() => setReviewForm(prev => ({ ...prev, approved: false }))}
                        >
                          <FaTimes />
                          Reject
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Comments {reviewForm.approved === false ? '(Required for rejection)' : '(Optional)'}
                      </label>
                      <textarea
                        className="form-textarea"
                        value={reviewForm.commissionerComments}
                        onChange={(e) => setReviewForm(prev => ({
                          ...prev,
                          commissionerComments: e.target.value
                        }))}
                        placeholder={reviewForm.approved === true 
                          ? "Add any commendations or additional comments..." 
                          : "Explain the reasons for rejection and provide guidance for improvement..."
                        }
                        required={reviewForm.approved === false}
                      />
                    </div>

                    <div className="modal-actions">
                      <button
                        type="button"
                        onClick={closeReviewModal}
                        className="btn-secondary"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={submitting || reviewForm.approved === null}
                      >
                        {submitting ? (
                          <>
                            <FaSpinner className="loading-spinner" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaCheck />
                            Submit Review
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Update Modal */}
        {showProfileModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">Update Profile</h3>
                  <p className="modal-subtitle">Edit your personal information</p>
                </div>
                <button className="close-btn" onClick={() => setShowProfileModal(false)}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleProfileUpdate} className="profile-form">
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
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    className="form-input"
                    value={user?.role || 'COMMISSIONER_GENERAL'}
                    disabled
                  />
                  <p className="readonly-notice">
                    <FaLock />
                    Role cannot be changed. This is set by system administrators.
                  </p>
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

export default EnhancedCommissionerDashboard;
