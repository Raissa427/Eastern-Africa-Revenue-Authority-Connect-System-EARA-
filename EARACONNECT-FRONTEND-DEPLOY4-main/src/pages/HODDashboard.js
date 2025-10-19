import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  HomeIcon,
  DocumentTextIcon,
  UserIcon,
  BellIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';

// Import HOD components
import ReportReview from '../components/HOD/ReportReview';
import ProfileUpdate from '../components/HOD/ProfileUpdate';
import Notifications from '../components/HOD/Notifications';
import SimplePerformanceDashboard from '../components/Dashboard/SimplePerformanceDashboard';

// Import context and hooks
import { HODProvider, useHOD } from '../context/HODContext';
import { DASHBOARD_TABS } from '../utils/constants';

// Main HOD Dashboard Component
const HODDashboardContent = () => {
  const [activeTab, setActiveTab] = useState(DASHBOARD_TABS.OVERVIEW);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Use HOD context
  const {
    user,
    reports,
    notifications,
    unreadCount,
    loading,
    fetchProfile,
    fetchReports,
    fetchNotifications
  } = useHOD();

  // Initialize dashboard data
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await Promise.all([
          fetchProfile(),
          fetchReports(),
          fetchNotifications()
        ]);
      } catch (error) {
        console.error('Error initializing HOD dashboard:', error);
        toast.error('Failed to load dashboard data');
      }
    };

    initializeDashboard();
  }, [fetchProfile, fetchReports, fetchNotifications]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    window.location.href = '/login';
  };

  // Navigation items
  const navigationItems = [
    {
      id: DASHBOARD_TABS.OVERVIEW,
      name: 'Overview',
      icon: HomeIcon,
      description: 'Dashboard summary and quick actions'
    },
    {
      id: DASHBOARD_TABS.REPORTS,
      name: 'Report Review',
      icon: DocumentTextIcon,
      description: 'Review and approve submitted reports',
      badge: reports.filter(r => r.status === 'pending').length
    },
    {
      id: DASHBOARD_TABS.NOTIFICATIONS,
      name: 'Notifications',
      icon: unreadCount > 0 ? BellSolidIcon : BellIcon,
      description: 'Meeting notifications and alerts',
      badge: unreadCount
    },
    {
      id: DASHBOARD_TABS.PERFORMANCE,
      name: 'Performance Dashboard',
      icon: ChartBarIcon,
      description: 'Analytics and performance metrics'
    },
    {
      id: DASHBOARD_TABS.PROFILE,
      name: 'Profile',
      icon: UserIcon,
      description: 'Update your personal information'
    }
  ];

  // Overview component
  const OverviewComponent = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'HOD'}!</h1>
            <p className="text-blue-100 mt-1">Head of Delegation Dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Last login</p>
            <p className="text-white font-medium">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reports</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BellIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unread Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.length > 0 
                  ? Math.round(reports.reduce((acc, r) => acc + (r.performance || 0), 0) / reports.length)
                  : 0
                }%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab(DASHBOARD_TABS.REPORTS)}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Review Reports</p>
                    <p className="text-sm text-gray-600">
                      {reports.filter(r => r.status === 'pending').length} reports pending review
                    </p>
                  </div>
                </div>
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => setActiveTab(DASHBOARD_TABS.PERFORMANCE)}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">View Performance Dashboard</p>
                    <p className="text-sm text-gray-600">Analytics and performance metrics</p>
                  </div>
                </div>
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {notifications.slice(0, 3).map((notification, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <BellIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.date || notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            
            {notifications.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case DASHBOARD_TABS.OVERVIEW:
        return <OverviewComponent />;
      case DASHBOARD_TABS.REPORTS:
        return <ReportReview />;
      case DASHBOARD_TABS.PROFILE:
        return <ProfileUpdate />;
      case DASHBOARD_TABS.NOTIFICATIONS:
        return <Notifications />;
      case DASHBOARD_TABS.PERFORMANCE:
        return <SimplePerformanceDashboard />;
      default:
        return <OverviewComponent />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HOD Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">HOD Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      activeTab === item.id ? 'text-blue-700' : 'text-gray-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && item.badge > 0 && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      activeTab === item.id
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'H'}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'HOD User'}
              </p>
              <p className="text-xs text-gray-500">Head of Delegation</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:pl-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white shadow-sm border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {navigationItems.find(item => item.id === activeTab)?.name || 'Dashboard'}
          </h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>

        {/* Page Content */}
        <main className="p-6">
          {renderTabContent()}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Main HOD Dashboard with Provider
const HODDashboard = () => {
  return (
    <HODProvider>
      <HODDashboardContent />
    </HODProvider>
  );
};

export default HODDashboard;
