import { API_BASE } from './apiConfig';

export const getResolutionsByMeeting = async (meetingId) => {
  const response = await fetch(`${API_BASE}/resolutions/meeting/${meetingId}`);
  if (!response.ok) throw new Error('Failed to fetch resolutions');
  return response.json();
};

export const getAllResolutions = async () => {
  const response = await fetch(`${API_BASE}/resolutions`);
  if (!response.ok) throw new Error('Failed to fetch resolutions');
  return response.json();
};

export const getResolutionById = async (id) => {
  // Validate id
  if (!id || id === 'undefined' || id === undefined) {
    throw new Error('Invalid resolution ID provided');
  }
  
  const response = await fetch(`${API_BASE}/resolutions/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Resolution not found');
    }
    throw new Error('Failed to fetch resolution');
  }
  return response.json();
};

export const createResolutions = async (meetingId, resolutions) => {
  const response = await fetch(`${API_BASE}/meetings/${meetingId}/resolutions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolutions })
  });
  if (!response.ok) throw new Error('Failed to create resolutions');
  return response.json();
};

export const updateResolution = async (resolutionId, resolutionData) => {
  const response = await fetch(`${API_BASE}/resolutions/${resolutionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resolutionData)
  });
  if (!response.ok) throw new Error('Failed to update resolution');
  return response.json();
};

export const deleteResolution = async (resolutionId) => {
  const response = await fetch(`${API_BASE}/resolutions/${resolutionId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete resolution');
  return response.json();
};

export const assignResolution = async (resolutionId, secretaryId, assignments) => {
  const response = await fetch(`${API_BASE}/resolutions/${resolutionId}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assignments)
  });
  if (!response.ok) throw new Error('Failed to assign resolution');
  return response.json();
};

export const getResolutionAssignments = async (resolutionId) => {
  // Validate resolutionId
  if (!resolutionId || resolutionId === 'undefined' || resolutionId === undefined) {
    throw new Error('Invalid resolution ID provided');
  }
  
  const response = await fetch(`${API_BASE}/resolutions/${resolutionId}/assignments`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Resolution not found');
    }
    throw new Error('Failed to get assignments');
  }
  return response.json();
};

export const updateResolutionStatus = async (resolutionId, status) => {
  const response = await fetch(`${API_BASE}/resolutions/${resolutionId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update resolution status');
  return response.json();
};

export const submitResolutionReport = async (resolutionId, reportData) => {
  const response = await fetch(`${API_BASE}/resolutions/${resolutionId}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData)
  });
  if (!response.ok) throw new Error('Failed to submit report');
  return response.json();
};

export const getResolutionsByCountry = async (countryId) => {
  const response = await fetch(`${API_BASE}/resolutions/country/${countryId}`);
  if (!response.ok) throw new Error('Failed to fetch resolutions');
  return response.json();
};

export const getResolutionsByStatus = async (status) => {
  const response = await fetch(`${API_BASE}/resolutions/status/${status}`);
  if (!response.ok) throw new Error('Failed to fetch resolutions');
  return response.json();
};