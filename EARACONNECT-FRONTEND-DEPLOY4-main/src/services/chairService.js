// services/chairService.js
import { API_BASE } from './apiConfig';

export class ChairService {
  // ==================== RESOLUTION MANAGEMENT ====================
  
  /**
   * Get all resolutions assigned to the chair's subcommittee
   */
  static async getAssignedResolutions(chairId) {
    try {
      console.log(`🔍 ChairService: Fetching resolutions for chair ${chairId}`);
      const response = await fetch(`${API_BASE}/chair/resolutions/${chairId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`⚠️ ChairService: Response not OK (${response.status}): ${errorText}`);
        
        if (response.status === 404) {
          console.log(`⚠️ ChairService: No resolutions found for chair ${chairId}`);
          return [];
        }
        
        // If it's a 400 error, it might be because the user is not a chair or doesn't exist
        if (response.status === 400) {
          console.log(`⚠️ ChairService: User validation failed for chair ${chairId}`);
          throw new Error(`User validation failed: ${errorText}`);
        }
        
        throw new Error(`Failed to fetch assigned resolutions: ${response.status} - ${errorText}`);
      }
      
      const resolutions = await response.json();
      console.log(`✅ ChairService: Found ${resolutions.length} resolutions for chair ${chairId}`);
      return Array.isArray(resolutions) ? resolutions : [];
    } catch (error) {
      console.error(`❌ ChairService: Error fetching assigned resolutions for chair ${chairId}:`, error);
      
      // If it's a network error, return empty array
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.log(`⚠️ ChairService: Network error - backend might not be running`);
        return [];
      }
      
      throw error;
    }
  }

  /**
   * Get detailed information about a specific resolution
   */
  static async getResolutionDetails(resolutionId, chairId) {
    try {
      console.log(`🔍 ChairService: Fetching details for resolution ${resolutionId}`);
      const response = await fetch(`${API_BASE}/chair/resolutions/${resolutionId}/details?chairId=${chairId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`⚠️ ChairService: Resolution ${resolutionId} not found`);
          return null;
        }
        throw new Error(`Failed to fetch resolution details: ${response.status}`);
      }
      
      const resolution = await response.json();
      console.log(`✅ ChairService: Found resolution details for ${resolutionId}`);
      return resolution;
    } catch (error) {
      console.error(`❌ ChairService: Error fetching resolution details for ${resolutionId}:`, error);
      return null;
    }
  }

  // ==================== REPORT MANAGEMENT ====================
  
  /**
   * Submit a new report for a resolution (goes directly to HOD)
   */
  static async submitReport(reportData) {
    try {
      console.log(`🔍 ChairService: Submitting report for resolution ${reportData.resolutionId}`);
      
      const response = await fetch(`${API_BASE}/chair/reports?chairId=${reportData.chairId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolution: { id: reportData.resolutionId },
          subcommittee: { id: reportData.subcommitteeId },
          progressDetails: reportData.progressDetails,
          hindrances: reportData.hindrances || '',
          performancePercentage: reportData.performancePercentage,
          submittedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit report');
      }

      const savedReport = await response.json();
      console.log(`✅ ChairService: Report submitted successfully for resolution ${reportData.resolutionId}`);
      
      // Return success message with HOD confirmation
      return {
        ...savedReport,
        successMessage: `Report submitted successfully! Your report has been sent to HOD for review. Report ID: ${savedReport.id}`
      };
    } catch (error) {
      console.error('❌ ChairService: Error submitting report:', error);
      throw error;
    }
  }

  /**
   * Get all reports for a specific resolution
   */
  static async getReportsForResolution(resolutionId) {
    try {
      console.log(`🔍 ChairService: Fetching reports for resolution ${resolutionId}`);
      const response = await fetch(`${API_BASE}/reports/resolution/${resolutionId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`⚠️ ChairService: No reports found for resolution ${resolutionId}`);
          return [];
        }
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }
      
      const reports = await response.json();
      console.log(`✅ ChairService: Found ${reports.length} reports for resolution ${resolutionId}`);
      return Array.isArray(reports) ? reports : [];
    } catch (error) {
      console.error(`❌ ChairService: Error fetching reports for resolution ${resolutionId}:`, error);
      return [];
    }
  }

  /**
   * Get all reports submitted by the chair
   */
  static async getChairReports(chairId) {
    try {
      console.log(`🔍 ChairService: Fetching reports for chair ${chairId}`);
      const response = await fetch(`${API_BASE}/chair/reports/${chairId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`⚠️ ChairService: No reports found for chair ${chairId}`);
          return [];
        }
        throw new Error(`Failed to fetch chair reports: ${response.status}`);
      }
      
      const reports = await response.json();
      console.log(`✅ ChairService: Found ${reports.length} reports for chair ${chairId}`);
      return Array.isArray(reports) ? reports : [];
    } catch (error) {
      console.error(`❌ ChairService: Error fetching chair reports for chair ${chairId}:`, error);
      return [];
    }
  }

  /**
   * Update an existing report (for resubmission after rejection)
   */
  static async updateReport(reportId, reportData) {
    try {
      console.log(`🔍 ChairService: Updating report ${reportId} for resubmission`);
      
      const response = await fetch(`${API_BASE}/chair/reports/${reportId}?chairId=${reportData.chairId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progressDetails: reportData.progressDetails,
          hindrances: reportData.hindrances,
          performancePercentage: reportData.performancePercentage,
          submittedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update report');
      }

      const updatedReport = await response.json();
      console.log(`✅ ChairService: Report ${reportId} updated successfully`);
      return updatedReport;
    } catch (error) {
      console.error(`❌ ChairService: Error updating report ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Resubmit a rejected report
   */
  static async resubmitReport(reportId, reportData) {
    try {
      console.log(`🔍 ChairService: Resubmitting rejected report ${reportId}`);
      
      // First update the report
      const updatedReport = await this.updateReport(reportId, reportData);
      
      // Then submit it again
      const resubmittedReport = await this.submitReport({
        resolutionId: updatedReport.resolution.id,
        subcommitteeId: updatedReport.subcommittee.id,
        chairId: reportData.chairId,
        progressDetails: reportData.progressDetails,
        hindrances: reportData.hindrances,
        performancePercentage: reportData.performancePercentage
      });
      
      console.log(`✅ ChairService: Report ${reportId} resubmitted successfully`);
      return resubmittedReport;
    } catch (error) {
      console.error(`❌ ChairService: Error resubmitting report ${reportId}:`, error);
      throw error;
    }
  }

  // ==================== NOTIFICATION MANAGEMENT ====================

  /**
   * Get all notifications for a user
   */
  static async getUserNotifications(userId) {
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
          title: "Report Rejected",
          message: "Your report for 'Infrastructure Development Initiative' has been rejected by HOD.",
          type: "REPORT_REJECTION",
          isRead: false,
          relatedEntityType: "REPORT",
          relatedEntityId: 1,
          hodComments: "Please provide more detailed progress information and specific timelines.",
          createdAt: "2024-01-16T09:15:00Z"
        },
        {
          id: 2,
          title: "New Task Assignment",
          message: "You have been assigned to work on 'Policy Update Framework'.",
          type: "TASK_ASSIGNMENT",
          isRead: false,
          relatedEntityType: "RESOLUTION",
          relatedEntityId: 2,
          createdAt: "2024-01-14T11:30:00Z"
        },
        {
          id: 3,
          title: "Meeting Invitation",
          message: "You are invited to the 'Quarterly Review Meeting'.",
          type: "MEETING_INVITATION",
          isRead: true,
          relatedEntityType: "MEETING",
          relatedEntityId: 3,
          createdAt: "2024-01-13T16:45:00Z"
        }
      ];
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadNotificationCount(userId) {
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
      const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');
      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllNotificationsAsRead(userId) {
    try {
      const response = await fetch(`${API_BASE}/notifications/user/${userId}/mark-all-read`, {
        method: 'PUT',
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
   * Get user profile
   */
  static async getUserProfile(email) {
    try {
      const response = await fetch(`${API_BASE}/auth/profile?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Return fallback profile
      return {
        id: 1,
        name: "John Chair",
        email: "chair@tech.eara.org",
        phone: "+256-700-123456",
        role: "CHAIR",
        subcommittee: {
          id: 1,
          name: "Technical Infrastructure"
        },
        country: null,
        active: true,
        createdAt: "2024-01-01T00:00:00Z"
      };
    }
  }

  /**
   * Update user profile (excluding role and subcommittee)
   */
  static async updateUserProfile(email, profileData) {
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

  // ==================== UTILITY METHODS ====================

  /**
   * Validate report data before submission
   */
  static validateReportData(reportData) {
    const errors = [];

    if (!reportData.progressDetails || !reportData.progressDetails.trim()) {
      errors.push('Progress details are required');
    }

    if (reportData.progressDetails && reportData.progressDetails.length < 10) {
      errors.push('Progress details must be at least 10 characters long');
    }

    if (!reportData.performancePercentage && reportData.performancePercentage !== 0) {
      errors.push('Performance percentage is required');
    }

    if (reportData.performancePercentage < 0 || reportData.performancePercentage > 100) {
      errors.push('Performance percentage must be between 0 and 100');
    }

    return errors;
  }

  /**
   * Get status color for reports
   */
  static getReportStatusColor(status) {
    const colors = {
      'SUBMITTED': '#d97706',     // Warning (Orange)
      'APPROVED': '#16a34a',      // Success (Green)
      'REJECTED_BY_HOD': '#dc2626', // Danger (Red)
      'IN_REVIEW': '#3b82f6'      // Info (Blue)
    };
    return colors[status] || '#6b7280';
  }

  /**
   * Get notification type icon
   */
  static getNotificationIcon(type) {
    const icons = {
      'REPORT_REJECTION': '❌',
      'TASK_ASSIGNMENT': '📋',
      'MEETING_INVITATION': '📅',
      'REPORT_APPROVED': '✅',
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
   * Get performance percentage color
   */
  static getPerformanceColor(percentage) {
    if (percentage >= 80) return '#16a34a'; // Green
    if (percentage >= 60) return '#d97706'; // Orange
    if (percentage >= 40) return '#f59e0b'; // Yellow
    return '#dc2626'; // Red
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
}

export default ChairService;
