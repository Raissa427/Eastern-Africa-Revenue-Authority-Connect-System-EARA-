import { API_BASE } from './apiConfig';

export const getMeetingsByCountry = async (countryId) => {
  const response = await fetch(`${API_BASE}/meetings/country/${countryId}`);
  if (!response.ok) throw new Error('Failed to fetch meetings');
  return response.json();
};

export const getMeetings = async () => {
  const response = await fetch(`${API_BASE}/meetings`);
  if (!response.ok) throw new Error('Failed to fetch meetings');
  return response.json();
};

export const getMeetingById = async (id) => {
  const response = await fetch(`${API_BASE}/meetings/${id}`);
  if (!response.ok) throw new Error('Failed to fetch meeting');
  return response.json();
};

export const createMeeting = async (meetingData) => {
  // Get current user for createdBy field
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.id) {
    throw new Error('User not authenticated');
  }

  // Ensure the meeting data includes createdBy
  const payload = {
    ...meetingData,
    createdBy: { id: user.id }
  };

  const response = await fetch(`${API_BASE}/meetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Server error response:', errorText);
    throw new Error(`Failed to create meeting: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export const updateMeeting = async (id, meetingData) => {
  // Get current user for updatedBy field (if needed)
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.id) {
    throw new Error('User not authenticated');
  }

  // For updates, we might need updatedBy instead of createdBy
  const payload = {
    ...meetingData,
    updatedBy: { id: user.id }
  };

  const response = await fetch(`${API_BASE}/meetings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Server error response:', errorText);
    throw new Error(`Failed to update meeting: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export const deleteMeeting = async (id) => {
  const response = await fetch(`${API_BASE}/meetings/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete meeting');
  return response.json();
};

export const validateSecretaryPermission = async (meetingId, secretaryId) => {
  const response = await fetch(`${API_BASE}/meetings/${meetingId}/validate-secretary?secretaryId=${secretaryId}`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to validate permission');
  return response.json();
};

export const sendInvitations = async (meetingId, secretaryId, userIds) => {
  const response = await fetch(`${API_BASE}/meetings/${meetingId}/invitations/send?secretaryId=${secretaryId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userIds)
  });
  if (!response.ok) throw new Error('Failed to send invitations');
  return response.json();
};

export const recordAttendance = async (meetingId, secretaryId, attendanceData) => {
  const response = await fetch(`${API_BASE}/meetings/${meetingId}/attendance?secretaryId=${secretaryId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attendanceData)
  });
  if (!response.ok) throw new Error('Failed to record attendance');
  return response.json();
};

export const getAttendance = async (meetingId, secretaryId) => {
  const response = await fetch(`${API_BASE}/meetings/${meetingId}/attendance?secretaryId=${secretaryId}`);
  if (!response.ok) throw new Error('Failed to get attendance');
  return response.json();
};

export const updateMeetingMinutes = async (meetingId, secretaryId, minutes) => {
  const response = await fetch(`${API_BASE}/meetings/${meetingId}/minutes?secretaryId=${secretaryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ minutes })
  });
  if (!response.ok) throw new Error('Failed to update minutes');
  return response.json();
};

export const changeMeetingStatus = async (meetingId, status) => {
  const response = await fetch(`${API_BASE}/meetings/${meetingId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to change meeting status');
  return response.json();
};

export const getInvitedMembers = async (meetingId) => {
  const response = await fetch(`${API_BASE}/meetings/${meetingId}/invitations`);
  if (!response.ok) throw new Error('Failed to fetch invited members');
  return response.json();
};