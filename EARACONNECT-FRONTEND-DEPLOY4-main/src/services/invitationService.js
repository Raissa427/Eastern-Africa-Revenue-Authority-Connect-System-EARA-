// invitationService.js - Robust API service for invitation management

const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8081/api';

// Utility function to handle API responses with better error handling
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', errorText);
    
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (parseError) {
      // If response is not JSON, use the raw text
      if (errorText.trim()) {
        errorMessage = errorText;
      }
    }
    
    throw new Error(errorMessage);
  }

  const responseText = await response.text();
  
  if (!responseText.trim()) {
    return null; // Handle empty responses
  }

  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError);
    console.error('Response text:', responseText);
    throw new Error('Invalid JSON response from server');
  }
};

// Get meetings with proper error handling
export const getMeetingsForInvitations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/meetings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await handleApiResponse(response);
    
    if (!Array.isArray(data)) {
      console.warn('Expected array but got:', typeof data);
      return [];
    }

    // Filter meetings that are eligible for invitations
    return data.filter(meeting => 
      meeting && 
      ['SCHEDULED', 'PLANNED'].includes(meeting.status) &&
      meeting.id &&
      meeting.title
    );
  } catch (error) {
    console.error('Error fetching meetings for invitations:', error);
    throw new Error(`Failed to load meetings: ${error.message}`);
  }
};

// Get potential invitees for a specific meeting
export const getPotentialInvitees = async (meetingId) => {
  try {
    // First try the specific endpoint
    let response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/potential-invitees`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await handleApiResponse(response);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }

    // Fallback to general users endpoint
    console.log('Using fallback: fetching all users and filtering');
    response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const allUsers = await handleApiResponse(response);
    
    if (!Array.isArray(allUsers)) {
      return [];
    }

    // Filter active users who can be invited
    return allUsers.filter(user => 
      user.active && 
      user.email && 
      user.name &&
      (user.roles?.length > 0 || user.role)
    );

  } catch (error) {
    console.error('Error fetching potential invitees:', error);
    throw new Error(`Failed to load potential invitees: ${error.message}`);
  }
};

// Send invitations with comprehensive error handling
export const sendInvitations = async (invitationData) => {
  try {
    // Validate input data
    if (!invitationData.meetingId) {
      throw new Error('Meeting ID is required');
    }
    if (!invitationData.recipientIds || invitationData.recipientIds.length === 0) {
      throw new Error('At least one recipient is required');
    }
    if (!invitationData.message?.trim()) {
      throw new Error('Invitation message is required');
    }

    const payload = {
      meetingId: invitationData.meetingId,
      recipientIds: invitationData.recipientIds,
      message: invitationData.message.trim(),
      senderId: invitationData.senderId,
      sendEmail: true // Enable email sending
    };

    console.log('Sending invitation payload:', payload);

    const response = await fetch(`${API_BASE_URL}/invitations/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await handleApiResponse(response);
    
    return {
      success: true,
      sentCount: invitationData.recipientIds.length,
      message: 'Invitations sent successfully',
      data: result
    };

  } catch (error) {
    console.error('Error sending invitations:', error);
    throw new Error(`Failed to send invitations: ${error.message}`);
  }
};

// Alternative send invitations method (for backward compatibility)
export const sendMeetingInvitations = async (meetingId, senderId, recipientIds, customMessage = '') => {
  const invitationData = {
    meetingId,
    senderId,
    recipientIds,
    message: customMessage || 'You are invited to attend this meeting.'
  };

  return sendInvitations(invitationData);
};

// Get invitation history
export const getInvitationHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/invitations/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      // Endpoint doesn't exist yet, return empty array
      console.log('Invitation history endpoint not available');
      return [];
    }

    const data = await handleApiResponse(response);
    return Array.isArray(data) ? data : [];

  } catch (error) {
    console.error('Error fetching invitation history:', error);
    // Don't throw error for history - just return empty array
    return [];
  }
};

