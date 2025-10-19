import http from './http';

// HOD API service functions
export const hodAPI = {
  // ==================== REPORTS ====================
  
  /**
   * Fetch pending reports for review
   * @returns {Promise} API response with reports array
   */
  fetchPendingReports: async () => {
    try {
      const response = await http.get('/api/reports/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending reports:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch reports');
    }
  },

  /**
   * Review a report (approve or reject)
   * @param {number} reportId - Report ID
   * @param {string} status - 'approve' or 'reject'
   * @param {string} comment - Review comment (required for rejection)
   * @returns {Promise} API response with updated report
   */
  reviewReport: async (reportId, status, comment) => {
    try {
      const response = await http.post('/api/reports/review', {
        reportId,
        status,
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Error reviewing report:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to review report');
    }
  },

  /**
   * Get report by ID
   * @param {number} reportId - Report ID
   * @returns {Promise} API response with report details
   */
  getReportById: async (reportId) => {
    try {
      const response = await http.get(`/api/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch report');
    }
  },

  // ==================== PROFILE ====================
  
  /**
   * Fetch user profile
   * @returns {Promise} API response with user profile
   */
  fetchProfile: async () => {
    try {
      const response = await http.get('/api/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch profile');
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @param {string} profileData.name - User's full name
   * @param {string} profileData.email - User's email address
   * @param {string} profileData.contactNumber - User's contact number
   * @returns {Promise} API response with updated profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await http.put('/api/users/profile/update', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 409) {
        throw new Error('Email address is already in use');
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to update profile');
    }
  },

  // ==================== NOTIFICATIONS ====================
  
  /**
   * Fetch meeting notifications
   * @returns {Promise} API response with notifications array
   */
  fetchNotifications: async () => {
    try {
      const response = await http.get('/api/notifications/meetings');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch notifications');
    }
  },

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise} API response
   */
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await http.patch(`/api/notifications/${notificationId}/read`);
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
      const response = await http.patch('/api/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to mark all notifications as read');
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise} API response with unread count
   */
  getUnreadNotificationCount: async () => {
    try {
      const response = await http.get('/api/notifications/unread-count');
      return response.data.count || 0;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      return 0;
    }
  },

  // ==================== PERFORMANCE DASHBOARD ====================
  
  /**
   * Fetch performance dashboard data
   * @param {Object} filters - Filter options
   * @param {string} filters.subcommittee - Subcommittee filter
   * @param {string} filters.resolution - Resolution filter
   * @param {string} filters.timePeriod - Time period filter
   * @returns {Promise} API response with dashboard data
   */
  fetchDashboardData: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });
      
      const response = await http.get(`/api/performance/data?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch dashboard data');
    }
  },

  /**
   * Get performance summary statistics
   * @returns {Promise} API response with summary stats
   */
  getPerformanceSummary: async () => {
    try {
      const response = await http.get('/api/performance/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching performance summary:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch performance summary');
    }
  },

  // ==================== MEETINGS ====================
  
  /**
   * Get meeting invitations for HOD
   * @returns {Promise} API response with meeting invitations
   */
  getMeetingInvitations: async () => {
    try {
      const response = await http.get('/api/meetings/invitations');
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
      const apiResponse = await http.post(`/api/meetings/invitations/${invitationId}/respond`, {
        response,
        comments
      });
      return apiResponse.data;
    } catch (error) {
      console.error('Error responding to meeting invitation:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to respond to meeting invitation');
    }
  }
};

// Sample API call examples for each component:

/**
 * REPORT REVIEW COMPONENT EXAMPLES:
 * 
 * // Fetch pending reports
 * const reports = await hodAPI.fetchPendingReports();
 * 
 * // Review a report
 * await hodAPI.reviewReport(123, 'approve', 'Well done!');
 * await hodAPI.reviewReport(124, 'reject', 'More details needed');
 * 
 * // Get specific report
 * const report = await hodAPI.getReportById(123);
 */

/**
 * PROFILE UPDATE COMPONENT EXAMPLES:
 * 
 * // Fetch current profile
 * const profile = await hodAPI.fetchProfile();
 * 
 * // Update profile
 * const updatedProfile = await hodAPI.updateProfile({
 *   name: 'John Doe',
 *   email: 'john.doe@example.com',
 *   contactNumber: '+1-234-567-8900'
 * });
 */

/**
 * NOTIFICATIONS COMPONENT EXAMPLES:
 * 
 * // Fetch notifications
 * const notifications = await hodAPI.fetchNotifications();
 * 
 * // Mark single notification as read
 * await hodAPI.markNotificationAsRead(456);
 * 
 * // Mark all notifications as read
 * await hodAPI.markAllNotificationsAsRead();
 * 
 * // Get unread count
 * const unreadCount = await hodAPI.getUnreadNotificationCount();
 */

/**
 * PERFORMANCE DASHBOARD COMPONENT EXAMPLES:
 * 
 * // Fetch dashboard data with filters
 * const dashboardData = await hodAPI.fetchDashboardData({
 *   subcommittee: 'domestic',
 *   timePeriod: '3months'
 * });
 * 
 * // Fetch performance summary
 * const summary = await hodAPI.getPerformanceSummary();
 */

export default hodAPI;
