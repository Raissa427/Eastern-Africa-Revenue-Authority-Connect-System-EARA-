import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaUser, FaBell, FaFileAlt, FaChartLine, FaClock, FaExclamationTriangle, 
  FaCheckCircle, FaEye, FaEdit, FaSpinner, FaTasks, FaCalendarAlt,
  FaEnvelope, FaPhone, FaUserTie, FaBuilding, FaPercent, FaComment,
  FaTimes, FaCheck, FaFilter, FaClear, FaSearch, FaSort,
  FaChevronDown, FaChevronUp, FaThumbsUp, FaThumbsDown, FaHistory,
  FaArrowUp, FaArrowDown, FaArrowRight, FaLock, FaUsers, FaMapMarkerAlt,
  FaPlay, FaPause, FaStop, FaCalendarCheck, FaHandPaper, FaQuestionCircle,
  FaInfoCircle
} from 'react-icons/fa';
import MemberService from '../services/memberService';
import AuthService from '../services/authService';
import ProfileService from '../services/profileService';
import './MemberDashboard.css';
import { useNavigate } from 'react-router-dom';

const EnhancedMemberDashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [subMembers, setSubMembers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    assignedTasks: 0,
    completedTasks: 0,
    upcomingMeetings: 0,
    unreadNotifications: 0,
    subcommitteePerformance: 0,
    myContributions: [],
    recentTasks: []
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter state
  const [notificationFilter, setNotificationFilter] = useState('all');

  // Profile editing state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Meeting response state
  const [respondingToMeeting, setRespondingToMeeting] = useState(null);

  // State for user profile data including profile picture
  const [userProfile, setUserProfile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Get actual authenticated user from AuthService
  const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());

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
      // Use fallback data from currentUser
      setUserProfile(currentUser);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      console.log('🔄 EnhancedMemberDashboard: User authenticated, initializing dashboard');
      initializeDashboard();
      fetchUserProfile();
    } else {
      console.warn('⚠️ EnhancedMemberDashboard: No authenticated user found');
    }
    
    // Set up polling intervals
    const notificationInterval = setInterval(() => {
      if (currentUser?.id) {
        fetchNotifications();
      }
    }, 30000);

    const statsInterval = setInterval(() => {
      if (currentUser?.id) {
        fetchDashboardStats();
      }
    }, 300000);

    return () => {
      clearInterval(notificationInterval);
      clearInterval(statsInterval);
    };
  }, [currentUser?.id]);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUserProfile(),
        fetchTasks(),
        fetchNotifications(),
        fetchMeetings(),
        fetchDashboardStats(),
        fetchSubMembers()
      ]);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (!currentUser?.id) return;
    
    try {
      // Get user profile to get subcommitteeId
      const userProfile = await ProfileService.getUserProfile(currentUser.email);
      const subcommitteeId = userProfile?.subcommitteeId || userProfile?.subcommittee?.id;
      
      if (!subcommitteeId) {
        console.warn('No subcommittee ID found for user');
        setTasks([]);
        return;
      }
      
      const tasksData = await MemberService.getAssignedTasks(subcommitteeId);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      const [notificationsData, unreadCountData] = await Promise.all([
        MemberService.getNotifications(currentUser.id),
        MemberService.getUnreadCount(currentUser.id)
      ]);
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [currentUser?.id]);

  const fetchMeetings = async () => {
    if (!currentUser?.id) return;
    
    try {
      // Get user profile to get subcommitteeId
      const userProfile = await ProfileService.getUserProfile(currentUser.email);
      const subcommitteeId = userProfile?.subcommitteeId || userProfile?.subcommittee?.id;
      
      if (!subcommitteeId) {
        console.warn('No subcommittee ID found for user');
        setMeetings([]);
        return;
      }
      
      // Fetch both meeting invitations and all meetings for the subcommittee
      const [invitationsData, allMeetingsData] = await Promise.all([
        MemberService.getMeetingInvitations(currentUser.id),
        MemberService.getAllMeetings(subcommitteeId)
      ]);
      
      // Combine and deduplicate meetings
      const allMeetings = [...invitationsData];
      
      // Add meetings that are not in invitations
      allMeetingsData.forEach(meeting => {
        const exists = allMeetings.find(inv => inv.meeting?.id === meeting.id);
        if (!exists) {
          allMeetings.push({
            id: `meeting-${meeting.id}`,
            meeting: meeting,
            status: 'NO_INVITATION',
            respondedAt: null
          });
        }
      });
      
      setMeetings(allMeetings);
      console.log('Combined meetings data:', allMeetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMeetings([]);
    }
  };

  const fetchDashboardStats = async () => {
    if (!currentUser?.id) return;
    
    try {
      // Get user profile to get subcommitteeId
      const userProfile = await ProfileService.getUserProfile(currentUser.email);
      const subcommitteeId = userProfile?.subcommitteeId || userProfile?.subcommittee?.id;
      
      if (!subcommitteeId) {
        console.warn('No subcommittee ID found for user');
        setDashboardStats({
          assignedTasks: 0,
          completedTasks: 0,
          upcomingMeetings: 0,
          unreadNotifications: 0,
          subcommitteePerformance: 0,
          myContributions: [],
          recentTasks: []
        });
        return;
      }
      
      const stats = await MemberService.getDashboardStats(currentUser.id, subcommitteeId);
      // Ensure stats has proper structure with defaults
      const safeStats = {
        assignedTasks: stats.assignedTasks || 0,
        completedTasks: stats.completedTasks || 0,
        upcomingMeetings: stats.upcomingMeetings || 0,
        unreadNotifications: stats.unreadNotifications || 0,
        subcommitteePerformance: stats.subcommitteePerformance || 0,
        myContributions: Array.isArray(stats.myContributions) ? stats.myContributions : [],
        recentTasks: Array.isArray(stats.recentTasks) ? stats.recentTasks : []
      };
      setDashboardStats(safeStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set fallback stats in case of error
      setDashboardStats({
        assignedTasks: 0,
        completedTasks: 0,
        upcomingMeetings: 0,
        unreadNotifications: 0,
        subcommitteePerformance: 0,
        myContributions: [],
        recentTasks: []
      });
    }
  };

  const fetchSubMembers = async () => {
    if (!currentUser?.id) return;
    
    try {
      // Get user profile to get subcommitteeId
      const userProfile = await ProfileService.getUserProfile(currentUser.email);
      const subcommitteeId = userProfile?.subcommitteeId || userProfile?.subcommittee?.id;
      
      if (!subcommitteeId) {
        console.warn('No subcommittee ID found for user');
        setSubMembers([]);
        return;
      }
      
      const subMembersData = await MemberService.getSubCommitteeMembers(subcommitteeId);
      setSubMembers(subMembersData);
      console.log('Fetched sub-members data:', subMembersData);
    } catch (error) {
      console.error('Error fetching sub-members:', error);
      setSubMembers([]);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setError('');

    try {
      await MemberService.updateProfile(currentUser.email, profileForm);
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
        await MemberService.markNotificationAsRead(notification.id);
        await fetchNotifications();
      }
      
      // Handle different notification types
      if (notification.type === 'TASK_ASSIGNMENT') {
        setActiveTab('tasks');
      } else if (notification.type === 'MEETING_INVITATION') {
        setActiveTab('meetings');
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMeetingResponse = async (invitationId, response) => {
    try {
      setRespondingToMeeting(invitationId);
      await MemberService.respondToInvitation(invitationId, response, '');
      setSuccess(`Meeting invitation ${response.toLowerCase()}!`);
      await fetchMeetings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to respond to meeting invitation');
      setTimeout(() => setError(''), 3000);
    } finally {
      setRespondingToMeeting(null);
    }
  };

  const getFilteredNotifications = () => {
    if (notificationFilter === 'all') return notifications;
    if (notificationFilter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === notificationFilter);
  };

  const getTaskPriorityClass = (task) => {
    return task.priority ? `${task.priority}-priority` : '';
  };

  const getDeadlineBadgeClass = (deadline) => {
    const urgency = MemberService.getDeadlineUrgency(deadline);
    return `deadline-badge ${urgency}`;
  };

  const getTaskProgress = (task) => {
    return MemberService.getTaskProgress(task);
  };

  const handleViewMember = (member) => {
    console.log('Viewing member details:', member);
    // TODO: Implement member detail view modal
    setSuccess(`Viewing details for ${member.name}`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleContactMember = (member) => {
    console.log('Contacting member:', member);
    // TODO: Implement contact functionality
    setSuccess(`Contacting ${member.name}`);
    setTimeout(() => setSuccess(''), 3000);
  };

  if (!currentUser?.id) {
    return (
      <div className="member-dashboard">
        <div className="loading-container">
          <div className="error-message">
            <h2>Authentication Required</h2>
            <p>Please log in to access the Sub-Committee Member dashboard.</p>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="member-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="member-dashboard">
      <div className="member-container">
        {/* Header */}
        <div className="member-header">
          <div className="member-title-section">
            <div className="member-icon">
              <FaUsers />
            </div>
            <div>
              <h1 className="member-title">Subcommittee Member</h1>
              <p className="member-subtitle">
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
              <div className="stat-icon tasks">
                <FaTasks />
              </div>
              <div className="stat-info">
                <p className="stat-label">Assigned Tasks</p>
                <p className="stat-value">{dashboardStats.assignedTasks}</p>
                <p className="stat-trend">
                  {dashboardStats.completedTasks} completed
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon meetings">
                <FaCalendarAlt />
              </div>
              <div className="stat-info">
                <p className="stat-label">Upcoming Meetings</p>
                <p className="stat-value">{dashboardStats.upcomingMeetings}</p>
                <p className="stat-trend">
                  This month
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
                <p className="stat-label">Unread Notifications</p>
                <p className="stat-value">{unreadCount}</p>
                <p className="stat-trend">
                  Requires attention
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon performance">
                <FaChartLine />
              </div>
              <div className="stat-info">
                <p className="stat-label">Subcommittee Performance</p>
                <p className="stat-value">{dashboardStats.subcommitteePerformance}%</p>
                <p className="stat-trend">
                  Team average
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="member-main-content">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              <FaTasks />
              My Tasks
            </button>
            <button
              className={`tab-button ${activeTab === 'meetings' ? 'active' : ''}`}
              onClick={() => setActiveTab('meetings')}
            >
              <FaCalendarAlt />
              Meetings
            </button>
            <button
              className={`tab-button ${activeTab === 'sub-members' ? 'active' : ''}`}
              onClick={() => setActiveTab('sub-members')}
            >
              <FaUsers />
              Sub-Members
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
            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div>
                {tasks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaTasks />
                    </div>
                    <h3 className="empty-state-title">No Tasks Assigned</h3>
                    <p className="empty-state-description">
                      You don't have any tasks assigned to your subcommittee yet.
                    </p>
                  </div>
                ) : (
                  <div className="tasks-grid">
                    {tasks.map(task => (
                      <div key={task.id} className={`task-card ${getTaskPriorityClass(task)}`}>
                        <div className="task-header">
                          <div>
                            <h3 className="task-title">{task.title}</h3>
                            <div className="task-meta">
                              <span>Assigned: {MemberService.formatDate(task.assignedDate)}</span>
                              <span>Duration: {MemberService.formatTaskDuration(task.assignedDate, task.deadline)}</span>
                            </div>
                          </div>
                          <span className={`task-status ${task.status.toLowerCase().replace('_', '-')}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>

                        <p className="task-description">{task.description}</p>

                        <div className="task-progress">
                          <div className="progress-label">
                            <span>Progress</span>
                            <span>{getTaskProgress(task)}%</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${getTaskProgress(task)}%` }}
                            />
                          </div>
                        </div>

                        <div className="task-deadline">
                          <FaClock className="deadline-icon" />
                          <div className="deadline-info">
                            <p className="deadline-date">
                              Due: {MemberService.formatDate(task.deadline)}
                            </p>
                            <p className="deadline-days">
                              {MemberService.getDaysUntilDeadline(task.deadline) > 0 
                                ? `${MemberService.getDaysUntilDeadline(task.deadline)} days remaining`
                                : 'Overdue'
                              }
                            </p>
                          </div>
                          <span className={getDeadlineBadgeClass(task.deadline)}>
                            {MemberService.getDeadlineUrgency(task.deadline)}
                          </span>
                        </div>

                        <div className="task-contribution">
                          <div className="contribution-circle">
                            {task.contributionPercentage}%
                          </div>
                          <div className="contribution-info">
                            <p className="contribution-label">Your Contribution</p>
                            <p className="contribution-description">
                              Responsibility share for this resolution
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Meetings Tab */}
            {activeTab === 'meetings' && (
              <div>
                {meetings.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaCalendarAlt />
                    </div>
                    <h3 className="empty-state-title">No Meeting Invitations</h3>
                    <p className="empty-state-description">
                      You don't have any meeting invitations at this time.
                    </p>
                  </div>
                ) : (
                  <div className="meetings-grid">
                    {meetings.map(meeting => (
                      <div key={meeting.id} className="meeting-card">
                        <div className="meeting-header">
                          <div>
                            <h3 className="meeting-title">{meeting.meeting.title}</h3>
                            <p className="meeting-organizer">Organized by: {meeting.meeting.organizer}</p>
                          </div>
                          <span className={`meeting-status ${meeting.status.toLowerCase().replace('_', '-')}`}>
                            {meeting.status === 'NO_INVITATION' ? 'SCHEDULED' : meeting.status}
                          </span>
                        </div>

                        <div className="meeting-details">
                          <div className="meeting-detail">
                            <FaCalendarAlt />
                            <span>{MemberService.formatDate(meeting.meeting.meetingDate)}</span>
                          </div>
                          <div className="meeting-detail">
                            <FaMapMarkerAlt />
                            <span>{meeting.meeting.location}</span>
                          </div>
                        </div>

                        {meeting.meeting.description && (
                          <div className="meeting-description">
                            {meeting.meeting.description}
                          </div>
                        )}

                        {meeting.status === 'PENDING' && (
                          <div className="meeting-actions">
                            <button
                              className="btn-primary btn-accept"
                              onClick={() => handleMeetingResponse(meeting.id, 'ACCEPTED')}
                              disabled={respondingToMeeting === meeting.id}
                            >
                              {respondingToMeeting === meeting.id ? (
                                <FaSpinner className="loading-spinner" />
                              ) : (
                                <FaCheck />
                              )}
                              Accept
                            </button>
                            <button
                              className="btn-secondary"
                              onClick={() => handleMeetingResponse(meeting.id, 'MAYBE')}
                              disabled={respondingToMeeting === meeting.id}
                            >
                              <FaQuestionCircle />
                              Maybe
                            </button>
                            <button
                              className="btn-primary btn-decline"
                              onClick={() => handleMeetingResponse(meeting.id, 'DECLINED')}
                              disabled={respondingToMeeting === meeting.id}
                            >
                              <FaTimes />
                              Decline
                            </button>
                          </div>
                        )}

                        {meeting.status === 'NO_INVITATION' && (
                          <div className="meeting-actions">
                            <div className="alert alert-info">
                              <FaInfoCircle />
                              Meeting scheduled for your subcommittee
                            </div>
                          </div>
                        )}

                        {meeting.status !== 'PENDING' && meeting.respondedAt && (
                          <div className="meeting-actions">
                            <div className="alert alert-info">
                              <FaCheckCircle />
                              Responded on {MemberService.formatDate(meeting.respondedAt)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                            )}
          </div>
        )}

        {/* Sub-Members Tab */}
        {activeTab === 'sub-members' && (
          <div>
            <div className="sub-members-header">
              <h2 className="sub-members-title">
                <FaUsers className="sub-members-icon" />
                Subcommittee Members
              </h2>
              <p className="sub-members-subtitle">
                View all members of your subcommittee and their associated information
              </p>
            </div>

            {subMembers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FaUsers />
                </div>
                <h3 className="empty-state-title">No Subcommittee Members Found</h3>
                <p className="empty-state-description">
                  There are currently no members assigned to this subcommittee.
                </p>
              </div>
            ) : (
              <div className="sub-members-container">
                <div className="sub-members-summary">
                  <div className="summary-card">
                    <div className="summary-icon">
                      <FaUsers />
                    </div>
                    <div className="summary-content">
                      <h3>Total Members</h3>
                      <p className="summary-number">{subMembers.length}</p>
                    </div>
                  </div>
                </div>

                <div className="sub-members-table-container">
                  <table className="sub-members-table">
                    <thead>
                      <tr>
                        <th className="member-name-header">Member Name</th>
                        <th className="member-role-header">Role</th>
                        <th className="member-number-header">Member ID</th>
                        <th className="member-status-header">Status</th>
                        <th className="member-actions-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subMembers.map((member, index) => (
                        <tr key={member.id || index} className="member-row">
                          <td className="member-name">
                            <div className="member-info">
                              <div className="member-avatar">
                                {member.profilePicture ? (
                                  <img 
                                    src={member.profilePicture} 
                                    alt={`${member.name}'s profile`}
                                    className="member-avatar-image"
                                  />
                                ) : (
                                  <div className="member-avatar-placeholder">
                                    {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                                  </div>
                                )}
                              </div>
                              <div className="member-details">
                                <span className="member-full-name">{member.name || 'Unknown Member'}</span>
                                <span className="member-email">{member.email || 'No email'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="member-role">
                            <span className={`role-badge ${(member.role || 'MEMBER').toLowerCase()}`}>
                              {member.role || 'MEMBER'}
                            </span>
                          </td>
                          <td className="member-number">
                            <span className="member-id-number">{member.id || 'N/A'}</span>
                          </td>
                          <td className="member-status">
                            <span className={`status-badge ${(member.status || 'ACTIVE').toLowerCase()}`}>
                              {member.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="member-actions">
                            <button 
                              className="btn-action btn-view"
                              title="View member details"
                              onClick={() => handleViewMember(member)}
                            >
                              <FaEye />
                            </button>
                            <button 
                              className="btn-action btn-contact"
                              title="Contact member"
                              onClick={() => handleContactMember(member)}
                            >
                              <FaEnvelope />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                {/* Filter Bar */}
                <div className="filter-bar">
                  <div className="filter-group">
                    <label className="filter-label">Filter by Type</label>
                    <select
                      className="filter-select"
                      value={notificationFilter}
                      onChange={(e) => setNotificationFilter(e.target.value)}
                    >
                      <option value="all">All Notifications</option>
                      <option value="unread">Unread Only</option>
                      <option value="TASK_ASSIGNMENT">Task Assignments</option>
                      <option value="MEETING_INVITATION">Meeting Invitations</option>
                    </select>
                  </div>

                  <div className="filter-actions">
                    <button 
                      className="btn-clear"
                      onClick={() => MemberService.markAllNotificationsAsRead(currentUser.id).then(fetchNotifications)}
                    >
                      <FaCheck />
                      Mark All Read
                    </button>
                  </div>
                </div>

                {getFilteredNotifications().length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaBell />
                    </div>
                    <h3 className="empty-state-title">No Notifications</h3>
                    <p className="empty-state-description">
                      {notificationFilter === 'all' 
                        ? "You don't have any notifications at this time."
                        : `No ${notificationFilter.replace('_', ' ').toLowerCase()} notifications found.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="notifications-list">
                    {getFilteredNotifications().map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="notification-header">
                          <h4 className="notification-title">
                            {MemberService.getNotificationIcon(notification.type)}
                            {notification.title}
                          </h4>
                          <span className="notification-time">
                            {MemberService.formatDate(notification.createdAt)}
                          </span>
                        </div>
                        
                        <p className="notification-message">{notification.message}</p>
                        
                        <div className="notification-actions">
                          {notification.type === 'TASK_ASSIGNMENT' && notification.resolution && (
                            <button 
                              className="btn-notification btn-view-task"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('tasks');
                              }}
                            >
                              <FaEye />
                              View Task ({notification.resolution.contributionPercentage}% contribution)
                            </button>
                          )}
                          
                          {notification.type === 'MEETING_INVITATION' && notification.meeting && (
                            <>
                              <button 
                                className="btn-notification btn-accept-meeting"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTab('meetings');
                                }}
                              >
                                <FaCalendarAlt />
                                View Meeting
                              </button>
                            </>
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
                    value={user?.role || 'SUBCOMMITTEE_MEMBER'}
                    disabled
                  />
                  <p className="readonly-notice">
                    <FaLock />
                    Role cannot be changed. Contact your administrator if needed.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Subcommittee</label>
                  <input
                    type="text"
                    className="form-input"
                    value={user?.subcommittee?.name || ''}
                    disabled
                  />
                  <p className="readonly-notice">
                    <FaLock />
                    Subcommittee assignment is managed by administrators.
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

export default EnhancedMemberDashboard;
