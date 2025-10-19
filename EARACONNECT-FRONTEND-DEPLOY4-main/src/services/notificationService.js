// services/notificationService.js
import { API_BASE } from './apiConfig';

export class NotificationService {
  /**
   * Get all notifications for a user
   */
  static async getUserNotifications(userId) {
    try {
      const response = await fetch(`${API_BASE}/notifications/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications for a user
   */
  static async getUnreadNotifications(userId) {
    try {
      const response = await fetch(`${API_BASE}/notifications/user/${userId}/unread`);
      if (!response.ok) throw new Error('Failed to fetch unread notifications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId) {
    try {
      const response = await fetch(`${API_BASE}/notifications/user/${userId}/unread-count`);
      if (!response.ok) throw new Error('Failed to fetch unread count');
      const result = await response.json();
      return result.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId) {
    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}/mark-read`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    try {
      const response = await fetch(`${API_BASE}/notifications/user/${userId}/mark-all-read`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId) {
    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get notification icon based on type
   */
  static getNotificationIcon(type) {
    const icons = {
      'MEETING_INVITATION': '📅',
      'TASK_ASSIGNMENT': '📋',
      'REPORT_SUBMISSION': '📊',
      'REPORT_APPROVAL': '✅',
      'REPORT_REJECTION': '❌',
      'CREDENTIALS_SENT': '🔑',
      'GENERAL_ANNOUNCEMENT': '📢'
    };
    return icons[type] || '🔔';
  }

  /**
   * Get notification color based on type
   */
  static getNotificationColor(type) {
    const colors = {
      'MEETING_INVITATION': '#3b82f6',
      'TASK_ASSIGNMENT': '#f59e0b',
      'REPORT_SUBMISSION': '#10b981',
      'REPORT_APPROVAL': '#16a34a',
      'REPORT_REJECTION': '#ef4444',
      'CREDENTIALS_SENT': '#8b5cf6',
      'GENERAL_ANNOUNCEMENT': '#6b7280'
    };
    return colors[type] || '#6b7280';
  }

  /**
   * Get notification type display name
   */
  static getTypeDisplayName(type) {
    const names = {
      'MEETING_INVITATION': 'Meeting Invitation',
      'TASK_ASSIGNMENT': 'Task Assignment',
      'REPORT_SUBMISSION': 'Report Submission',
      'REPORT_APPROVAL': 'Report Approval',
      'REPORT_REJECTION': 'Report Rejection',
      'CREDENTIALS_SENT': 'Credentials Sent',
      'GENERAL_ANNOUNCEMENT': 'General Announcement'
    };
    return names[type] || 'Notification';
  }

  /**
   * Format notification date
   */
  static formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  /**
   * Create notification (for testing purposes)
   */
  static async createNotification(notificationData) {
    try {
      const response = await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });
      
      if (!response.ok) throw new Error('Failed to create notification');
      return await response.json();
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics for dashboard
   */
  static async getNotificationStats(userId) {
    try {
      const [total, unreadCount] = await Promise.all([
        this.getUserNotifications(userId),
        this.getUnreadCount(userId)
      ]);

      const notifications = Array.isArray(total) ? total : [];
      
      return {
        total: notifications.length,
        unread: unreadCount,
        byType: this.groupNotificationsByType(notifications),
        recent: notifications.slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {
        total: 0,
        unread: 0,
        byType: {},
        recent: []
      };
    }
  }

  /**
   * Group notifications by type for statistics
   */
  static groupNotificationsByType(notifications) {
    return notifications.reduce((acc, notification) => {
      const type = notification.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Check if notification is recent (within last 24 hours)
   */
  static isRecent(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    return diffInHours <= 24;
  }

  /**
   * Filter notifications by type
   */
  static filterByType(notifications, type) {
    if (type === 'all') return notifications;
    return notifications.filter(notification => notification.type === type);
  }

  /**
   * Filter notifications by read status
   */
  static filterByReadStatus(notifications, isRead) {
    return notifications.filter(notification => notification.isRead === isRead);
  }

  /**
   * Sort notifications by date (newest first)
   */
  static sortByDate(notifications, ascending = false) {
    return notifications.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  /**
   * Get notification action based on type
   */
  static getNotificationAction(notification) {
    const actions = {
      'MEETING_INVITATION': {
        text: 'View Meeting',
        link: `/meetings/${notification.relatedEntityId}`
      },
      'TASK_ASSIGNMENT': {
        text: 'View Task',
        link: `/resolutions/${notification.relatedEntityId}`
      },
      'REPORT_SUBMISSION': {
        text: 'Review Report',
        link: `/reports/${notification.relatedEntityId}`
      },
      'REPORT_APPROVAL': {
        text: 'View Report',
        link: `/reports/${notification.relatedEntityId}`
      },
      'REPORT_REJECTION': {
        text: 'View Feedback',
        link: `/reports/${notification.relatedEntityId}`
      },
      'CREDENTIALS_SENT': {
        text: 'Login',
        link: '/login'
      },
      'GENERAL_ANNOUNCEMENT': {
        text: 'View Details',
        link: '/notifications'
      }
    };

    return actions[notification.type] || {
      text: 'View',
      link: '/notifications'
    };
  }

  /**
   * Polling service for real-time notifications
   */
  static startPolling(userId, callback, interval = 30000) {
    const poll = async () => {
      try {
        const unreadCount = await this.getUnreadCount(userId);
        callback(unreadCount);
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    const intervalId = setInterval(poll, interval);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}

export default NotificationService;