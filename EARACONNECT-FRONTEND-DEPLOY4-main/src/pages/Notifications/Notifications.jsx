import React, { useState, useEffect } from 'react';
import { FaBell, FaCalendar, FaFileAlt, FaUsers, FaTimes } from 'react-icons/fa';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/notifications/user/${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT'
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/notifications/user/${user.id}/read-all`, {
        method: 'PUT'
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => {
          const notification = notifications.find(n => n.id === notificationId);
          return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MEETING_INVITATION':
        return <FaCalendar className="notification-icon meeting" />;
      case 'TASK_ASSIGNMENT':
        return <FaFileAlt className="notification-icon task" />;
      case 'REPORT_SUBMISSION':
        return <FaFileAlt className="notification-icon report" />;
      default:
        return <FaBell className="notification-icon general" />;
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'MEETING_INVITATION':
        return 'Meeting Invitation';
      case 'TASK_ASSIGNMENT':
        return 'Task Assignment';
      case 'REPORT_SUBMISSION':
        return 'Report Submission';
      case 'REPORT_APPROVAL':
        return 'Report Approval';
      case 'REPORT_REJECTION':
        return 'Report Rejection';
      case 'CREDENTIALS_SENT':
        return 'Credentials Sent';
      case 'GENERAL_ANNOUNCEMENT':
        return 'General Announcement';
      default:
        return 'Notification';
    }
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="header-left">
          <h1>Notifications</h1>
          <div className="notification-badge">
            <FaBell />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-secondary">
            Mark All as Read
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="notifications-content">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <FaBell className="empty-icon" />
            <h3>No notifications</h3>
            <p>You're all caught up! New notifications will appear here.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              >
                <div className="notification-icon-wrapper">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <h4>{notification.title}</h4>
                    <div className="notification-meta">
                      <span className="notification-type">
                        {getNotificationTypeLabel(notification.type)}
                      </span>
                      <span className="notification-time">
                        {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="notification-message">{notification.message}</p>
                  
                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="btn btn-sm btn-primary"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="btn btn-sm btn-danger"
                    >
                      <FaTimes /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications; 