const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:8081/api';

// Get dashboard statistics for different roles
export const getDashboardStats = async (role, userId) => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stats?role=${role}&userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Get recent activities for dashboard
export const getRecentActivities = async (userId, limit = 10) => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/activities?userId=${userId}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch recent activities');
    return response.json();
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

// Get meeting statistics
export const getMeetingStats = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/meetings/stats?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch meeting stats');
    return response.json();
  } catch (error) {
    console.error('Error fetching meeting stats:', error);
    throw error;
  }
};

// Get resolution statistics
export const getResolutionStats = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/resolutions/stats?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch resolution stats');
    return response.json();
  } catch (error) {
    console.error('Error fetching resolution stats:', error);
    throw error;
  }
};

// Get committee statistics
export const getCommitteeStats = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/committees/stats?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch committee stats');
    return response.json();
  } catch (error) {
    console.error('Error fetching committee stats:', error);
    throw error;
  }
};

// Get upcoming meetings for user
export const getUpcomingMeetings = async (userId, limit = 5) => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/meetings/upcoming?userId=${userId}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch upcoming meetings');
    return response.json();
  } catch (error) {
    console.error('Error fetching upcoming meetings:', error);
    throw error;
  }
};

// Get pending tasks/resolutions for user
export const getPendingTasks = async (userId, limit = 5) => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/tasks/pending?userId=${userId}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch pending tasks');
    return response.json();
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    throw error;
  }
};

// Get notifications count
export const getNotificationStats = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/notifications/stats?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch notification stats');
    return response.json();
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    throw error;
  }
};

// Admin-specific stats
export const getAdminStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/admin/stats`);
    if (!response.ok) throw new Error('Failed to fetch admin stats');
    return response.json();
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// Secretary-specific stats  
export const getSecretaryStats = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/secretary/stats?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch secretary stats');
    return response.json();
  } catch (error) {
    console.error('Error fetching secretary stats:', error);
    throw error;
  }
};

// Chart data for analytics
export const getMeetingTrends = async (userId, period = '6months') => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/charts/meetings?userId=${userId}&period=${period}`);
    if (!response.ok) throw new Error('Failed to fetch meeting trends');
    return response.json();
  } catch (error) {
    console.error('Error fetching meeting trends:', error);
    throw error;
  }
};

export const getResolutionTrends = async (userId, period = '6months') => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/charts/resolutions?userId=${userId}&period=${period}`);
    if (!response.ok) throw new Error('Failed to fetch resolution trends');
    return response.json();
  } catch (error) {
    console.error('Error fetching resolution trends:', error);
    throw error;
  }
};

// Export all functions as default
export default {
  getDashboardStats,
  getRecentActivities,
  getMeetingStats,
  getResolutionStats,
  getCommitteeStats,
  getUpcomingMeetings,
  getPendingTasks,
  getNotificationStats,
  getAdminStats,
  getSecretaryStats,
  getMeetingTrends,
  getResolutionTrends
};