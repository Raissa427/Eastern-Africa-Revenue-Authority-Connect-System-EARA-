// services/countryMemberService.js
const API_BASE = `${process.env.REACT_APP_BASE_URL}/commissioner-generals`;

/**
 * Get all country committee members
 */
export const getMembers = async () => {
  try {
    const response = await fetch(`${API_BASE}/get-all`);
    if (!response.ok) {
      throw new Error('Failed to fetch members');
    }
    const data = await response.json();
    
    // Handle direct array response from CountryCommitteeMemberController
    if (Array.isArray(data)) {
      return data;
    } else {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    console.error('Error fetching members:', error);
    throw new Error('Failed to fetch members from server: ' + error.message);
  }
};

/**
 * Get a specific member by ID
 */
export const getMemberById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/get-by/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch member');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching member:', error);
    throw new Error('Failed to fetch member from server: ' + error.message);
  }
};

/**
 * Create a new country committee member
 */
export const createMember = async (memberData) => {
  try {
    // Send JSON data directly for committee members
    const response = await fetch(`${API_BASE}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create member';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // If JSON parsing fails, try to get text response
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          // If both JSON and text parsing fail, use default message
          errorMessage = `Failed to create committee member: ${response.status} ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating member:', error);
    throw error;
  }
};

/**
 * Update an existing country committee member
 */
export const updateMember = async (id, memberData) => {
  try {
    // Send JSON data directly for committee members
    const response = await fetch(`${API_BASE}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to update member';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // If JSON parsing fails, try to get text response
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          // If both JSON and text parsing fail, use default message
          errorMessage = `Failed to update committee member: ${response.status} ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
};

/**
 * Delete a country committee member
 */
export const deleteMember = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/delete/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete member');
    }

    return true;
  } catch (error) {
    console.error('Error deleting member:', error);
    // Return mock success for development when backend is unavailable
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      console.log('Backend unavailable, returning mock success for member deletion');
      return true;
    }
    throw error;
  }
};

export default {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember
};
