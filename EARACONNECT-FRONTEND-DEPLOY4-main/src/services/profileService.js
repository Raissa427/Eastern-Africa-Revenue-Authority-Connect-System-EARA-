// services/profileService.js
import { API_BASE } from './apiConfig';

export class ProfileService {
  
  /**
   * Upload profile picture for a user
   * @param {number} userId - User ID
   * @param {File} file - Profile picture file
   * @returns {Promise} API response
   */
  static async uploadProfilePicture(userId, file) {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`${API_BASE}/profile/${userId}/picture`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload profile picture');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  /**
   * Delete profile picture for a user
   * @param {number} userId - User ID
   * @returns {Promise} API response
   */
  static async deleteProfilePicture(userId) {
    try {
      const response = await fetch(`${API_BASE}/profile/${userId}/picture`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete profile picture');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error;
    }
  }

  /**
   * Get profile picture URL for a user
   * @param {number} userId - User ID
   * @returns {Promise} API response with profile picture URL
   */
  static async getProfilePictureUrl(userId) {
    try {
      const response = await fetch(`${API_BASE}/profile/${userId}/picture`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get profile picture URL');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting profile picture URL:', error);
      throw error;
    }
  }

  /**
   * Get user profile by email
   * @param {string} email - User email
   * @returns {Promise} API response with user profile
   */
  static async getUserProfile(email) {
    try {
      const response = await fetch(`${API_BASE}/profile/user?email=${encodeURIComponent(email)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} API response with updated profile
   */
  static async updateUserProfile(userId, profileData) {
    try {
      const response = await fetch(`${API_BASE}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async changePassword(userId, passwordData) {
    try {
      const response = await fetch(`${API_BASE}/profile/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      return await response.json();
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Get full profile picture URL
   * @param {string} profilePictureUrl - Profile picture URL from API
   * @returns {string} Full URL for the profile picture
   */
  static getFullProfilePictureUrl(profilePictureUrl) {
    if (!profilePictureUrl) {
      return null;
    }
    
    // If it's already a full URL, return as is
    if (profilePictureUrl.startsWith('http')) {
      return profilePictureUrl;
    }
    
    // If it's a relative path, prepend the backend URL
    if (profilePictureUrl.startsWith('/')) {
      return `${API_BASE.replace('/api','')}${profilePictureUrl}`;
    }
    
    return profilePictureUrl;
  }

  /**
   * Validate profile picture file
   * @param {File} file - File to validate
   * @returns {Object} Validation result with isValid and error message
   */
  static validateProfilePictureFile(file) {
    // Check if file exists
    if (!file) {
      return { isValid: false, error: 'Please select a file' };
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Please select a valid image file' };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'Image size must be less than 5MB' };
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      return { isValid: false, error: 'Only JPG, JPEG, PNG, GIF, and WebP files are allowed' };
    }

    return { isValid: true, error: null };
  }
}

export default ProfileService;
