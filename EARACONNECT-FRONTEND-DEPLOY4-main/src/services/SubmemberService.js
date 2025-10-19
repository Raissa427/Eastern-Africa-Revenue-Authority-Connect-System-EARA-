const API_URL = `${process.env.REACT_APP_BASE_URL}/country-committee-members`;

export const fetchMembers = async (page = 1, size = 10, sortBy = 'name', sortDirection = 'ASC', searchTerm = '') => {
  let url = `${API_URL}?page=${page - 1}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`;
  
  if (searchTerm) {
    url += `&name=${encodeURIComponent(searchTerm)}`;
  }
  
  console.log('Fetching members from:', url);
  
  try {
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
    }
    
    const data = await response.json();
    console.log('API Response data:', data);
    
    // Ensure we have the expected structure
    if (!data || typeof data !== 'object') {
      console.error('Invalid data structure:', data);
      throw new Error('Invalid response format from server');
    }
    
    // If the response doesn't have content property, it might be a direct array
    if (!data.content && Array.isArray(data)) {
      console.log('Response is direct array, wrapping in pagination format');
      return {
        content: data,
        totalPages: 1,
        totalElements: data.length,
        currentPage: page
      };
    }
    
    // Map backend field names to frontend field names for each member in the list
    if (data.content && Array.isArray(data.content)) {
      data.content = data.content.map(member => ({
        ...member,
        delegationSecretary: member.isDelegationSecretary,
        chair: member.isChair,
        viceChair: member.isViceChair,
        committeeSecretary: member.isCommitteeSecretary,
        committeeMember: member.isCommitteeMember
      }));
    } else {
      console.error('No content array in response:', data);
      throw new Error('No members data in response');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};

export const fetchMemberById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    throw new Error('Member not found');
  }
  const data = await response.json();
  
  // Map backend field names to frontend field names
  return {
    ...data,
    delegationSecretary: data.isDelegationSecretary,
    chair: data.isChair,
    viceChair: data.isViceChair,
    committeeSecretary: data.isCommitteeSecretary,
    committeeMember: data.isCommitteeMember
  };
};

export const createMember = async (memberData) => {
  const formData = new FormData();
  
  // Prepare member object without the file
  const memberObject = {
    name: memberData.name,
    phone: memberData.phone,
    email: memberData.email,
    positionInYourRA: memberData.positionInYourRA,
    country: memberData.country && memberData.country.id ? { id: parseInt(memberData.country.id) } : null,
    subCommittee: memberData.subCommittee && memberData.subCommittee.id ? { id: parseInt(memberData.subCommittee.id) } : null,
    appointedDate: memberData.appointedDate,
    isDelegationSecretary: memberData.delegationSecretary || false,
    isChair: memberData.chair || false,
    isViceChair: memberData.viceChair || false,
    isCommitteeSecretary: memberData.committeeSecretary || false,
    isCommitteeMember: memberData.committeeMember || false
  };
  
  // Add member data as JSON string
  formData.append('member', JSON.stringify(memberObject));
  
  // Add file if present
  if (memberData.appointmentLetter) {
    formData.append('appointmentLetter', memberData.appointmentLetter);
  }
  
  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create member' }));
    throw new Error(error.error || error.message || 'Failed to create member');
  }
  
  return response.json();
};

export const updateMember = async (id, memberData) => {
  const formData = new FormData();
  
  // Prepare member object without the file
  const memberObject = {
    name: memberData.name,
    phone: memberData.phone,
    email: memberData.email,
    positionInYourRA: memberData.positionInYourRA,
    country: memberData.country && memberData.country.id ? { id: parseInt(memberData.country.id) } : null,
    subCommittee: memberData.subCommittee && memberData.subCommittee.id ? { id: parseInt(memberData.subCommittee.id) } : null,
    appointedDate: memberData.appointedDate,
    isDelegationSecretary: memberData.delegationSecretary || false,
    isChair: memberData.chair || false,
    isViceChair: memberData.viceChair || false,
    isCommitteeSecretary: memberData.committeeSecretary || false,
    isCommitteeMember: memberData.committeeMember || false
  };
  
  // Add member data as JSON string
  formData.append('member', JSON.stringify(memberObject));
  
  // Add file if present
  if (memberData.appointmentLetter) {
    formData.append('appointmentLetter', memberData.appointmentLetter);
  }
  
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update member' }));
    throw new Error(error.error || error.message || 'Failed to update member');
  }
  
  return response.json();
};

export const deleteMember = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete member');
  }
};

export const fetchCountries = async () => {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/countries`);
  if (!response.ok) {
    throw new Error('Failed to fetch countries');
  }
  return response.json();
};

export const fetchSubCommittees = async () => {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/sub-committees`);
  if (!response.ok) {
    throw new Error('Failed to fetch sub-committees');
  }
  return response.json();
};