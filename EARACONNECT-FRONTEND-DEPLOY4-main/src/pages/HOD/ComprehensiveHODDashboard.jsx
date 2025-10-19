import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaBell, 
  FaFileAlt, 
  FaChartBar, 
  FaCog,
  FaHome,
  FaTachometerAlt,
  FaSignOutAlt
} from 'react-icons/fa';
import HODReportReview from '../../components/HOD/HODReportReview';
import HODProfileModal from '../../components/HOD/HODProfileModal';
import SimplePerformanceDashboard from '../../components/Dashboard/SimplePerformanceDashboard';
import AuthService from '../../services/authService';
import HODService from '../../services/hodService';

const ComprehensiveHODDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    pendingReports: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    averagePerformance: 0
  });

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await Promise.all([
          fetchNotifications(currentUser.id),
          fetchDashboardStats(currentUser.id)
        ]);
      }
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const notificationsData = await HODService.getHODNotifications(userId);
      setNotifications(notificationsData);
      const unreadCount = await HODService.getUnreadNotificationCount(userId);
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchDashboardStats = async (userId) => {
    try {
      const stats = await HODService.getDashboardStats(userId);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    // Update localStorage if needed
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/login';
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await HODService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatColor = (value, type) => {
    switch (type) {
      case 'performance':
        if (value >= 90) return 'text-green-600';
        if (value >= 80) return 'text-blue-600';
        if (value >= 70) return 'text-yellow-600';
        return 'text-red-600';
      case 'pending':
        if (value > 10) return 'text-red-600';
        if (value > 5) return 'text-yellow-600';
        return 'text-green-600';
      default:
        return 'text-gray-900';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HOD Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FaUserTie className="text-2xl text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Head of Delegation Dashboard</h1>
                <p className="text-sm text-gray-600">{user?.name || 'HOD Dashboard'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`p-2 rounded-lg transition-colors ${
                    activeTab === 'notifications' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaBell className="text-lg" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Profile */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <FaUser className="text-lg" />
                <span className="hidden sm:block text-sm">Profile</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="hidden sm:block text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaHome className="inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaFileAlt className="inline mr-2" />
              Report Review
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'performance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaChartBar className="inline mr-2" />
              Performance Dashboard
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaBell className="inline mr-2" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <FaFileAlt className="text-3xl text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                    <p className={`text-2xl font-bold ${getStatColor(dashboardStats.pendingReports, 'pending')}`}>
                      {dashboardStats.pendingReports}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <FaCheck className="text-3xl text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Approved This Month</p>
                    <p className="text-2xl font-bold text-green-600">
                      {dashboardStats.approvedThisMonth}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <FaTachometerAlt className="text-3xl text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Performance</p>
                    <p className={`text-2xl font-bold ${getStatColor(dashboardStats.averagePerformance, 'performance')}`}>
                      {dashboardStats.averagePerformance}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <FaBell className="text-3xl text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Unread Notifications</p>
                    <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Notifications */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
                </div>
                <div className="p-6">
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No notifications</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.slice(0, 5).map(notification => (
                        <div
                          key={notification.id}
                          className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                          }`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <FaBell className={`mt-1 ${notification.isRead ? 'text-gray-400' : 'text-blue-600'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                              {notification.title}
                            </p>
                            <p className={`text-xs ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <FaFileAlt className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Review Reports</p>
                          <p className="text-sm text-gray-600">
                            {dashboardStats.pendingReports} reports pending review
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('performance')}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <FaChartBar className="text-green-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">View Performance Dashboard</p>
                          <p className="text-sm text-gray-600">
                            Current average: {dashboardStats.averagePerformance}%
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <FaUser className="text-purple-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Update Profile</p>
                          <p className="text-sm text-gray-600">
                            Manage your personal information
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Review Tab */}
        {activeTab === 'reports' && (
          <HODReportReview user={user} />
        )}

        {/* Performance Dashboard Tab */}
        {activeTab === 'performance' && (
          <SimplePerformanceDashboard userRole="HOD" />
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">All Notifications</h3>
                <button
                  onClick={async () => {
                    try {
                      await HODService.markAllNotificationsAsRead(user.id);
                      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                      setUnreadCount(0);
                    } catch (error) {
                      console.error('Error marking all as read:', error);
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark All as Read
                </button>
              </div>
            </div>
            <div className="p-6">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <FaBell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You're all caught up! New notifications will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg cursor-pointer transition-colors ${
                        notification.isRead 
                          ? 'bg-gray-50 border border-gray-200' 
                          : 'bg-blue-50 border border-blue-200'
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <FaBell className={`mt-1 ${notification.isRead ? 'text-gray-400' : 'text-blue-600'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                        {notification.type && (
                          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                            notification.type === 'REPORT_SUBMISSION' ? 'bg-blue-100 text-blue-800' :
                            notification.type === 'REPORT_APPROVAL' ? 'bg-green-100 text-green-800' :
                            notification.type === 'REPORT_REJECTION' ? 'bg-red-100 text-red-800' :
                            notification.type === 'MEETING_INVITATION' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.type.replace('_', ' ').toLowerCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Profile Modal */}
      <HODProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default ComprehensiveHODDashboard;
