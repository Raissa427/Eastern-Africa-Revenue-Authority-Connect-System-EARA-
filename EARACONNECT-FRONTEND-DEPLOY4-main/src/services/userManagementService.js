// services/userManagementService.js
import { API_BASE } from './apiConfig';

export class UserManagementService {
  static async getAllUsers() {
    console.log("****************Base url***********",API_BASE)
    try {
      const response = await fetch(`${API_BASE}/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return empty array for graceful degradation instead of throwing
      if (error.message.includes('fetch')) {
        console.warn('API unavailable, returning empty user list');
        return [];
      }
      throw error;
    }
  }

  static async getUserById(id) {
    try {
      const response = await fetch(`${API_BASE}/users/${id}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  static async getUsersByRole(role) {
    try {
      const response = await fetch(`${API_BASE}/users/role/${role}`);
      if (!response.ok) throw new Error('Failed to fetch users by role');
      return await response.json();
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  static async getUsersByCountry(countryId) {
    try {
      const response = await fetch(`${API_BASE}/users/country/${countryId}`);
      if (!response.ok) throw new Error('Failed to fetch users by country');
      return await response.json();
    } catch (error) {
      console.error('Error fetching users by country:', error);
      throw error;
    }
  }

  static async createUser(userData) {
    try {
      // Validate required fields
      if (!userData.email || !userData.name || !userData.role) {
        throw new Error('Email, name, and role are required');
      }

      // Validate role-specific requirements
      if (userData.role === 'SECRETARY' && !userData.country?.id) {
        throw new Error('Country is required for SECRETARY role');
      }

      if (['CHAIR', 'SUBCOMMITTEE_MEMBER'].includes(userData.role) && !userData.subcommittee?.id) {
        throw new Error('Subcommittee is required for CHAIR and SUBCOMMITTEE_MEMBER roles');
      }

      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(id, userData) {
    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async resendCredentials(userId) {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/resend-credentials`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to resend credentials');
      }

      return true;
    } catch (error) {
      console.error('Error resending credentials:', error);
      throw error;
    }
  }

  // Validation helpers
  static validateUserData(userData) {
    const errors = [];

    if (!userData.email || !userData.email.trim()) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!userData.name || !userData.name.trim()) {
      errors.push('Name is required');
    }

    if (!userData.role) {
      errors.push('Role is required');
    }

    // Role-specific validation
    if (userData.role === 'SECRETARY' && !userData.country?.id) {
      errors.push('Country is required for Secretary role');
    }

    if (['CHAIR', 'SUBCOMMITTEE_MEMBER'].includes(userData.role) && !userData.subcommittee?.id) {
      errors.push('Subcommittee is required for Chair and Subcommittee Member roles');
    }

    return errors;
  }

  static getRoleDisplayName(role) {
    const roleNames = {
      'ADMIN': 'System Administrator',
      'SECRETARY': 'Secretary',
      'CHAIR': 'Committee Chair',
      'HOD': 'Head of Department',
      'COMMISSIONER_GENERAL': 'Commissioner General',
      'SUBCOMMITTEE_MEMBER': 'Subcommittee Member'
    };
    return roleNames[role] || role;
  }

  static getAvailableRoles() {
    return [
      { value: 'SECRETARY', label: 'Secretary' },
      { value: 'CHAIR', label: 'Committee Chair' },
      { value: 'HOD', label: 'Head of Department' },
      { value: 'COMMISSIONER_GENERAL', label: 'Commissioner General' },
      { value: 'SUBCOMMITTEE_MEMBER', label: 'Subcommittee Member' }
    ];
  }
}

export default UserManagementService;