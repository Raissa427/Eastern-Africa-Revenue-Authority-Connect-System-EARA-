import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemberById, createMember, updateMember } from '../../services/countryMemberService';
import { getCountries } from '../../services/countryService';
import { getCommittees } from '../../services/committeeService';
import './Members.css';

const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Initialize with all role fields explicitly set to false
  const [member, setMember] = useState({
    name: '',
    phone: '',
    email: '',
    country: { id: '' },
    committee: { id: '' },
    isChair: false,
    isViceChair: false,
    isCommitteeSecretary: false,
    isCommitteeMember: false,
    // isCommissionerGeneral: false // Temporarily commented out
  });

  const [countries, setCountries] = useState([]);
  const [committees, setCommittees] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [countriesData, committeesData] = await Promise.all([
        getCountries(),
        getCommittees()
      ]);
      setCountries(countriesData);
      setCommittees(committeesData);

      if (id) {
        const memberData = await getMemberById(id);
        // Ensure all role fields are set, even if they come as null/undefined from API
        setMember({
          ...memberData,
          isChair: memberData.isChair || false,
          isViceChair: memberData.isViceChair || false,
          isCommitteeSecretary: memberData.isCommitteeSecretary || false,
          isCommitteeMember: memberData.isCommitteeMember || false,
          // isCommissionerGeneral: memberData.isCommissionerGeneral || false // Temporarily commented out
        });
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMember(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setMember(prev => ({
      ...prev,
      [name]: { id: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For committee members, we don't need appointedDate
    // The CountryCommitteeMember model doesn't have this field
    
    try {
      // Prepare the member data to send
      const memberToSend = {
        name: member.name,
        phone: member.phone,
        email: member.email,
        country: member.country,
        committee: member.committee,
        // Ensure all boolean fields are included in the payload
        isChair: member.isChair || false,
        isViceChair: member.isViceChair || false,
        isCommitteeSecretary: member.isCommitteeSecretary || false,
        isCommitteeMember: member.isCommitteeMember || false,
        // isCommissionerGeneral: member.isCommissionerGeneral || false // Temporarily commented out
      };

      if (id) {
        await updateMember(id, memberToSend);
      } else {
        await createMember(memberToSend);
      }
      
      // Show success message and navigate
      console.log(`Member ${id ? 'updated' : 'created'} successfully`);
      navigate('/members');
    } catch (error) {
      console.error('Error saving member:', error);
      // You could add a toast notification or error state here
      alert(`Failed to ${id ? 'update' : 'create'} member. Please try again.`);
    }
  };

  return (
    <div className="member-form-container">
      <h2>{id ? 'Edit Member' : 'Add Member'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={member.name || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={member.email || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone:</label>
          <input
            type="text"
            name="phone"
            value={member.phone || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Country:</label>
          <select
            name="country"
            value={member.country?.id || ''}
            onChange={handleSelectChange}
            required
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country.id} value={country.id}>{country.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Committee:</label>
          <select
            name="committee"
            value={member.committee?.id || ''}
            onChange={handleSelectChange}
            required
          >
            <option value="">Select Committee</option>
            {committees.map(committee => (
              <option key={committee.id} value={committee.id}>{committee.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group checkbox-group">
          <label>Roles:</label>
          <div>
            <label>
              <input
                type="checkbox"
                name="isChair"
                checked={member.isChair}
                onChange={handleChange}
              /> Chair
            </label>
            <label>
              <input
                type="checkbox"
                name="isViceChair"
                checked={member.isViceChair}
                onChange={handleChange}
              /> Vice Chair
            </label>
            <label>
              <input
                type="checkbox"
                name="isCommitteeSecretary"
                checked={member.isCommitteeSecretary}
                onChange={handleChange}
              /> Secretary
            </label>
            <label>
              <input
                type="checkbox"
                name="isCommitteeMember"
                checked={member.isCommitteeMember}
                onChange={handleChange}
              /> Member
            </label>
            {/* Temporarily commented out until backend supports isCommissionerGeneral field */}
            {/* <label>
              <input
                type="checkbox"
                name="isCommissionerGeneral"
                checked={member.isCommissionerGeneral}
                onChange={handleChange}
              /> Commissioner General
            </label> */}
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Save</button>
      </form>
    </div>
  );
};

export default MemberForm;