// Get invitations for a specific meeting
export const getMeetingInvitations = async (meetingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/invitations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return [];
    }

    const data = await handleApiResponse(response);
    return Array.isArray(data) ? data : [];

  } catch (error) {
    console.error('Error fetching meeting invitations:', error);
    return [];
  }
};

// Update invitation status (accept/decline)
export const updateInvitationStatus = async (invitationId, status, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        userId
      }),
    });

    const result = await handleApiResponse(response);
    return result;

  } catch (error) {
    console.error('Error updating invitation status:', error);
    throw new Error(`Failed to update invitation status: ${error.message}`);
  }
};

// Resend invitations
export const resendInvitations = async (meetingId, recipientIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/invitations/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meetingId,
        recipientIds
      }),
    });

    const result = await handleApiResponse(response);
    return result;

  } catch (error) {
    console.error('Error resending invitations:', error);
    throw new Error(`Failed to resend invitations: ${error.message}`);
  }
};

// Get countries (for filtering)
export const getCountries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/countries`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await handleApiResponse(response);
    return Array.isArray(data) ? data : [];

  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
};

// Get users with better filtering
export const getUsers = async (filters = {}) => {
  try {
    let url = `${API_BASE_URL}/users`;
    const queryParams = new URLSearchParams();

    // Add query parameters if filters are provided
    if (filters.role) {
      queryParams.append('role', filters.role);
    }
    if (filters.country) {
      queryParams.append('country', filters.country);
    }
    if (filters.active !== undefined) {
      queryParams.append('active', filters.active);
    }

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await handleApiResponse(response);
    return Array.isArray(data) ? data : [];

  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Validate email template
export const validateEmailTemplate = async (template) => {
  try {
    const response = await fetch(`${API_BASE_URL}/invitations/validate-template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ template }),
    });

    const result = await handleApiResponse(response);
    return result;

  } catch (error) {
    console.error('Error validating email template:', error);
    return { valid: true, warnings: [] }; // Default to valid if endpoint doesn't exist
  }
};

// Get invitation statistics
export const getInvitationStats = async (meetingId = null) => {
  try {
    let url = `${API_BASE_URL}/invitations/stats`;
    if (meetingId) {
      url += `?meetingId=${meetingId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return {
        totalSent: 0,
        totalAccepted: 0,
        totalDeclined: 0,
        totalPending: 0
      };
    }

    const data = await handleApiResponse(response);
    return data;

  } catch (error) {
    console.error('Error fetching invitation stats:', error);
    return {
      totalSent: 0,
      totalAccepted: 0,
      totalDeclined: 0,
      totalPending: 0
    };
  }
};

// Bulk operations for invitations
export const bulkUpdateInvitations = async (invitationIds, action, data = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/invitations/bulk-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invitationIds,
        action,
        data
      }),
    });

    const result = await handleApiResponse(response);
    return result;

  } catch (error) {
    console.error('Error performing bulk invitation update:', error);
    throw new Error(`Failed to perform bulk update: ${error.message}`);
  }
};

// Export invitation data
export const exportInvitationData = async (meetingId, format = 'csv') => {
  try {
    const response = await fetch(`${API_BASE_URL}/invitations/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meetingId,
        format
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      return blob;
    } else {
      throw new Error('Failed to export invitation data');
    }

  } catch (error) {
    console.error('Error exporting invitation data:', error);
    throw new Error(`Failed to export data: ${error.message}`);
  }
};

// Utility function to check if user is authenticated
export const checkAuthentication = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    return {
      isAuthenticated: isAuthenticated && user && user.id,
      user: user
    };
  } catch (error) {
    console.error('Error checking authentication:', error);
    return {
      isAuthenticated: false,
      user: null
    };
  }
};

// Default export with all functions
export default {
  getMeetingsForInvitations,
  getPotentialInvitees,
  sendInvitations,
  sendMeetingInvitations,
  getInvitationHistory,
  getMeetingInvitations,
  updateInvitationStatus,
  resendInvitations,
  getCountries,
  getUsers,
  validateEmailTemplate,
  getInvitationStats,
  bulkUpdateInvitations,
  exportInvitationData,
  checkAuthentication
};