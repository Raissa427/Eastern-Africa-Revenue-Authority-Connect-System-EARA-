/**
 * HOD Permission Service
 * Handles checking if a user has HOD (Head of Delegation) privileges
 * This includes users with HOD role and Chair/Vice Chair of "Head Of Delegation" subcommittee
 */

const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:8081/api';

export class HODPermissionService {
  
  /**
   * Check if the current user has HOD privileges
   * @param {Object} user - Current user object
   * @returns {boolean} - True if user has HOD privileges
   */
  static hasHODPrivileges(user) {
    if (!user) return false;

    // Only Chair or Vice Chair of Head Of Delegation subcommittee have HOD privileges
    // There is no direct HOD role in this system
    if ((user.role === 'CHAIR' || user.role === 'VICE_CHAIR') && user.subcommittee) {
      return this.isHeadOfDelegationSubcommittee(user.subcommittee);
    }

    return false;
  }

  /**
   * Check if a subcommittee is the Head Of Delegation subcommittee
   * @param {Object} subcommittee - Subcommittee object
   * @returns {boolean} - True if it's the Head Of Delegation subcommittee
   */
  static isHeadOfDelegationSubcommittee(subcommittee) {
    if (!subcommittee) return false;
    
    // Check by name (case insensitive)
    return subcommittee.name && 
           subcommittee.name.toLowerCase() === 'head of delegation';
  }

  /**
   * Get the appropriate dashboard route for a user
   * @param {Object} user - User object
   * @returns {string} - Dashboard route
   */
  static getDashboardRoute(user) {
    if (!user) return '/dashboard';

    if (this.hasHODPrivileges(user)) {
      return '/hod/dashboard';
    }

    switch (user.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'SECRETARY':
        return '/secretary/dashboard';
      case 'CHAIR':
      case 'VICE_CHAIR':
        return '/chair/dashboard';
      case 'COMMISSIONER_GENERAL':
        return '/commissioner/dashboard';
      case 'SUBCOMMITTEE_MEMBER':
      case 'COMMITTEE_MEMBER':
      case 'COMMITTEE_SECRETARY':
      case 'DELEGATION_SECRETARY':
        return '/member/dashboard';
      default:
        return '/dashboard';
    }
  }

  /**
   * Get user role display name considering HOD privileges
   * @param {Object} user - User object
   * @returns {string} - Display role name
   */
  static getUserRoleDisplay(user) {
    if (!user) return 'Unknown';

    if (this.hasHODPrivileges(user)) {
      // Only Chair/Vice Chair of Head of Delegation can have HOD privileges
      return 'Head of Delegation';
    }

    switch (user.role) {
      case 'ADMIN':
        return 'Administrator';
      case 'SECRETARY':
        return 'Secretary';
      case 'CHAIR':
        return 'Chair';
      case 'VICE_CHAIR':
        return 'Vice Chair';
      case 'HOD':
        return 'Head of Delegation'; // This role should not exist but kept for safety
      case 'COMMISSIONER_GENERAL':
        return 'Commissioner General';
      case 'SUBCOMMITTEE_MEMBER':
        return 'Subcommittee Member';
      case 'COMMITTEE_MEMBER':
        return 'Committee Member';
      case 'COMMITTEE_SECRETARY':
        return 'Committee Secretary';
      case 'DELEGATION_SECRETARY':
        return 'Delegation Secretary';
      default:
        return user.role || 'Unknown';
    }
  }

  /**
   * Check if user can review reports (HOD privilege)
   * @param {Object} user - User object
   * @returns {boolean} - True if user can review reports
   */
  static canReviewReports(user) {
    return this.hasHODPrivileges(user);
  }

  /**
   * Check if user can access HOD dashboard
   * @param {Object} user - User object
   * @returns {boolean} - True if user can access HOD dashboard
   */
  static canAccessHODDashboard(user) {
    return this.hasHODPrivileges(user);
  }

  /**
   * Get HOD navigation items for sidebar
   * @param {Object} user - User object
   * @returns {Array} - Navigation items if user has HOD privileges
   */
  static getHODNavigationItems(user) {
    if (!this.hasHODPrivileges(user)) {
      return [];
    }

    return [
      {
        id: 'overview',
        name: 'Dashboard Overview',
        path: '/hod/dashboard',
        icon: 'home'
      },
      {
        id: 'reports',
        name: 'Report Review',
        path: '/hod/reports',
        icon: 'document'
      },
      {
        id: 'performance',
        name: 'Performance Analytics',
        path: '/hod/performance',
        icon: 'chart'
      },
      {
        id: 'notifications',
        name: 'Notifications',
        path: '/hod/notifications',
        icon: 'bell'
      },
      {
        id: 'profile',
        name: 'Profile Settings',
        path: '/hod/profile',
        icon: 'user'
      }
    ];
  }

  /**
   * Verify HOD privileges with backend (for security-critical operations)
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} - True if user has HOD privileges
   */
  static async verifyHODPrivileges(userId) {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/hod-privileges`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.hasHODPrivileges || false;
      }
      return false;
    } catch (error) {
      console.error('Error verifying HOD privileges:', error);
      return false;
    }
  }
}

export default HODPermissionService;
