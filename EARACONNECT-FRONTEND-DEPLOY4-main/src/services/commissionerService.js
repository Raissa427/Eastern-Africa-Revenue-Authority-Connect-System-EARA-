// services/commissionerService.js
import { API_BASE } from './apiConfig';

export class CommissionerService {
  // ==================== REPORT MANAGEMENT ====================
  
  /**
   * Get all approved reports from HODs
   */
  static async getApprovedReports() {
    try {
      const response = await fetch(`${API_BASE}/reports/status/APPROVED_BY_HOD`);
      if (!response.ok) throw new Error('Failed to fetch approved reports');
      return await response.json();
    } catch (error) {
      console.error('Error fetching approved reports:', error);
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
          reviewedByHod: {
            id: 1,
            name: "Dr. Michael Anderson",
            email: "hod@department.eara.org"
          },
          progressDetails: "Completed initial assessment and resource allocation. Started implementation phase with focus on server upgrades and network optimization. Phase 1 deliverables achieved ahead of schedule.",
          hindrances: "Delayed due to pending budget approval from finance department. Vendor selection process took longer than expected due to compliance requirements.",
          performancePercentage: 85,
          status: "APPROVED_BY_HOD",
          hodComments: "Excellent progress with clear deliverables. The team has shown strong project management skills and proactive problem-solving.",
          commissionerComments: null,
          reviewedByCommissioner_id: null,
          commissionerReviewedAt: null,
          hodReviewedAt: "2024-01-16T14:30:00Z",
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
          reviewedByHod: {
            id: 1,
            name: "Dr. Michael Anderson",
            email: "hod@department.eara.org"
          },
          progressDetails: "Reviewed current policies and identified 15 areas for improvement. Drafted new policy framework with stakeholder input. Conducted 3 consultation sessions with department heads.",
          hindrances: "Minor delays due to conflicting stakeholder requirements. Legal review process is taking longer than anticipated for compliance sections.",
          performancePercentage: 78,
          status: "APPROVED_BY_HOD",
          hodComments: "Good progress on policy review. Stakeholder engagement has been thorough. Recommend expediting legal review process.",
          commissionerComments: null,
          reviewedByCommissioner_id: null,
          commissionerReviewedAt: null,
          hodReviewedAt: "2024-01-15T16:45:00Z",
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
          reviewedByHod: {
            id: 1,
            name: "Dr. Michael Anderson",
            email: "hod@department.eara.org"
          },
          progressDetails: "Successfully completed phase 1 of digital audit. Implemented new document management system across 5 departments. Trained 85% of staff on new systems.",
          hindrances: "None at this time. Project is progressing ahead of schedule with strong stakeholder buy-in.",
          performancePercentage: 95,
          status: "APPROVED_BY_COMMISSIONER",
          hodComments: "Outstanding execution. Clear roadmap and excellent stakeholder management. Ready for final approval.",
          commissionerComments: "Exceptional work. This sets the standard for digital transformation initiatives. Approved for full implementation.",
          reviewedByCommissioner_id: 1,
          commissionerReviewedAt: "2024-01-14T10:15:00Z",
          hodReviewedAt: "2024-01-13T16:45:00Z",
          submittedAt: "2024-01-12T09:15:00Z"
        }
      ];
    }
  }

  /**
   * Get all reports (for comprehensive view)
   */
  static async getAllReports() {
    try {
      const response = await fetch(`${API_BASE}/reports`);
      if (!response.ok) throw new Error('Failed to fetch all reports');
      return await response.json();
    } catch (error) {
      console.error('Error fetching all reports:', error);
      return await this.getApprovedReports(); // Fallback to approved reports
    }
  }

  /**
   * Get reports by resolution ID
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
   * Review a report as Commissioner General
   */
  static async reviewReport(reportId, approved, commissionerComments = '') {
    try {
      const response = await fetch(`${API_BASE}/reports/${reportId}/commissioner-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approved: approved,
          comments: commissionerComments
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to review report');
      }

      return await response.json();
    } catch (error) {
      console.error('Error reviewing report:', error);
      throw error;
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

  // ==================== DASHBOARD & ANALYTICS ====================

  /**
   * Get comprehensive dashboard statistics
   */
  static async getDashboardStats(userId) {
    try {
      const response = await fetch(`${API_BASE}/dashboard/comprehensive?userId=${userId}&userRole=COMMISSIONER_GENERAL`);
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await response.json();
      
      return {
        ...data,
        subcommitteePerformance: Array.isArray(data.subcommitteePerformance) ? data.subcommitteePerformance : [],
        statusCounts: data.statusCounts || {},
        monthlyTrends: data.monthlyTrends || []
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return comprehensive fallback stats
      return {
        totalReports: 15,
        averagePerformance: 84,
        pendingReview: 2,
        approvedReports: 8,
        rejectedReports: 1,
        completedResolutions: 4,
        activeResolutions: 6,
        statusCounts: {
          'APPROVED_BY_HOD': 2,
          'APPROVED_BY_COMMISSIONER': 8,
          'REJECTED_BY_COMMISSIONER': 1,
          'IN_REVIEW': 4
        },
        subcommitteePerformance: [
          { 
            name: "Technical Infrastructure", 
            avgPerformance: 88, 
            totalReports: 4, 
            trend: "up",
            completionRate: 92
          },
          { 
            name: "Policy Review Committee", 
            avgPerformance: 82, 
            totalReports: 3, 
            trend: "stable",
            completionRate: 87
          },
          { 
            name: "Digital Innovation", 
            avgPerformance: 91, 
            totalReports: 5, 
            trend: "up",
            completionRate: 95
          },
          { 
            name: "Quality Assurance", 
            avgPerformance: 76, 
            totalReports: 3, 
            trend: "down",
            completionRate: 78
          }
        ],
        monthlyTrends: [
          { month: "Nov 2023", approved: 5, rejected: 0, pending: 2 },
          { month: "Dec 2023", approved: 7, rejected: 1, pending: 3 },
          { month: "Jan 2024", approved: 8, rejected: 1, pending: 2 }
        ],
        resolutionProgress: [
          { title: "Infrastructure Development", progress: 85, status: "On Track" },
          { title: "Policy Update Framework", progress: 78, status: "At Risk" },
          { title: "Digital Transformation", progress: 95, status: "Completed" },
          { title: "Quality Assurance Program", progress: 65, status: "Behind" }
        ]
      };
    }
  }

  /**
   * Get performance statistics
   */
  static async getPerformanceStats() {
    try {
      const response = await fetch(`${API_BASE}/dashboard/performance/stats`);
      if (!response.ok) throw new Error('Failed to fetch performance stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching performance stats:', error);
      return {
        averagePerformance: 84,
        totalReports: 15,
        subcommitteePerformance: []
      };
    }
  }

  /**
   * Get resolution progress data
   */
  static async getResolutionProgress() {
    try {
      const response = await fetch(`${API_BASE}/dashboard/resolutions/progress`);
      if (!response.ok) throw new Error('Failed to fetch resolution progress');
      return await response.json();
    } catch (error) {
      console.error('Error fetching resolution progress:', error);
      return [];
    }
  }

  // ==================== NOTIFICATION MANAGEMENT ====================

  /**
   * Get all notifications for Commissioner General
   */
  static async getNotifications(userId) {
    try {
      const response = await fetch(`${API_BASE}/notifications/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return fallback notifications
      return [
        {
          id: 1,
          title: "Report Approved by HOD",
          message: "Dr. Michael Anderson has approved the report for 'Infrastructure Development Initiative'.",
          type: "REPORT_APPROVAL",
          isRead: false,
          relatedEntityType: "REPORT",
          relatedEntityId: 1,
          createdAt: "2024-01-16T14:30:00Z",
          report: {
            id: 1,
            resolution: { title: "Infrastructure Development Initiative" },
            submittedBy: { name: "John Chair" },
            performancePercentage: 85
          }
        },
        {
          id: 2,
          title: "Report Approved by HOD",
          message: "Dr. Michael Anderson has approved the report for 'Policy Update Framework'.",
          type: "REPORT_APPROVAL",
          isRead: false,
          relatedEntityType: "REPORT",
          relatedEntityId: 2,
          createdAt: "2024-01-15T16:45:00Z",
          report: {
            id: 2,
            resolution: { title: "Policy Update Framework" },
            submittedBy: { name: "Sarah Wilson" },
            performancePercentage: 78
          }
        },
        {
          id: 3,
          title: "Meeting Invitation",
          message: "You are invited to the 'Quarterly Strategic Review' meeting.",
          type: "MEETING_INVITATION",
          isRead: true,
          relatedEntityType: "MEETING",
          relatedEntityId: 1,
          createdAt: "2024-01-14T10:00:00Z",
          meeting: {
            id: 1,
            title: "Quarterly Strategic Review",
            meetingDate: "2024-01-25T09:00:00Z",
            location: "Executive Conference Room"
          }
        }
      ];
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

  // ==================== PROFILE MANAGEMENT ====================

  /**
   * Get Commissioner General profile
   */
  static async getProfile(email) {
    try {
      const response = await fetch(`${API_BASE}/auth/profile?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Return fallback profile
      return {
        id: 1,
        name: "Commissioner General Jane Smith",
        email: "commissioner@eara.org",
        phone: "+256-700-111222",
        role: "COMMISSIONER_GENERAL",
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
   * Update Commissioner General profile
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
      return [
        {
          id: 1,
          meeting: {
            id: 1,
            title: "Quarterly Strategic Review",
            description: "Review organizational performance and strategic initiatives",
            meetingDate: "2024-01-25T09:00:00Z",
            location: "Executive Conference Room",
            organizer: "Secretary General"
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

  // ==================== UTILITY METHODS ====================

  /**
   * Get report status color
   */
  static getReportStatusColor(status) {
    const colors = {
      'APPROVED_BY_HOD': '#3b82f6',          // Blue
      'APPROVED_BY_COMMISSIONER': '#16a34a',  // Green
      'REJECTED_BY_COMMISSIONER': '#dc2626',  // Red
      'IN_REVIEW': '#d97706'                  // Orange
    };
    return colors[status] || '#6b7280';
  }

  /**
   * Get notification type icon
   */
  static getNotificationIcon(type) {
    const icons = {
      'REPORT_APPROVAL': '✅',
      'REPORT_REJECTION': '❌',
      'MEETING_INVITATION': '📅',
      'TASK_ASSIGNMENT': '📋',
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
   * Get trend icon
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
   * Calculate completion rate
   */
  static calculateCompletionRate(completed, total) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  /**
   * Get status badge class
   */
  static getStatusBadgeClass(status) {
    return `status-badge ${status.toLowerCase().replace('_', '-')}`;
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
        case 'hodReviewedAt':
          valueA = new Date(a.hodReviewedAt || a.submittedAt);
          valueB = new Date(b.hodReviewedAt || b.submittedAt);
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

  /**
   * Get priority level for reports
   */
  static getReportPriority(performancePercentage, hodReviewedAt) {
    const reviewDate = new Date(hodReviewedAt);
    const now = new Date();
    const hoursAgo = (now - reviewDate) / (1000 * 60 * 60);
    
    if (performancePercentage >= 90 && hoursAgo <= 24) return 'high';
    if (performancePercentage >= 80) return 'medium';
    if (hoursAgo > 48) return 'urgent';
    return 'normal';
  }
}

export default CommissionerService;
