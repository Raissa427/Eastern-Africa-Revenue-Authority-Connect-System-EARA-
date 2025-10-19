import React, { useState, useEffect } from 'react';
import { API_BASE } from './services/apiConfig';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HODPermissionService from './services/hodPermissionService';

// Import Global Styles and Theme
import './styles/GlobalStyles.css';
import './styles/Theme.css';
import { ThemeProvider } from './context/ThemeContext';

// Components and Layout
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';

// Pages - Keep your existing imports
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Dashboards - Keep existing
import AdminDashboard from './pages/AdminDashboard';
import EnhancedAdminDashboard from './pages/EnhancedAdminDashboard';
import SecretaryDashboard from './pages/SecretaryDashboard';
import ChairDashboard from './pages/ChairDashboard';
import EnhancedChairDashboard from './pages/ChairDashboard/EnhancedChairDashboard';
import EnhancedHODDashboard from './pages/EnhancedHODDashboard';
import EnhancedCommissionerDashboard from './pages/EnhancedCommissionerDashboard';
import EnhancedMemberDashboard from './pages/EnhancedMemberDashboard';
import MemberDashboard from './pages/MemberDashboard';

// Committee Pages
import CommitteeList from './pages/Committees/CommitteeList';
import CommitteeForm from './pages/Committees/CommitteeForm';

// Country Pages
import CountryList from './pages/Countries/CountryList';
import CountryForm from './pages/Countries/CountryForm';

// Member Pages
import MemberList from './pages/CountryCommitteeMembers/MemberList';
import MemberForm from './pages/CountryCommitteeMembers/MemberForm';

// Sub-Committee Member Pages
import SubMemberList from './pages/SubCommitteeMembers/MemberList';
import SubMemberForm from './pages/SubCommitteeMembers/MemberForm';
import SubMemberView from './pages/SubCommitteeMembers/MemberView';

// Meeting Pages - Keep existing ones
import CreateMeeting from './pages/Meetings/CreateMeeting';
import TakeMinutes from './pages/Minutes/TakeMinutes';
import ArchiveMeetings from './pages/Meetings/ArchiveMeetings';

// Invitation Pages
import InvitationManager from './pages/InvitationManager/InvitationManager';
import SendInvitations from './pages/InvitationManager/SendInvitations';
import EnhancedSendInvitations from './pages/InvitationManager/EnhancedSendInvitations';

// Enhanced Secretary Portal Components
import ComprehensiveSecretaryDashboard from './pages/SecretaryPortal/ComprehensiveSecretaryDashboard';
import EnhancedMeetingInvitationManager from './pages/Meetings/EnhancedMeetingInvitationManager';
import EnhancedResolutionWorkflow from './pages/Resolutions/EnhancedResolutionWorkflow';
import QuickTestInterface from './pages/SecretaryPortal/QuickTestInterface';
import TestMemberCounts from './pages/TestMemberCounts';
import EmailTestComponent from './components/EmailTestComponent';
import InvitationTestComponent from './components/InvitationTestComponent';
import ButtonTestComponent from './components/ButtonTestComponent';

// Other Pages
import Notifications from './pages/Notifications/Notifications';

// EARAPerformanceDashboard
import EARAPerformanceDashboardPage from './pages/EARAPerformanceDashboard/EARAPerformanceDashboardPage';
// SimplePerformanceDashboard
import SimplePerformanceDashboardPage from './pages/SimplePerformanceDashboard/SimplePerformanceDashboardPage';
// Test Simple Dashboard
import TestSimpleDashboard from './pages/TestSimpleDashboard';

// User Profile
import UserProfile from './pages/UserProfile/UserProfile';

// Enhanced Authentication Service (CREATE THIS FILE)
// Create: src/services/authService.js
const AuthService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        return data;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  },

  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('user');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (isAuthenticated && userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  isAuthenticated: () => {
    const user = AuthService.getCurrentUser();
    return user && user.id;
  }
};

// Role-based access control configuration
const ROLE_PERMISSIONS = {
  ADMIN: {
    dashboards: ['/admin/dashboard'],
    routes: [
      '/dashboard', '/admin/dashboard', '/committees', '/countries', 
      '/members', '/sub-committee-members', '/meetings', '/invitations', 
      '/notifications', '/resolutions', '/reports'
    ]
  },
  SECRETARY: {
    dashboards: ['/secretary/dashboard'],
    routes: [
      '/dashboard', '/secretary/dashboard', '/committees', '/countries',
      '/members', '/sub-committee-members', '/meetings', '/minutes',
      '/resolutions', '/invitations', '/notifications', '/meetings/archive'
    ]
  },
  CHAIR: {
    dashboards: ['/chair/dashboard', '/hod/dashboard'], // Allow HOD dashboard for Chair of Head of Delegation
    routes: [
      '/dashboard', '/chair/dashboard', '/hod/dashboard', '/committees', '/members',
      '/sub-committee-members', '/meetings', '/invitations', '/notifications',
      '/reports', '/resolutions', '/hod/reports', '/hod/profile', '/hod/notifications', '/countries'
    ]
  },
  VICE_CHAIR: {
    dashboards: ['/chair/dashboard', '/hod/dashboard'], // Allow HOD dashboard for Vice Chair of Head of Delegation
    routes: [
      '/dashboard', '/chair/dashboard', '/hod/dashboard', '/committees', '/members',
      '/sub-committee-members', '/meetings', '/invitations', '/notifications',
      '/reports', '/resolutions', '/hod/reports', '/hod/profile', '/hod/notifications', '/countries'
    ]
  },
  // HOD role removed - only Chair of Head of Delegation has HOD privileges
  COMMISSIONER_GENERAL: {
    dashboards: ['/commissioner/dashboard'],
    routes: [
      '/dashboard', '/commissioner/dashboard', '/committees', '/countries',
      '/members', '/sub-committee-members', '/meetings', '/invitations', 
      '/notifications', '/reports', '/resolutions'
    ]
  },
  SUBCOMMITTEE_MEMBER: {
    dashboards: ['/member/dashboard'],
    routes: ['/dashboard', '/member/dashboard', '/committees', '/notifications', '/reports', '/meetings', '/countries']
  },
  COMMITTEE_MEMBER: {
    dashboards: ['/member/dashboard'],
    routes: ['/dashboard', '/member/dashboard', '/committees', '/notifications', '/reports', '/meetings', '/countries']
  },
  COMMITTEE_SECRETARY: {
    dashboards: ['/member/dashboard'],
    routes: [
      '/dashboard', '/member/dashboard', '/committees', '/members',
      '/sub-committee-members', '/meetings', '/invitations', '/notifications', '/reports', '/countries'
    ]
  },
  DELEGATION_SECRETARY: {
    dashboards: ['/member/dashboard'],
    routes: [
      '/dashboard', '/member/dashboard', '/committees', '/members',
      '/sub-committee-members', '/meetings', '/invitations', '/notifications', '/reports', '/countries'
    ]
  }
};

// Enhanced Protected Route Component
const ProtectedRoute = ({ children, requiredPermissions = [], user }) => {
  if (!AuthService.isAuthenticated() || !user?.role) {
    return <Navigate to="/login" replace />;
  }

  const userPermissions = ROLE_PERMISSIONS[user.role];
  
  if (!userPermissions) {
    console.warn(`Unknown role: ${user.role}`);
    return <Navigate to="/login" replace />;
  }

  // Check if user has required permissions
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.routes.some(route => 
        route === permission || route.startsWith(permission)
      )
    );
    
    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Dashboard Router Component
const DashboardRouter = ({ user }) => {
  const getDefaultDashboard = (user) => {
    // Check if user has HOD privileges first (Chair of Head of Delegation)
    if (HODPermissionService.hasHODPrivileges(user)) {
      return '/hod/dashboard';
    }
    
    const permissions = ROLE_PERMISSIONS[user.role];
    return permissions?.dashboards[0] || '/dashboard';
  };

  return <Navigate to={getDefaultDashboard(user)} replace />;
};

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize authentication state using enhanced AuthService
    const initializeAuth = () => {
      try {
        const isAuth = AuthService.isAuthenticated();
        const currentUser = AuthService.getCurrentUser();
        
        if (isAuth && currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing authentication:', error);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'isAuthenticated' || e.key === 'user') {
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Show beautiful loading screen while checking authentication
  if (loading) {
    return <LoadingScreen message="Initializing Secretary Portal..." />;
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login />
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/*" 
          element={
            isAuthenticated && user ? (
              <Layout user={user}>
                <Routes>
                  {/* Root redirect */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Dashboard Routes */}
                  <Route 
                    path="/dashboard" 
                    element={<DashboardRouter user={user} />} 
                  />
                  
                  {/* Role-specific Dashboards */}
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/admin/dashboard']}>
                        <EnhancedAdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/secretary/dashboard" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/secretary/dashboard']}>
                        <ComprehensiveSecretaryDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/chair/dashboard" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/chair/dashboard']}>
                        <EnhancedChairDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/hod/dashboard" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/hod/dashboard']}>
                        <EnhancedHODDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/commissioner/dashboard" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/commissioner/dashboard']}>
                        <EnhancedCommissionerDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/member/dashboard" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/member/dashboard']}>
                        <EnhancedMemberDashboard />
                      </ProtectedRoute>
                    } 
                  />

                                                    {/* EARAPerformanceDashboard Route */}
                                  <Route
                                    path="/eara-performance-dashboard"
                                    element={
                                      <ProtectedRoute user={user} requiredPermissions={['/eara-performance-dashboard']}>
                                        <EARAPerformanceDashboardPage />
                                      </ProtectedRoute>
                                    }
                                  />
                                  {/* SimplePerformanceDashboard Route */}
                                  <Route
                                    path="/simple-performance-dashboard"
                                    element={<SimplePerformanceDashboardPage />}
                                  />
                                  {/* Test Simple Dashboard Route */}
                                  <Route
                                    path="/test-simple-dashboard"
                                    element={<TestSimpleDashboard />}
                                  />

                  {/* Committee Routes */}
                  <Route 
                    path="/committees" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/committees']}>
                        <CommitteeList />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/committees/new" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/committees']}>
                        <CommitteeForm />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/committees/:id/edit" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/committees']}>
                        <CommitteeForm />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Country Routes */}
                  <Route 
                    path="/countries" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/countries']}>
                        <CountryList />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/countries/new" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/countries']}>
                        <CountryForm />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/countries/:id/edit" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/countries']}>
                        <CountryForm />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Committee Members Routes */}
                  <Route 
                    path="/members" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/members']}>
                        <MemberList />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/members/new" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/members']}>
                        <MemberForm />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/members/:id/edit" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/members']}>
                        <MemberForm />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Sub-Committee Members Routes */}
                  <Route 
                    path="/sub-committee-members" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/sub-committee-members']}>
                        <SubMemberList />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/sub-committee-members/new" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/sub-committee-members']}>
                        <SubMemberForm />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/sub-committee-members/:id/edit" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/sub-committee-members']}>
                        <SubMemberForm />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/sub-committee-members/:id" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/sub-committee-members']}>
                        <SubMemberView />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Meeting Routes - Keep existing for now */}
                  <Route 
                    path="/meetings/create" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/meetings']}>
                        <CreateMeeting />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/meetings/archive" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/meetings']}>
                        <ArchiveMeetings />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Invitation Routes */}
                  <Route 
                    path="/invitations" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/invitations']}>
                        <InvitationManager />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/invitations/send" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/invitations']}>
                        <EnhancedSendInvitations />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/invitations/send/original" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/invitations']}>
                        <SendInvitations />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Test Route for Member Counts */}
                  <Route 
                    path="/test-member-counts" 
                    element={<TestMemberCounts />}
                  />
                  
                  {/* Email Test Route */}
                  <Route 
                    path="/email-test" 
                    element={<EmailTestComponent />}
                  />
                  
                  {/* Invitation Test Route */}
                  <Route 
                    path="/invitation-test" 
                    element={<InvitationTestComponent />}
                  />
                  
                  {/* Button Test Route */}
                  <Route 
                    path="/button-test" 
                    element={<ButtonTestComponent />}
                  />
                  
                  {/* User Profile Route */}
                  <Route 
                    path="/profile" 
                    element={<UserProfile />}
                  />
                  
                  <Route 
                    path="/invitations/manage" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/invitations']}>
                        <InvitationManager />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Enhanced Secretary Portal Routes */}
                  <Route 
                    path="/secretary/meeting-invitations" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/secretary/dashboard']}>
                        <EnhancedMeetingInvitationManager />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/secretary/resolution-assignment" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/secretary/dashboard']}>
                        <EnhancedResolutionWorkflow />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/meeting-invitations/enhanced" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/invitations']}>
                        <EnhancedMeetingInvitationManager />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/resolutions/enhanced" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/resolutions']}>
                        <EnhancedResolutionWorkflow />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/secretary/quick-test" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/secretary/dashboard']}>
                        <QuickTestInterface />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/test-interface" 
                    element={
                      <QuickTestInterface />
                    } 
                  />

                  {/* Minutes Routes */}
                  <Route 
                    path="/minutes/take" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/minutes']}>
                        <TakeMinutes />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Notifications Routes */}
                  <Route 
                    path="/notifications" 
                    element={
                      <ProtectedRoute user={user} requiredPermissions={['/notifications']}>
                        <Notifications />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Fallback - redirect to appropriate dashboard */}
                  <Route 
                    path="*" 
                    element={<DashboardRouter user={user} />} 
                  />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;