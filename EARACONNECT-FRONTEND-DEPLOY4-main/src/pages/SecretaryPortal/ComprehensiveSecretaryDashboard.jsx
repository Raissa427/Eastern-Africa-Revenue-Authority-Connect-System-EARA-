import React, { useState, useEffect } from 'react';
import { 
  FaCalendarCheck, 
  FaFileAlt, 
  FaChartLine, 
  FaUsers, 
  FaEnvelope,
  FaCog,
  FaBell,
  FaEye,
  FaSpinner,
  FaClock,
  FaMapMarkerAlt,
  FaUserTie,
  FaBuilding,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import EnhancedMeetingInvitationManager from '../Meetings/EnhancedMeetingInvitationManager';
import EnhancedResolutionWorkflow from '../Resolutions/EnhancedResolutionWorkflow';
import './EnhancedSecretaryDashboard.css';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import ProfileService from '../../services/profileService';

const ComprehensiveSecretaryDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    upcomingMeetings: [],
    pendingResolutions: [],
    recentInvitations: [],
    statistics: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  // State for user profile data including profile picture
  const [userProfile, setUserProfile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch user profile and profile picture
  const fetchUserProfile = async () => {
    if (!user?.email) return;
    
    try {
      setLoadingProfile(true);
      
      // Fetch user profile from database
      const profileData = await ProfileService.getUserProfile(user.email);
      setUserProfile(profileData);
      
      // If profile has a profile picture, get the full URL
      if (profileData.profilePicture) {
        const fullPictureUrl = ProfileService.getFullProfilePictureUrl(profileData.profilePicture);
        setProfilePictureUrl(fullPictureUrl);
      }
    } catch (error) {
      console.warn('Failed to fetch user profile, using fallback data:', error);
      // Use fallback data from localStorage
      setUserProfile(user);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchUserProfile();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Try to fetch from API first, but provide fallback data if connection fails
      let meetings = [];
      let resolutions = [];
      let stats = {};

      try {
        const [meetingsRes, resolutionsRes, statsRes] = await Promise.all([
                  fetch(`${process.env.REACT_APP_BASE_URL}/meetings`),
        fetch(`${process.env.REACT_APP_BASE_URL}/resolutions`),
        fetch(`${process.env.REACT_APP_BASE_URL}/dashboard/secretary/stats?userId=1`)
        ]);

        meetings = meetingsRes.ok ? await meetingsRes.json() : [];
        resolutions = resolutionsRes.ok ? await resolutionsRes.json() : [];
        stats = statsRes.ok ? await statsRes.json() : {};
      } catch (apiError) {
        console.warn('API connection failed, using fallback data:', apiError.message);
        setIsOfflineMode(true);
        
        // Provide mock data when API is not available
        meetings = [
          {
            id: 1,
            title: "Monthly Committee Review",
            meetingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Conference Room A",
            status: "SCHEDULED",
            description: "Review of monthly committee activities and upcoming initiatives."
          },
          {
            id: 2,
            title: "Budget Planning Session",
            meetingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Main Hall",
            status: "DRAFT",
            description: "Planning session for next quarter's budget allocation."
          }
        ];

        resolutions = [
          {
            id: 1,
            title: "Infrastructure Development Initiative",
            description: "Proposal for upgrading the organization's technical infrastructure.",
            status: "ASSIGNED",
            assignedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            meeting: {
              title: "Monthly Committee Review",
              meetingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          },
          {
            id: 2,
            title: "Policy Update Framework",
            description: "Comprehensive review and update of organizational policies.",
            status: "IN_PROGRESS",
            assignedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            meeting: {
              title: "Policy Review Meeting",
              meetingDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            }
          }
        ];

        stats = {
          totalMeetings: 12,
          upcomingMeetings: 3,
          pendingResolutions: 5,
          completedTasks: 28,
          totalInvitationsSent: 156,
          responseRate: 87
        };
      }

      setDashboardData({
        upcomingMeetings: meetings.filter(m => 
          ['SCHEDULED', 'DRAFT'].includes(m.status) && 
          new Date(m.meetingDate) > new Date()
        ).slice(0, 5),
        pendingResolutions: resolutions.filter(r => 
          ['ASSIGNED', 'IN_PROGRESS'].includes(r.status)
        ).slice(0, 5),
        statistics: stats
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`nav-tab ${activeTab === id ? 'active' : ''}`}
    >
      <Icon />
      <span>{label}</span>
      {count !== undefined && (
        <span className="tab-count">
          {count}
        </span>
      )}
    </button>
  );

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="stat-card fade-in">
      <div className="stat-header">
        <div className="stat-icon-wrapper">
          <Icon className="stat-icon" />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
      {change && (
        <div className={`stat-change ${change.type === 'increase' ? 'positive' : 'negative'}`}>
          {change.type === 'increase' ? <FaArrowUp /> : <FaArrowDown />}
          {change.value}% from last month
        </div>
      )}
    </div>
  );

  const MeetingCard = ({ meeting }) => (
    <div className="item-card slide-in">
      <div className="item-header">
        <h4 className="item-title">{meeting.title}</h4>
        <span className={`item-status ${
          meeting.status === 'SCHEDULED' ? 'status-scheduled' : 'status-draft'
        }`}>
          {meeting.status}
        </span>
      </div>
      <div className="item-details">
        <div className="item-detail">
          <FaClock />
          {new Date(meeting.meetingDate).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
        <div className="item-detail">
          <FaMapMarkerAlt />
          {meeting.location}
        </div>
      </div>
    </div>
  );

  const ResolutionCard = ({ resolution }) => (
    <div className="item-card slide-in">
      <div className="item-header">
        <h4 className="item-title">{resolution.title}</h4>
        <span className={`item-status ${
          resolution.status === 'IN_PROGRESS' ? 'status-in-progress' : 'status-assigned'
        }`}>
          {resolution.status}
        </span>
      </div>
      <div className="item-details">
        <p>{resolution.description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading Secretary Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-secretary-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h1 className="main-title">Secretary Dashboard</h1>
            <p className="subtitle">East African Community Management System</p>
            {isOfflineMode && (
              <div className="offline-indicator">
                <FaBell style={{ color: '#f59e0b' }} />
                <span>Running in offline mode - Demo data displayed</span>
              </div>
            )}
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
                  alt={`${userProfile?.name || user?.name || 'User'}'s profile`}
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
                   user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <TabButton 
            id="overview" 
            label="Overview" 
            icon={FaChartLine}
          />
          <TabButton 
            id="meeting-invitations" 
            label="Send Invitations" 
            icon={FaEnvelope}
            count={dashboardData.upcomingMeetings.length}
          />
          <TabButton 
            id="resolution-assignment" 
            label="Task Assignment" 
            icon={FaFileAlt}
            count={dashboardData.pendingResolutions.length}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error">
            <FaBell />
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Statistics Cards */}
            <div className="stats-grid">
              <StatCard
                title="Upcoming Meetings"
                value={dashboardData.upcomingMeetings.length}
                icon={FaCalendarCheck}
                change={{ type: 'increase', value: 12 }}
              />
              <StatCard
                title="Pending Resolutions"
                value={dashboardData.pendingResolutions.length}
                icon={FaFileAlt}
                change={{ type: 'decrease', value: 5 }}
              />
              <StatCard
                title="Active Committees"
                value="24"
                icon={FaBuilding}
                change={{ type: 'increase', value: 3 }}
              />
              <StatCard
                title="Subcommittees"
                value="48"
                icon={FaUserTie}
                change={{ type: 'increase', value: 8 }}
              />
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
              <div className="section-header">
                <h2 className="section-title">Quick Actions</h2>
              </div>
              <div className="quick-actions-grid">
                <button 
                  onClick={() => setActiveTab('meeting-invitations')}
                  className="quick-action-card"
                >
                  <div className="quick-action-content">
                    <div className="quick-action-icon blue">
                      <FaEnvelope />
                    </div>
                    <div className="quick-action-text">
                      <h3>Send Meeting Invitations</h3>
                      <p>Invite committees and subcommittees</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('resolution-assignment')}
                  className="quick-action-card"
                >
                  <div className="quick-action-content">
                    <div className="quick-action-icon green">
                      <FaFileAlt />
                    </div>
                    <div className="quick-action-text">
                      <h3>Assign Tasks</h3>
                      <p>Distribute tasks to subcommittees</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="content-grid">
              {/* Upcoming Meetings */}
              <div className="content-section">
                <div className="content-section-header">
                  <h2 className="content-section-title">Upcoming Meetings</h2>
                  <button 
                    onClick={() => setActiveTab('meeting-invitations')}
                    className="view-all-btn"
                  >
                    View All
                  </button>
                </div>
                <div className="content-section-body">
                  {dashboardData.upcomingMeetings.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <FaCalendarCheck />
                      </div>
                      <p>No upcoming meetings</p>
                    </div>
                  ) : (
                    <div className="items-list">
                      {dashboardData.upcomingMeetings.map(meeting => (
                        <MeetingCard key={meeting.id} meeting={meeting} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="content-section">
                <div className="content-section-header">
                  <h2 className="content-section-title">Pending Tasks</h2>
                  <button 
                    onClick={() => setActiveTab('resolution-assignment')}
                    className="view-all-btn"
                  >
                    View All
                  </button>
                </div>
                <div className="content-section-body">
                  {dashboardData.pendingResolutions.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <FaFileAlt />
                      </div>
                      <p>No pending tasks</p>
                    </div>
                  ) : (
                    <div className="items-list">
                      {dashboardData.pendingResolutions.map(resolution => (
                        <ResolutionCard key={resolution.id} resolution={resolution} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'meeting-invitations' && (
          <EnhancedMeetingInvitationManager />
        )}

        {activeTab === 'resolution-assignment' && (
          <EnhancedResolutionWorkflow />
        )}

        {activeTab === 'committee-management' && (
          <div className="content-section">
            <div className="content-section-body">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FaUsers />
                </div>
                <h2>Committee Management</h2>
                <p>
                  This feature is coming soon. You'll be able to manage committee memberships, 
                  create new committees, and organize subcommittees.
                </p>
                <button className="item-action">
                  Request Early Access
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveSecretaryDashboard;