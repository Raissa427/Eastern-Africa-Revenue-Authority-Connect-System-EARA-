// services/hodService.js
const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:8081/api';

export class HODService {
  // ==================== REPORT MANAGEMENT ====================
  
  /**
   * Get all reports (with optional status filter)
   */
  static async getAllReports(status = null) {
    try {
      const url = status ? `${API_BASE}/reports/status/${status}` : `${API_BASE}/reports`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch reports');
      return await response.json();
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Return fallback data for testing
      return [
        {
          id: 1,
          resolution: {
            id: 1,
            title: "Infrastructure Development Initiative",
            description: "Upgrade technical infrastructure to support modern operations"
          },
          subcommittee: {
            id: 1,
            name: "Technical Infrastructure",
            memberCount: 8
          },
          submittedBy: {
            id: 1,
            name: "John Chair",
            email: "chair@tech.eara.org"
          },
          progressDetails: "Completed initial assessment and resource allocation. Started implementation phase with focus on server upgrades and network optimization.",
          hindrances: "Delayed due to pending budget approval from finance department. Waiting for vendor quotes for hardware procurement.",
          performancePercentage: 75,
          status: "SUBMITTED",
          hodComments: null,
          reviewedByHod_id: null,
          hodReviewedAt: null,
          submittedAt: "2024-01-15T10:30:00Z"
        },
        {
          id: 2,
          resolution: {
            id: 2,
            title: "Policy Update Framework",
            description: "Comprehensive review and update of organizational policies"
          },
          subcommittee: {
            id: 2,
            name: "Policy Review Committee",
            memberCount: 6
          },
          submittedBy: {
            id: 2,
            name: "Sarah Wilson",
            email: "swilson@policy.eara.org"
          },
          progressDetails: "Reviewed current policies and identified 15 areas for improvement. Drafted new policy framework with stakeholder input.",
          hindrances: "Minor delays due to conflicting stakeholder requirements. Need additional legal review for compliance sections.",
          performancePercentage: 85,
          status: "SUBMITTED",
          hodComments: null,
          reviewedByHod_id: null,
          hodReviewedAt: null,
          submittedAt: "2024-01-14T14:20:00Z"
        },
        {
          id: 3,
          resolution: {
            id: 3,
            title: "Digital Transformation Project",
            description: "Modernize digital systems and processes"
          },
          subcommittee: {
            id: 3,
            name: "Digital Innovation",
            memberCount: 10
          },
          submittedBy: {
            id: 3,
            name: "Mike Johnson",
            email: "mjohnson@digital.eara.org"
          },
          progressDetails: "Completed phase 1 of digital audit. Implemented new document management system and trained 80% of staff.",
          hindrances: "None at this time. Project is progressing ahead of schedule.",
          performancePercentage: 92,
          status: "APPROVED_BY_HOD",
          hodComments: "Excellent progress. Well-documented approach and clear deliverables.",
          reviewedByHod_id: 1,
          hodReviewedAt: "2024-01-13T16:45:00Z",
          submittedAt: "2024-01-12T09:15:00Z"
        }
      ];
    }
  }

  /**
   * Get reports by specific resolution
   */
  static async getReportsByResolution(resolutionId) {
    try {
      const response = await fetch(`${API_BASE}/reports/resolution/${resolutionId}`);
      if (!response.ok) throw new Error('Failed to fetch resolution reports');
      return await response.json();
    } catch (error) {
      console.error('Error fetching resolution reports:', error);
      return [];
    }
  }

  /**
   * Get reports by specific subcommittee
   */
  static async getReportsBySubcommittee(subcommitteeId) {
    try {
      const response = await fetch(`${API_BASE}/reports/subcommittee/${subcommitteeId}`);
      if (!response.ok) throw new Error('Failed to fetch subcommittee reports');
      return await response.json();
    } catch (error) {
      console.error('Error fetching subcommittee reports:', error);
      return [];
    }
  }

  /**
   * Get a specific report by ID
   */
  static async getReportById(reportId) {
    try {
      const response = await fetch(`${API_BASE}/reports/${reportId}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      return await response.json();
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  }

  /**
   * Review a report (approve or reject)
   */
  static async reviewReport(reportId, approved, hodComments = '', hodId) {
    try {
      const response = await fetch(`${API_BASE}/reports/${reportId}/hod-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hodId: hodId,
          approved: approved,
          comments: hodComments
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to review report';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      try {
        return await response.json();
      } catch (jsonError) {
        // If response is not JSON but request was successful
        console.warn('Response is not JSON, but request was successful');
        return { success: true };
      }
    } catch (error) {
      console.error('Error reviewing report:', error);
      throw error;
    }
  }

