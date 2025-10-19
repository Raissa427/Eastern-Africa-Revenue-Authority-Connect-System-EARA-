// services/revenueAuthorityService.js

import { API_BASE as API_BASE_URL } from './apiConfig';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || `HTTP error! status: ${response.status}`;
    } catch {
      errorMessage = errorText || `HTTP error! status: ${response.status}`;
    }
    
    throw new Error(errorMessage);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
};

// Helper function to make API requests
const makeRequest = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };
  
  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Get all revenue authorities
export const getAllRevenueAuthorities = async () => {
  return await makeRequest(`${API_BASE_URL}/revenue-authorities`);
};

// Get revenue authority by ID
export const getRevenueAuthorityById = async (id) => {
  if (!id) {
    throw new Error('Revenue authority ID is required');
  }
  return await makeRequest(`${API_BASE_URL}/revenue-authorities/${id}`);
};

// Get revenue authorities by country ID
export const getRevenueAuthoritiesByCountry = async (countryId) => {
  if (!countryId) {
    throw new Error('Country ID is required');
  }
  return await makeRequest(`${API_BASE_URL}/revenue-authorities/country/${countryId}`);
};

// Create new revenue authority
export const createRevenueAuthority = async (revenueAuthorityData) => {
  if (!revenueAuthorityData) {
    throw new Error('Revenue authority data is required');
  }
  
  if (!revenueAuthorityData.name || !revenueAuthorityData.name.trim()) {
    throw new Error('Revenue authority name is required');
  }
  
  if (!revenueAuthorityData.countryId) {
    throw new Error('Country ID is required');
  }
  
  // Prepare the data according to your backend model
  const payload = {
    name: revenueAuthorityData.name.trim(),
    country: {
      id: revenueAuthorityData.countryId
    }
  };
  
  return await makeRequest(`${API_BASE_URL}/revenue-authorities`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

// Update revenue authority
export const updateRevenueAuthority = async (id, revenueAuthorityData) => {
  if (!id) {
    throw new Error('Revenue authority ID is required');
  }
  
  if (!revenueAuthorityData) {
    throw new Error('Revenue authority data is required');
  }
  
  if (!revenueAuthorityData.name || !revenueAuthorityData.name.trim()) {
    throw new Error('Revenue authority name is required');
  }
  
  if (!revenueAuthorityData.countryId) {
    throw new Error('Country ID is required');
  }
  
  // Prepare the data according to your backend model
  const payload = {
    name: revenueAuthorityData.name.trim(),
    country: {
      id: revenueAuthorityData.countryId
    }
  };
  
  return await makeRequest(`${API_BASE_URL}/revenue-authorities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
};

// Delete revenue authority
export const deleteRevenueAuthority = async (id) => {
  if (!id) {
    throw new Error('Revenue authority ID is required');
  }
  
  return await makeRequest(`${API_BASE_URL}/revenue-authorities/${id}`, {
    method: 'DELETE'
  });
};

// Search revenue authorities by name
export const searchRevenueAuthorities = async (searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    return await getAllRevenueAuthorities();
  }
  
  const encodedSearchTerm = encodeURIComponent(searchTerm.trim());
  return await makeRequest(`${API_BASE_URL}/revenue-authorities/search?name=${encodedSearchTerm}`);
};

export default {
  getAllRevenueAuthorities,
  getRevenueAuthorityById,
  getRevenueAuthoritiesByCountry,
  createRevenueAuthority,
  updateRevenueAuthority,
  deleteRevenueAuthority,
  searchRevenueAuthorities
};