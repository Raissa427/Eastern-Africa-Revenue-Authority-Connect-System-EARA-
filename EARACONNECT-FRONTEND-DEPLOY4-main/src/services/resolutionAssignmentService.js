// services/resolutionAssignmentService.js
const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:8081/api';

export class ResolutionAssignmentService {
  static async getAllResolutions() {
    try {
      const response = await fetch(`${API_BASE}/resolutions`);
      if (!response.ok) throw new Error('Failed to fetch resolutions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching resolutions:', error);
      throw error;
    }
  }

  static async getResolutionsByMeeting(meetingId) {
    try {
      const response = await fetch(`${API_BASE}/resolutions/meeting/${meetingId}`);
      if (!response.ok) throw new Error('Failed to fetch resolutions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching resolutions by meeting:', error);
      throw error;
    }
  }

  static async createResolution(resolutionData) {
    try {
      const response = await fetch(`${API_BASE}/resolutions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resolutionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create resolution');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating resolution:', error);
      throw error;
    }
  }

  /**
   * CRITICAL: Assign resolution to subcommittees with percentage validation
   * Note: This sends emails to ALL members of each selected subcommittee automatically
   */
  static async assignResolution(resolutionId, assignments) {
    try {
      // Validate assignments first
      const validationErrors = this.validateAssignments(assignments);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('. '));
      }

      // Prepare assignments in the format expected by backend
      const assignmentData = {
        assignments: assignments.map(assignment => ({
          subcommitteeId: assignment.subcommitteeId,
          contributionPercentage: assignment.contributionPercentage
        }))
      };

      const response = await fetch(`${API_BASE}/resolutions/${resolutionId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign resolution');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning resolution:', error);
      throw error;
    }
  }

  /**
   * CRITICAL: Validate assignment percentages must total 100%
   */
  static validateAssignments(assignments) {
    const errors = [];

    if (!assignments || assignments.length === 0) {
      errors.push('At least one assignment is required');
      return errors;
    }

    // Check total percentage
    const total = assignments.reduce((sum, assignment) => {
      const percentage = parseInt(assignment.contributionPercentage || 0);
      return sum + percentage;
    }, 0);

    if (total !== 100) {
      errors.push(`Total contribution must equal 100%. Current total: ${total}%`);
    }

    // Check for duplicate subcommittees
    const subcommitteeIds = assignments.map(a => a.subcommitteeId);
    const uniqueIds = new Set(subcommitteeIds);

    if (subcommitteeIds.length !== uniqueIds.size) {
      errors.push('Cannot assign the same subcommittee multiple times');
    }

    // Check individual assignments
    assignments.forEach((assignment, index) => {
      if (!assignment.subcommitteeId) {
        errors.push(`Assignment ${index + 1}: Subcommittee is required`);
      }

      const percentage = parseInt(assignment.contributionPercentage || 0);
      if (percentage <= 0 || percentage > 100) {
        errors.push(`Assignment ${index + 1}: Contribution percentage must be between 1 and 100`);
      }
    });

    return errors;
  }

  /**
   * Get assignment progress for a resolution
   */
  static async getResolutionProgress(resolutionId) {
    try {
      const response = await fetch(`${API_BASE}/resolutions/${resolutionId}/progress`);
      if (!response.ok) throw new Error('Failed to fetch resolution progress');
      return await response.json();
    } catch (error) {
      console.error('Error fetching resolution progress:', error);
      throw error;
    }
  }

  /**
   * Update resolution status
   */
  static async updateResolutionStatus(resolutionId, status) {
    try {
      const response = await fetch(`${API_BASE}/resolutions/${resolutionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update resolution status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating resolution status:', error);
      throw error;
    }
  }

  /**
   * Helper: Calculate remaining percentage for assignments
   */
  static calculateRemainingPercentage(assignments) {
    const total = assignments.reduce((sum, assignment) => {
      return sum + parseInt(assignment.contributionPercentage || 0);
    }, 0);
    return Math.max(0, 100 - total);
  }

  /**
   * Helper: Get status color
   */
  static getStatusColor(status) {
    const colors = {
      'ASSIGNED': '#3b82f6',     // Blue
      'IN_PROGRESS': '#f59e0b',  // Orange
      'COMPLETED': '#10b981',    // Green
      'CANCELLED': '#ef4444'     // Red
    };
    return colors[status] || '#6b7280';
  }

  /**
   * Helper: Get priority color
   */
  static getPriorityColor(priority) {
    const colors = {
      'LOW': '#10b981',      // Green
      'MEDIUM': '#f59e0b',   // Orange
      'HIGH': '#ef4444',     // Red
      'URGENT': '#dc2626'    // Dark Red
    };
    return colors[priority] || '#6b7280';
  }

  /**
   * Helper: Format resolution data for display
   */
  static formatResolutionData(resolution) {
    return {
      ...resolution,
      statusColor: this.getStatusColor(resolution.status),
      formattedDate: resolution.createdAt ? 
        new Date(resolution.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'N/A'
    };
  }

  /**
   * Validate resolution creation data
   */
  static validateResolutionData(resolutionData) {
    const errors = [];

    if (!resolutionData.title || !resolutionData.title.trim()) {
      errors.push('Resolution title is required');
    }

    if (!resolutionData.description || !resolutionData.description.trim()) {
      errors.push('Resolution description is required');
    }

    if (!resolutionData.meetingId) {
      errors.push('Meeting is required');
    }

    return errors;
  }
}

export default ResolutionAssignmentService;