  // ==================== NOTIFICATION MANAGEMENT ====================

  /**
   * Get all notifications for HOD
   */
  static async getHODNotifications(hodId) {
    try {
      const response = await fetch(`${API_BASE}/notifications/user/${hodId}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return fallback notifications
      return [
        {
          id: 1,
          title: "New Report Submission",
          message: "John Chair has submitted a progress report for 'Infrastructure Development Initiative'.",
          type: "REPORT_SUBMISSION",
          isRead: false,
          relatedEntityType: "REPORT",
          relatedEntityId: 1,
          createdAt: "2024-01-15T10:30:00Z",
          report: {
            id: 1,
            resolution: { title: "Infrastructure Development Initiative" },
            submittedBy: { name: "John Chair" },
            performancePercentage: 75
          }
        },
        {
          id: 2,
          title: "New Report Submission",
          message: "Sarah Wilson has submitted a progress report for 'Policy Update Framework'.",
          type: "REPORT_SUBMISSION",
          isRead: false,
          relatedEntityType: "REPORT",
          relatedEntityId: 2,
          createdAt: "2024-01-14T14:20:00Z",
          report: {
            id: 2,
            resolution: { title: "Policy Update Framework" },
            submittedBy: { name: "Sarah Wilson" },
            performancePercentage: 85
          }
        },
        {
          id: 3,
          title: "Meeting Invitation",
          message: "You are invited to the 'Monthly Department Review' meeting.",
          type: "MEETING_INVITATION",
          isRead: true,
          relatedEntityType: "MEETING",
          relatedEntityId: 1,
          createdAt: "2024-01-13T16:45:00Z",
          meeting: {
            id: 1,
            title: "Monthly Department Review",
            meetingDate: "2024-01-20T14:00:00Z",
            location: "Conference Room A"
          }
        },
        {
          id: 4,
          title: "Report Approved Successfully",
          message: "Your approval of Mike Johnson's report has been forwarded to Commissioner General.",
          type: "REPORT_APPROVAL",
          isRead: true,
          relatedEntityType: "REPORT",
          relatedEntityId: 3,
          createdAt: "2024-01-13T16:50:00Z"
        }
      ];
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadNotificationCount(hodId) {
    try {
      const response = await fetch(`${API_BASE}/notifications/user/${hodId}/unread-count`);
      if (!response.ok) throw new Error('Failed to fetch unread count');
      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 2; // Fallback count
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
   * Mark all notifications as read for HOD
   */
  static async markAllNotificationsAsRead(hodId) {
    try {
      const response = await fetch(`${API_BASE}/notifications/user/${hodId}/mark-all-read`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      return await response.json();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // ==================== PROFILE MANAGEMENT ====================

  /**
   * Get HOD profile
   */
  static async getHODProfile(email) {
    try {
      const response = await fetch(`${API_BASE}/auth/profile?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Return fallback profile
      return {
        id: 1,
        name: "Dr. Michael Anderson",
        email: "hod@department.eara.org",
        phone: "+256-700-987654",
        role: "CHAIR", // Chair of Head of Delegation
        subcommittee: { name: "Head Of Delegation" },
        department: {
          id: 1,
          name: "Technical Operations"
        },
        country: {
          id: 1,
          name: "Uganda"
        },
        active: true,
        createdAt: "2024-01-01T00:00:00Z"
      };
    }
  }

  /**
   * Update HOD profile (excluding role and department)
   */
  static async updateHODProfile(email, profileData) {
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

  // ==================== ANALYTICS & DASHBOARD ====================

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(hodId) {
    try {
      const response = await fetch(`${API_BASE}/dashboard/performance/stats?hodId=${hodId}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await response.json();
      
      // Ensure subcommitteePerformance is always an array
      return {
        ...data,
        subcommitteePerformance: Array.isArray(data.subcommitteePerformance) ? data.subcommitteePerformance : []
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return fallback stats with guaranteed array structure
      return {
        pendingReports: 2,
        approvedThisMonth: 8,
        rejectedThisMonth: 1,
        averagePerformance: 82,
        activeResolutions: 5,
        totalSubcommittees: 4,
        monthlyTrend: {
          approved: [5, 7, 8],
          rejected: [2, 1, 1],
          pending: [3, 2, 2]
        },
        subcommitteePerformance: [
          { name: "Technical Infrastructure", avgPerformance: 78, trend: "up" },
          { name: "Policy Review Committee", avgPerformance: 85, trend: "stable" },
          { name: "Digital Innovation", avgPerformance: 91, trend: "up" },
          { name: "Quality Assurance", avgPerformance: 74, trend: "down" }
        ]
      };
    }
  }

  /**
   * Get meeting invitations for HOD
   */
  static async getMeetingInvitations(hodId) {
    try {
      const response = await fetch(`${API_BASE}/invitations/user/${hodId}`);
      if (!response.ok) throw new Error('Failed to fetch meeting invitations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching meeting invitations:', error);
      return [
        {
          id: 1,
          meeting: {
            id: 1,
            title: "Monthly Department Review",
            description: "Review department performance and upcoming initiatives",
            meetingDate: "2024-01-20T14:00:00Z",
            location: "Conference Room A",
            organizer: "Commissioner General"
          },
          status: "PENDING",
          respondedAt: null
        }
      ];
    }
  }

  /**
   * Respond to meeting invitation
   */
  static async respondToMeetingInvitation(invitationId, response, comments = '') {
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

  // ==================== UTILITY METHODS ====================

  /**
   * Validate report review data
   */
  static validateReportReview(approved, hodComments) {
    const errors = [];

    if (!approved && (!hodComments || !hodComments.trim())) {
      errors.push('Comments are required when rejecting a report');
    }

    if (hodComments && hodComments.length < 10) {
      errors.push('Comments must be at least 10 characters long');
    }

    return errors;
  }

  /**
   * Get report status color
   */
  static getReportStatusColor(status) {
    const colors = {
      'SUBMITTED': '#d97706',        // Orange
      'APPROVED_BY_HOD': '#3b82f6',  // Blue
      'REJECTED_BY_HOD': '#dc2626',  // Red
      'IN_REVIEW': '#8b5cf6'         // Purple
    };
    return colors[status] || '#6b7280';
  }

  /**
   * Get notification type icon
   */
  static getNotificationIcon(type) {
    const icons = {
      'REPORT_SUBMISSION': '📊',
      'REPORT_APPROVAL': '✅',
      'REPORT_REJECTION': '❌',
      'MEETING_INVITATION': '📅',
      'DEADLINE_REMINDER': '⏰'
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
   * Get performance color based on percentage
   */
  static getPerformanceColor(percentage) {
    if (percentage >= 90) return '#16a34a'; // Green
    if (percentage >= 80) return '#65a30d'; // Light green
    if (percentage >= 70) return '#d97706'; // Orange
    if (percentage >= 60) return '#f59e0b'; // Yellow
    return '#dc2626'; // Red
  }

  /**
   * Get trend indicator
   */
  static getTrendIcon(trend) {
    const icons = {
      'up': '📈',
      'down': '📉',
      'stable': '➡️'
    };
    return icons[trend] || '➡️';
  }

  /**
   * Calculate approval rate
   */
  static calculateApprovalRate(approved, rejected) {
    const total = approved + rejected;
    if (total === 0) return 0;
    return Math.round((approved / total) * 100);
  }

  /**
   * Get urgency level for pending reports
   */
  static getReportUrgency(submittedAt) {
    const submitted = new Date(submittedAt);
    const now = new Date();
    const hoursAgo = (now - submitted) / (1000 * 60 * 60);
    
    if (hoursAgo > 72) return 'overdue';
    if (hoursAgo > 48) return 'urgent';
    if (hoursAgo > 24) return 'warning';
    return 'normal';
  }

  /**
   * Filter reports by criteria
   */
  static filterReports(reports, filters) {
    return reports.filter(report => {
      if (filters.status && report.status !== filters.status) return false;
      if (filters.subcommitteeId && report.subcommittee.id !== filters.subcommitteeId) return false;
      if (filters.resolutionId && report.resolution.id !== filters.resolutionId) return false;
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const titleMatch = report.resolution.title.toLowerCase().includes(searchLower);
        const chairMatch = report.submittedBy.name.toLowerCase().includes(searchLower);
        if (!titleMatch && !chairMatch) return false;
      }
      return true;
    });
  }

  /**
   * Sort reports by criteria
   */
  static sortReports(reports, sortBy, sortOrder = 'desc') {
    const sorted = [...reports].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'submittedAt':
          valueA = new Date(a.submittedAt);
          valueB = new Date(b.submittedAt);
          break;
        case 'performancePercentage':
          valueA = a.performancePercentage;
          valueB = b.performancePercentage;
          break;
        case 'resolutionTitle':
          valueA = a.resolution.title.toLowerCase();
          valueB = b.resolution.title.toLowerCase();
          break;
        case 'chairName':
          valueA = a.submittedBy.name.toLowerCase();
          valueB = b.submittedBy.name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }
}

export default HODService;
