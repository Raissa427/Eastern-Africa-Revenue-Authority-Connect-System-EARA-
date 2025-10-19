import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import HODPermissionService from '../services/hodPermissionService';
import AuthService from '../services/authService';
import {
  HomeIcon,
  DocumentTextIcon,
  UserIcon,
  BellIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  BellIcon as BellSolidIcon,
  DocumentTextIcon as DocumentSolidIcon,
  ChartBarIcon as ChartSolidIcon
} from '@heroicons/react/24/solid';

// Import HOD Chair components
import HodReportReview from '../components/HODChair/HodReportReview';
import HodProfile from '../components/HODChair/HodProfile';
import HodNotifications from '../components/HODChair/HodNotifications';
import HodPerformanceDashboard from '../components/HODChair/HodPerformanceDashboard';

// HOD Chair Dashboard Tabs
const DASHBOARD_TABS = {
  OVERVIEW: 'overview',
  REPORTS: 'reports',
  PERFORMANCE: 'performance',
  NOTIFICATIONS: 'notifications',
  PROFILE: 'profile'
};

const HodChairDashboard = () => {
  const [activeTab, setActiveTab] = useState(DASHBOARD_TABS.OVERVIEW);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get current user and check HOD privileges
  const currentUser = AuthService.getCurrentUser();
  const hasHODPrivileges = HODPermissionService.hasHODPrivileges(currentUser);
  
  // Redirect if user doesn't have HOD privileges
  useEffect(() => {
    if (!hasHODPrivileges) {
      window.location.href = '/dashboard';
      return;
    }
  }, [hasHODPrivileges]);
  
  const [user, setUser] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    pendingReports: 0,
    unreadNotifications: 0,
    avgPerformance: 0,
    activeSubcommittees: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch user data and dashboard stats
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Fetch user profile
        const userResponse = await fetch('/api/hod/profile');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData || {});
        } else {
          setUser({});
        }

        // Fetch dashboard statistics
        const statsResponse = await fetch('/api/hod/dashboard/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setDashboardStats(statsData || {
            pendingReports: 0,
            unreadNotifications: 0,
            avgPerformance: 0,
            activeSubcommittees: 0
          });
        } else {
          setDashboardStats({
            pendingReports: 0,
            unreadNotifications: 0,
            avgPerformance: 0,
            activeSubcommittees: 0
          });
        }

      } catch (error) {
        console.error('Error initializing HOD dashboard:', error);
        toast.error('Failed to load dashboard data');
        // Set default values on error
        setUser({});
        setDashboardStats({
          pendingReports: 0,
          unreadNotifications: 0,
          avgPerformance: 0,
          activeSubcommittees: 0
        });
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  // Navigation items with HOD-specific styling
  const navigationItems = [
    {
      id: DASHBOARD_TABS.OVERVIEW,
      name: 'Dashboard Overview',
      title: 'Dashboard Overview',
      icon: HomeIcon,
      description: 'Executive summary and quick actions',
      color: 'text-blue-600'
    },
    {
      id: DASHBOARD_TABS.REPORTS,
      name: 'Report Review',
      title: 'Report Review',
      icon: DocumentTextIcon,
      solidIcon: DocumentSolidIcon,
      description: 'Review and approve submitted reports',
      badge: dashboardStats?.pendingReports || 0,
      color: 'text-green-600'
    },
    {
      id: DASHBOARD_TABS.PERFORMANCE,
      name: 'Performance Analytics',
      title: 'Performance Analytics',
      icon: ChartBarIcon,
      solidIcon: ChartSolidIcon,
      description: 'Advanced analytics and insights',
      color: 'text-purple-600'
    },
    {
      id: DASHBOARD_TABS.NOTIFICATIONS,
      name: 'Notifications',
      title: 'Notifications',
      icon: BellIcon,
      solidIcon: BellSolidIcon,
      description: 'Meeting notifications and alerts',
      badge: dashboardStats?.unreadNotifications || 0,
      color: 'text-orange-600'
    },
    {
      id: DASHBOARD_TABS.PROFILE,
      name: 'Profile Settings',
      title: 'Profile Settings',
      icon: UserIcon,
      description: 'Update your personal information',
      color: 'text-indigo-600'
    }
  ];

  // Overview component with HOD-specific layout
  const OverviewComponent = () => (
    <div className="space-y-8">
      {/* Welcome Section with HOD branding */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-white bg-opacity-20 rounded-xl">
              <ShieldCheckIcon className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {currentUser?.name || 'HOD Chair'}!</h1>
              <p className="text-blue-100 text-lg mt-2">{HODPermissionService.getUserRoleDisplay(currentUser)} - Committee Oversight</p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 text-blue-200 mr-2" />
                  <span className="text-blue-200 text-sm">
                    Last login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}
                  </span>
                </div>
                <div className="h-4 w-px bg-blue-400"></div>
                <span className="text-blue-200 text-sm">
                  {user?.country || 'Regional Office'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-xl p-4">
              <p className="text-blue-100 text-sm">Current Time</p>
              <p className="text-white font-bold text-lg">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-blue-200 text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-red-500 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-4 bg-red-100 rounded-xl">
              <DocumentTextIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Pending Reviews</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats?.pendingReports || 0}</p>
              <p className="text-sm text-red-600 mt-1 font-medium">Require immediate attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-blue-500 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-4 bg-blue-100 rounded-xl">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Average Performance</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats?.avgPerformance || 0}%</p>
              <p className="text-sm text-blue-600 mt-1 font-medium">Across all committees</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-orange-500 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-4 bg-orange-100 rounded-xl">
              <BellIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">New Notifications</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats?.unreadNotifications || 0}</p>
              <p className="text-sm text-orange-600 mt-1 font-medium">Meeting updates</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-green-500 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-4 bg-green-100 rounded-xl">
              <UserIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Subcommittees</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats?.activeSubcommittees || 0}</p>
              <p className="text-sm text-green-600 mt-1 font-medium">Currently reporting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <DocumentTextIcon className="h-6 w-6 text-blue-600 mr-3" />
            Priority Actions
          </h3>
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab(DASHBOARD_TABS.REPORTS)}
              className="w-full text-left p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-gray-900">Review Pending Reports</p>
                    <p className="text-sm text-gray-600">
                      {dashboardStats?.pendingReports || 0} reports awaiting your review
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {(dashboardStats?.pendingReports || 0) > 0 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-3">
                      Urgent
                    </span>
                  )}
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab(DASHBOARD_TABS.PERFORMANCE)}
              className="w-full text-left p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <ChartBarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-gray-900">View Performance Analytics</p>
                    <p className="text-sm text-gray-600">
                      Comprehensive insights and trend analysis
                    </p>
                  </div>
                </div>
                <svg className="h-5 w-5 text-gray-400 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => setActiveTab(DASHBOARD_TABS.NOTIFICATIONS)}
              className="w-full text-left p-6 rounded-xl border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <BellIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-gray-900">Check Notifications</p>
                    <p className="text-sm text-gray-600">
                      {dashboardStats?.unreadNotifications || 0} unread notifications
                    </p>
                  </div>
                </div>
                {(dashboardStats?.unreadNotifications || 0) > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {dashboardStats?.unreadNotifications || 0}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <ClockIcon className="h-6 w-6 text-green-600 mr-3" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">New report submitted</p>
                <p className="text-xs text-gray-500 mt-1">IT Committee - 2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl">
              <div className="p-2 bg-green-100 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Performance improved</p>
                <p className="text-xs text-gray-500 mt-1">Customs Revenue - 4 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-xl">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BellIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Meeting scheduled</p>
                <p className="text-xs text-gray-500 mt-1">Tomorrow at 2:00 PM</p>
              </div>
            </div>
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
        return <HodReportReview />;
      case DASHBOARD_TABS.PERFORMANCE:
        return <HodPerformanceDashboard />;
      case DASHBOARD_TABS.NOTIFICATIONS:
        return <HodNotifications />;
      case DASHBOARD_TABS.PROFILE:
        return <HodProfile />;
      default:
        return <OverviewComponent />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading HOD Dashboard...</h2>
          <p className="text-gray-600">Initializing committee oversight system</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex">
      {/* Sidebar with HOD-specific styling */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0 fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transition-transform duration-300 ease-in-out border-r border-gray-200`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">HOD Dashboard</h1>
              <p className="text-blue-100 text-sm">Committee Oversight</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-blue-200 p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = activeTab === item.id && item.solidIcon ? item.solidIcon : item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left group flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700 shadow-md border-2 border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-2 border-transparent hover:border-gray-200'
                  }`}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                >
                  <IconComponent
                    className={`mr-4 h-6 w-6 ${
                      activeTab === item.id ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{item.name}</span>
                      {item.badge && item.badge > 0 && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          activeTab === item.id
                            ? 'bg-blue-200 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 w-full p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'H'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {currentUser?.name || 'HOD User'}
              </p>
              <p className="text-xs text-blue-600 font-medium">{HODPermissionService.getUserRoleDisplay(currentUser)}</p>
              <p className="text-xs text-gray-500">{currentUser?.country || currentUser?.subcommittee?.name || 'Head of Delegation'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Logout"
              aria-label="Logout"
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
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">
            {navigationItems.find(item => item.id === activeTab)?.title || navigationItems.find(item => item.id === activeTab)?.name || 'HOD Dashboard'}
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
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

export default HodChairDashboard;
