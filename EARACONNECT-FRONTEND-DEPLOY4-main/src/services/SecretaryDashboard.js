import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendar, FaEnvelope, FaFileAlt, FaUsers, FaClock, FaTasks, FaBell, FaChartLine } from 'react-icons/fa';
import { getSecretaryStats, getUpcomingMeetings, getPendingTasks, getRecentActivities, getNotificationStats } from '../../services/dashboardService';
import './Dashboard.css';

const SecretaryDashboard = () => {
  const [stats, setStats] = useState({
    totalMeetings: 0,
    upcomingMeetings: 0,
    pendingInvitations: 0,
    completedMinutes: 0,
    pendingResolutions: 0,
    totalInvitationsSent: 0
  });
  
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [notificationStats, setNotificationStats] = useState({ unread: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          await fetchDashboardData(parsedUser.id);
        }
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const fetchDashboardData = async (userId) => {
    try {
      const [
        secretaryStats,
        upcomingMeetingsData,
        pendingTasksData,
        recentActivitiesData,
        notificationStatsData
      ] = await Promise.all([
        getSecretaryStats(userId).catch(() => ({
          totalMeetings: 0,
          upcomingMeetings: 0,
          pendingInvitations: 0,
          completedMinutes: 0,
          pendingResolutions: 0,
          totalInvitationsSent: 0
        })),
        getUpcomingMeetings(userId).catch(() => []),
        getPendingTasks(userId).catch(() => []),
        getRecentActivities(userId).catch(() => []),
        getNotificationStats(userId).catch(() => ({ unread: 0, total: 0 }))
      ]);

      setStats(secretaryStats);
      setUpcomingMeetings(upcomingMeetingsData);
      setPendingTasks(pendingTasksData);
      setRecentActivities(recentActivitiesData);
      setNotificationStats(notificationStatsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Some dashboard data could not be loaded');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'MEETING_CREATED':
        return <FaCalendar className="activity-icon meeting" />;
      case 'INVITATION_SENT':
        return <FaEnvelope className="activity-icon invitation" />;
      case 'MINUTES_TAKEN':
        return <FaFileAlt className="activity-icon minutes" />;
      case 'RESOLUTION_CREATED':
        return <FaTasks className="activity-icon resolution" />;
      default:
        return <FaBell className="activity-icon general" />;
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Secretary Dashboard</h1>
        <p className="welcome-message">
          Welcome back, {user?.name || 'Secretary'}! Here's your overview.
        </p>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-icon">
            <FaCalendar />
          </div>
          <div className="card-content">
            <div className="card-number">{stats.totalMeetings}</div>
            <div className="card-label">Total Meetings</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <FaClock />
          </div>
          <div className="card-content">
            <div className="card-number">{stats.upcomingMeetings}</div>
            <div className="card-label">Upcoming Meetings</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <FaEnvelope />
          </div>
          <div className="card-content">
            <div className="card-number">{stats.pendingInvitations}</div>
            <div className="card-label">Pending Invitations</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <FaFileAlt />
          </div>
          <div className="card-content">
            <div className="card-number">{stats.completedMinutes}</div>
            <div className="card-label">Completed Minutes</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <FaTasks />
          </div>
          <div className="card-content">
            <div className="card-number">{stats.pendingResolutions}</div>
            <div className="card-label">Pending Resolutions</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <FaBell />
          </div>
          <div className="card-content">
            <div className="card-number">{notificationStats.unread}</div>
            <div className="card-label">Unread Notifications</div>
          </div>
        </div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="section-cards">
            <Link to="/meetings/create" className="section-card">
              <div className="card-icon">
                <FaCalendar />
              </div>
              <div className="card-content">
                <h3>Create Meeting</h3>
                <p>Schedule new Commissioner General or Technical Committee meetings</p>
              </div>
            </Link>

            <Link to="/invitations/send" className="section-card">
              <div className="card-icon">
                <FaEnvelope />
              </div>
              <div className="card-content">
                <h3>Send Invitations</h3>
                <p>Send meeting invitations to committee members</p>
              </div>
            </Link>

            <Link to="/minutes/take" className="section-card">
              <div className="card-icon">
                <FaFileAlt />
              </div>
              <div className="card-content">
                <h3>Take Minutes</h3>
                <p>Record and submit meeting minutes</p>
              </div>
            </Link>

            <Link to="/resolutions/assign" className="section-card">
              <div className="card-icon">
                <FaTasks />
              </div>
              <div className="card-content">
                <h3>Assign Resolutions</h3>
                <p>Create and assign meeting resolutions</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Upcoming Meetings</h2>
            <Link to="/meetings" className="view-all-link">View All</Link>
          </div>
          
          {upcomingMeetings.length === 0 ? (
            <div className="empty-section">
              <FaCalendar className="empty-icon" />
              <p>No upcoming meetings scheduled</p>
            </div>
          ) : (
            <div className="upcoming-meetings">
              {upcomingMeetings.map(meeting => (
                <div key={meeting.id} className="upcoming-meeting-item">
                  <div className="meeting-date">
                    <div className="date-day">{formatDate(meeting.meetingDate)}</div>
                    <div className="date-time">{formatTime(meeting.meetingDate)}</div>
                  </div>
                  <div className="meeting-details">
                    <h4>{meeting.title}</h4>
                    <p>{meeting.location || 'Location TBD'}</p>
                    <span className="meeting-type">{meeting.meetingType}</span>
                  </div>
                  <div className="meeting-actions">
                    <Link to={`/meetings/${meeting.id}`} className="btn btn-sm btn-primary">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Pending Tasks</h2>
            <Link to="/resolutions" className="view-all-link">View All</Link>
          </div>
          
          {pendingTasks.length === 0 ? (
            <div className="empty-section">
              <FaTasks className="empty-icon" />
              <p>No pending tasks</p>
            </div>
          ) : (
            <div className="pending-tasks">
              {pendingTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-priority">
                    <span className={`priority-indicator ${task.priority?.toLowerCase()}`}></span>
                  </div>
                  <div className="task-details">
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                    <div className="task-meta">
                      <span className="task-deadline">Due: {formatDate(task.deadline)}</span>
                      <span className="task-assignee">Assigned to: {task.assignedTo}</span>
                    </div>
                  </div>
                  <div className="task-status">
                    <span className={`status-badge ${task.status?.toLowerCase()}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Activities</h2>
            <Link to="/activities" className="view-all-link">View All</Link>
          </div>
          
          {recentActivities.length === 0 ? (
            <div className="empty-section">
              <FaChartLine className="empty-icon" />
              <p>No recent activities</p>
            </div>
          ) : (
            <div className="recent-activities">
              {recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon-wrapper">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-message">{activity.message}</div>
                    <div className="activity-time">{formatDate(activity.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecretaryDashboard;