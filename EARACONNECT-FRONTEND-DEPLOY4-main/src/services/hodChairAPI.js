import http from './http';

// HOD Chair API service functions
export const hodChairAPI = {
  // ==================== REPORTS ====================
  
  /**
   * Fetch pending reports for HOD review
   * @returns {Promise} API response with reports array
   */
  fetchPendingReports: async () => {
    try {
      const response = await http.get('/api/hod/reports/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching HOD pending reports:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch pending reports');
    }
  },

  /**
   * Approve a report
   * @param {number} reportId - Report ID
   * @returns {Promise} API response with updated report
   */
  approveReport: async (reportId) => {
    try {
      const response = await http.post('/api/hod/reports/approve', { reportId });
      return response.data;
    } catch (error) {
      console.error('Error approving report:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to approve report');
    }
  },

  /**
   * Reject a report with comments
   * @param {number} reportId - Report ID
   * @param {string} comment - Rejection comment
   * @returns {Promise} API response with updated report
   */
  rejectReport: async (reportId, comment) => {
    try {
      const response = await http.post('/api/hod/reports/reject', { 
        reportId, 
        comment 
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting report:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to reject report');
    }
  },

  /**
   * Get report by ID with full details
   * @param {number} reportId - Report ID
   * @returns {Promise} API response with detailed report
   */
  getReportDetails: async (reportId) => {
    try {
      const response = await http.get(`/api/hod/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report details:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch report details');
    }
  },

  // ==================== PROFILE ====================
  
  /**
   * Fetch HOD profile
   * @returns {Promise} API response with HOD profile
   */
  fetchProfile: async () => {
    try {
      const response = await http.get('/api/hod/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching HOD profile:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch HOD profile');
    }
  },

  /**
   * Update HOD profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} API response with updated profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await http.put('/api/hod/profile/update', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating HOD profile:', error);
      if (error.response?.status === 409) {
        throw new Error('Email address is already in use');
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to update HOD profile');
    }
  },

  /**
   * Upload profile picture
   * @param {File} file - Profile picture file
   * @returns {Promise} API response with profile picture URL
   */
  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const response = await http.post('/api/hod/profile/upload-picture', formData);
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload profile picture');
    }
  },

  // ==================== NOTIFICATIONS ====================
  
  /**
   * Fetch HOD notifications
   * @returns {Promise} API response with notifications array
   */
  fetchNotifications: async () => {
    try {
      const response = await http.get('/api/hod/notifications/meetings');
      return response.data;
    } catch (error) {
      console.error('Error fetching HOD notifications:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch HOD notifications');
    }
  },

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise} API response
   */
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await http.patch(`/api/hod/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to mark notification as read');
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise} API response
   */
  markAllNotificationsAsRead: async () => {
    try {
      const response = await http.patch('/api/hod/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to mark all notifications as read');
    }
  },

  // ==================== PERFORMANCE DASHBOARD ====================
  
  /**
   * Fetch performance dashboard data with filters
   * @param {Object} filters - Filter options
   * @returns {Promise} API response with dashboard data
   */
  fetchPerformanceData: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });
      
      const response = await http.get(`/api/hod/performance/data?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching HOD performance data:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch performance data');
    }
  },

  /**
   * Get performance summary statistics
   * @returns {Promise} API response with summary stats
   */
  getPerformanceSummary: async () => {
    try {
      const response = await http.get('/api/hod/performance/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching performance summary:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch performance summary');
    }
  },

  /**
   * Export performance data
   * @param {Object} filters - Export filters
   * @param {string} format - Export format (csv, excel)
   * @returns {Promise} API response with export data
   */
  exportPerformanceData: async (filters = {}, format = 'csv') => {
    try {
      const params = new URLSearchParams({ ...filters, format });
      const response = await http.get(`/api/hod/performance/export?${params.toString()}`, { expectBlob: true });
      return response.data; // blob
    } catch (error) {
      console.error('Error exporting performance data:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to export performance data');
    }
  },

  // ==================== DASHBOARD STATS ====================
  
  /**
   * Get dashboard statistics
   * @returns {Promise} API response with dashboard stats
   */
  getDashboardStats: async () => {
    try {
      const response = await http.get('/api/hod/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch dashboard statistics');
    }
  },

  // ==================== MEETINGS ====================
  
  /**
   * Get HOD meeting invitations
   * @returns {Promise} API response with meeting invitations
   */
  getMeetingInvitations: async () => {
    try {
      const response = await http.get('/api/hod/meetings/invitations');
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting invitations:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch meeting invitations');
    }
  },

  /**
   * Respond to meeting invitation
   * @param {number} invitationId - Invitation ID
   * @param {string} response - Response ('accepted', 'declined', 'maybe')
   * @param {string} comments - Optional comments
   * @returns {Promise} API response
   */
  respondToMeetingInvitation: async (invitationId, response, comments = '') => {
    try {
      const apiResponse = await http.post(`/api/hod/meetings/invitations/${invitationId}/respond`, {
        response,
        comments
      });
      return apiResponse.data;
    } catch (error) {
      console.error('Error responding to meeting invitation:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to respond to meeting invitation');
    }
  },

  // ==================== SYSTEM ADMINISTRATION ====================
  
  /**
   * Get system health status (HOD access only)
   * @returns {Promise} API response with system status
   */
  getSystemStatus: async () => {
    try {
      const response = await http.get('/api/hod/system/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching system status:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch system status');
    }
  },

  /**
   * Get audit logs (HOD access only)
   * @param {Object} filters - Log filters
   * @returns {Promise} API response with audit logs
   */
  getAuditLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await http.get(`/api/hod/audit/logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch audit logs');
    }
  }
};

// Sample API call examples for each HOD Chair component:

/**
 * HOD REPORT REVIEW COMPONENT EXAMPLES:
 * 
 * // Fetch pending reports
 * const reports = await hodChairAPI.fetchPendingReports();
 * 
 * // Approve a report
 * await hodChairAPI.approveReport(123);
 * 
 * // Reject a report with detailed feedback
 * await hodChairAPI.rejectReport(124, 'The performance metrics need more detailed analysis. Please provide specific KPIs and supporting documentation.');
 * 
 * // Get detailed report information
 * const reportDetails = await hodChairAPI.getReportDetails(123);
 */

/**
 * HOD PROFILE COMPONENT EXAMPLES:
 * 
 * // Fetch HOD profile
 * const profile = await hodChairAPI.fetchProfile();
 * 
 * // Update profile with enhanced validation
 * const updatedProfile = await hodChairAPI.updateProfile({
 *   name: 'Dr. Sarah Johnson',
 *   email: 'hod.chair@eara.org',
 *   contactNumber: '+256-700-123456'
 * });
 * 
 * // Upload profile picture
 * const fileInput = document.getElementById('profilePicture');
 * const file = fileInput.files[0];
 * const uploadResult = await hodChairAPI.uploadProfilePicture(file);
 */

/**
 * HOD NOTIFICATIONS COMPONENT EXAMPLES:
 * 
 * // Fetch all notifications
 * const notifications = await hodChairAPI.fetchNotifications();
 * 
 * // Mark single notification as read
 * await hodChairAPI.markNotificationAsRead(456);
 * 
 * // Mark all notifications as read
 * await hodChairAPI.markAllNotificationsAsRead();
 */

/**
 * HOD PERFORMANCE DASHBOARD COMPONENT EXAMPLES:
 * 
 * // Fetch performance data with advanced filters
 * const dashboardData = await hodChairAPI.fetchPerformanceData({
 *   subcommittee: 'IT Committee',
 *   resolution: 'Digital Transformation',
 *   chair: 'all',
 *   dateRange: '6months'
 * });
 * 
 * // Get executive summary
 * const summary = await hodChairAPI.getPerformanceSummary();
 * 
 * // Export performance data
 * const exportData = await hodChairAPI.exportPerformanceData({
 *   subcommittee: 'all',
 *   dateRange: '1year'
 * }, 'csv');
 */

/**
 * HOD DASHBOARD STATS EXAMPLES:
 * 
 * // Get real-time dashboard statistics
 * const stats = await hodChairAPI.getDashboardStats();
 * // Returns: { pendingReports: 5, unreadNotifications: 3, avgPerformance: 82, activeSubcommittees: 7 }
 */

export default hodChairAPI;
