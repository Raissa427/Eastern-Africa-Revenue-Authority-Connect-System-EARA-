// services/memberService.js
const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:8081/api';

export class MemberService {
  // ==================== NOTIFICATION MANAGEMENT ====================
  
  /**
   * Get all notifications for Subcommittee Member
   */
  static async getNotifications(userId) {
    try {
      const response = await fetch(`${API_BASE}/notifications/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return empty array instead of hardcoded data
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId) {
    try {
      const response = await fetch(`${API_BASE}/notifications/user/${userId}/unread-count`);
      if (!response.ok) throw new Error('Failed to fetch unread count');
      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 3; // Fallback count
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId) {
    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}/mark-read`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');
      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllNotificationsAsRead(userId) {
    try {
      const response = await fetch(`${API_BASE}/notifications/user/${userId}/mark-all-read`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      return await response.json();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // ==================== TASK MANAGEMENT ====================

  /**
   * Get assigned tasks for the member's subcommittee
   */
  static async getAssignedTasks(subcommitteeId) {
    try {
      const response = await fetch(`${API_BASE}/resolutions/subcommittee/${subcommitteeId}`);
      if (!response.ok) throw new Error('Failed to fetch assigned tasks');
      const data = await response.json();
      console.log('Fetched tasks from database:', data);
      return data;
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
      // Return empty array instead of hardcoded data
      return [];
    }
  }

  /**
   * Get task details by ID
   */
  static async getTaskById(taskId) {
    try {
      const response = await fetch(`${API_BASE}/resolutions/${taskId}`);
      if (!response.ok) throw new Error('Failed to fetch task details');
      return await response.json();
    } catch (error) {
      console.error('Error fetching task details:', error);
      throw error;
    }
  }

  // ==================== PROFILE MANAGEMENT ====================

  /**
   * Get member profile
   */
  static async getProfile(email) {
    try {
      const response = await fetch(`${API_BASE}/auth/profile?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Return null instead of hardcoded data
      return null;
    }
  }

  /**
   * Update member profile
   */
  static async updateProfile(email, profileData) {
    try {
      const response = await fetch(`${API_BASE}/auth/profile?email=${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          email: profileData.email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // ==================== MEETING INVITATIONS ====================

  /**
   * Get meeting invitations
   */
  static async getMeetingInvitations(userId) {
    try {
      const response = await fetch(`${API_BASE}/invitations/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch meeting invitations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching meeting invitations:', error);
      // Return empty array instead of hardcoded data
      return [];
    }
  }

  /**
   * Get all meetings for the subcommittee (database-driven)
   */
  static async getAllMeetings(subcommitteeId) {
    try {
      const response = await fetch(`${API_BASE}/meetings/subcommittee/${subcommitteeId}`);
      if (!response.ok) throw new Error('Failed to fetch meetings');
      const data = await response.json();
      console.log('Fetched all meetings from database:', data);
      return data;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      // Return empty array instead of hardcoded data
      return [];
    }
  }

  /**
   * Get all subcommittee members (database-driven)
   */
  static async getSubCommitteeMembers(subcommitteeId) {
    try {
      const response = await fetch(`${API_BASE}/subcommittee/${subcommitteeId}/members`);
      if (!response.ok) throw new Error('Failed to fetch subcommittee members');
      const data = await response.json();
      console.log('Fetched subcommittee members from database:', data);
      return data;
    } catch (error) {
      console.error('Error fetching subcommittee members:', error);
      // Return empty array instead of hardcoded data
      return [];
    }
  }

  /**
   * Respond to meeting invitation
   */
  static async respondToInvitation(invitationId, response, comments = '') {
    try {
      const apiResponse = await fetch(`${API_BASE}/invitations/${invitationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: response, // "ACCEPTED", "DECLINED", "MAYBE"
          comments: comments
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'Failed to respond to invitation');
      }

      return await apiResponse.json();
    } catch (error) {
      console.error('Error responding to invitation:', error);
      throw error;
    }
  }

  // ==================== DASHBOARD STATS ====================

  /**
   * Get member dashboard statistics
   */
  static async getDashboardStats(userId, subcommitteeId) {
    try {
      const response = await fetch(`${API_BASE}/dashboard/member/stats?userId=${userId}&subcommitteeId=${subcommitteeId}`);
      if (!response.ok) throw new Error('Failed to fetch member stats');
      const data = await response.json();
      
      return {
        ...data,
        recentTasks: Array.isArray(data.recentTasks) ? data.recentTasks : []
      };
    } catch (error) {
      console.error('Error fetching member stats:', error);
      // Return fallback stats
      return {
        assignedTasks: 2,
        completedTasks: 1,
        upcomingMeetings: 2,
        unreadNotifications: 3,
        subcommitteePerformance: 88,
        myContributions: [
          { title: "Infrastructure Development", contribution: 60, status: "In Progress" },
          { title: "Policy Update Framework", contribution: 40, status: "In Progress" }
        ],
        recentTasks: [
          {
            id: 1,
            title: "Infrastructure Development Initiative",
            assignedDate: "2024-01-10T09:00:00Z",
            deadline: "2024-02-15T17:00:00Z",
            status: "ASSIGNED"
          },
          {
            id: 2,
            title: "Policy Update Framework",
            assignedDate: "2024-01-08T10:30:00Z",
            deadline: "2024-02-20T17:00:00Z",
            status: "IN_PROGRESS"
          }
        ]
      };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get notification type icon
   */
  static getNotificationIcon(type) {
    const icons = {
      'TASK_ASSIGNMENT': '📋',
      'MEETING_INVITATION': '📅',
      'DEADLINE_REMINDER': '⏰',
      'TASK_UPDATE': '📝',
      'MEETING_UPDATE': '🔄'
    };
    return icons[type] || '📢';
  }

  /**
   * Format date for display
   */
  static formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get task priority color
   */
  static getTaskPriorityColor(priority) {
    const colors = {
      'high': '#dc2626',    // Red
      'medium': '#d97706',  // Orange
      'low': '#16a34a',     // Green
      'normal': '#6b7280'   // Gray
    };
    return colors[priority] || '#6b7280';
  }

  /**
   * Get task status color
   */
  static getTaskStatusColor(status) {
    const colors = {
      'ASSIGNED': '#3b82f6',      // Blue
      'IN_PROGRESS': '#d97706',   // Orange
      'COMPLETED': '#16a34a',     // Green
      'ON_HOLD': '#6b7280'        // Gray
    };
    return colors[status] || '#6b7280';
  }

  /**
   * Calculate days until deadline
   */
  static getDaysUntilDeadline(deadlineString) {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Get deadline urgency level
   */
  static getDeadlineUrgency(deadlineString) {
    const daysLeft = this.getDaysUntilDeadline(deadlineString);
    if (daysLeft < 0) return 'overdue';
    if (daysLeft <= 3) return 'urgent';
    if (daysLeft <= 7) return 'warning';
    return 'normal';
  }

  /**
   * Get meeting status color
   */
  static getMeetingStatusColor(status) {
    const colors = {
      'PENDING': '#d97706',    // Orange
      'ACCEPTED': '#16a34a',   // Green
      'DECLINED': '#dc2626',   // Red
      'MAYBE': '#8b5cf6'       // Purple
    };
    return colors[status] || '#6b7280';
  }

  /**
   * Filter notifications by type
   */
  static filterNotifications(notifications, type = null) {
    if (!type) return notifications;
    return notifications.filter(notification => notification.type === type);
  }

  /**
   * Sort notifications by date
   */
  static sortNotifications(notifications, order = 'desc') {
    return [...notifications].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  /**
   * Get upcoming deadlines
   */
  static getUpcomingDeadlines(tasks, days = 7) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return tasks.filter(task => {
      const deadline = new Date(task.deadline);
      return deadline >= now && deadline <= futureDate;
    });
  }

  /**
   * Calculate task completion percentage
   */
  static calculateTaskCompletion(completed, total) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  /**
   * Get performance badge class
   */
  static getPerformanceBadgeClass(percentage) {
    if (percentage >= 90) return 'performance-excellent';
    if (percentage >= 80) return 'performance-good';
    if (percentage >= 70) return 'performance-average';
    return 'performance-needs-improvement';
  }

  /**
   * Format task duration
   */
  static formatTaskDuration(assignedDate, deadline) {
    const assigned = new Date(assignedDate);
    const due = new Date(deadline);
    const diffTime = due - assigned;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  }

  /**
   * Get task progress percentage (mock calculation)
   */
  static getTaskProgress(task) {
    // This would normally come from the backend
    // For now, return based on status
    switch (task.status) {
      case 'COMPLETED': return 100;
      case 'IN_PROGRESS': return 65;
      case 'ASSIGNED': return 10;
      default: return 0;
    }
  }
}

export default MemberService;