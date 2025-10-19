import { API_BASE } from './apiConfig';
const API_URL = `${API_BASE}/countries`;

export const getCountries = async () => {
  // CRITICAL: Force all roles to use the same data source as Secretary
  // This ensures Chair, HOD, Sub-Committee Member, etc. all see identical data
  // No role-based filtering - everyone gets the same countries data
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // NO role-based parameters - ensure identical data for all roles
      // This forces the backend to return the same dataset regardless of user role
    }
  });
  
  // Log the response to verify we're getting the same data
  const data = await response.json();
  console.log('Countries API response for all roles:', data);
  
  return data;
};

export const getCountryById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  return response.json();
};

export const createCountry = async (country) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(country),
  });
  return response.json();
};

export const updateCountry = async (id, country) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(country),
  });
  return response.json();
};

export const deleteCountry = async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
};