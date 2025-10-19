import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  fetchMemberById, 
  createMember, 
  updateMember,
  fetchCountries,
  fetchSubCommittees
} from '../../services/SubmemberService';
import './SubCommitteeMembers.css';

const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Use the same field names as your API expects
  const [member, setMember] = useState({
    name: '',
    phone: '',
    email: '',
    positionInYourRA: '',
    country: { id: '' },
    subCommittee: { id: '' },
    appointedDate: '',
    delegationSecretary: false,
    chair: false,
    viceChair: false,
    committeeSecretary: false,
    committeeMember: false,
    appointmentLetter: null
  });

  const [countries, setCountries] = useState([]);
  const [subCommittees, setSubCommittees] = useState([]);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const [countriesData, subCommitteesData] = await Promise.all([
        fetchCountries(),
        fetchSubCommittees()
      ]);
      
      setCountries(countriesData);
      setSubCommittees(subCommitteesData);

      if (id) {
        const memberData = await fetchMemberById(id);
        console.log('Fetched member data:', memberData); // Debug log
        
        // Set member data - the service already maps the field names
        setMember({
          name: memberData.name || '',
          phone: memberData.phone || '',
          email: memberData.email || '',
          positionInYourRA: memberData.positionInYourRA || '',
          country: memberData.country || { id: '' },
          subCommittee: memberData.subCommittee || { id: '' },
          appointedDate: memberData.appointedDate || '',
          delegationSecretary: memberData.delegationSecretary || false,
          chair: memberData.chair || false,
          viceChair: memberData.viceChair || false,
          committeeSecretary: memberData.committeeSecretary || false,
          committeeMember: memberData.committeeMember || false,
          appointmentLetter: null // Always reset file input for editing
        });
        
        console.log('Loaded member data from backend:', memberData);
        console.log('Mapped to frontend format:', {
          delegationSecretary: memberData.delegationSecretary,
          chair: memberData.chair,
          viceChair: memberData.viceChair,
          committeeSecretary: memberData.committeeSecretary,
          committeeMember: memberData.committeeMember
        });
        
        if (memberData.appointedLetterDoc) {
          setFilePreview({
            name: memberData.appointedLetterDoc.originalFilename,
            id: memberData.appointedLetterDoc.id
          });
        }
      }
    };
    fetchData();
  }, [id]);

  // Count number of selected roles
  const selectedRolesCount = [member.chair, member.viceChair, member.committeeSecretary, member.committeeMember, member.delegationSecretary].filter(Boolean).length;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Prevent selecting more than two roles
    if (type === 'checkbox' && checked && selectedRolesCount >= 2 && !member[name]) {
      alert('You can select at most two roles.');
      return;
    }
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PDF or image file (JPG, PNG)');
        return;
      }
      
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setMember(prev => ({ ...prev, appointmentLetter: file }));
      setFilePreview({ name: file.name });
    }
  };

  const removeFile = () => {
    setMember(prev => ({ ...prev, appointmentLetter: null }));
    setFilePreview(null);
    const fileInput = document.getElementById('appointmentLetter');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!member.name.trim()) {
      alert('Name is required');
      return;
    }
    if (!member.email.trim()) {
      alert('Email is required');
      return;
    }
    if (!member.country.id) {
      alert('Country is required');
      return;
    }
    if (!member.subCommittee.id) {
      alert('Sub-committee is required');
      return;
    }
    if (!member.appointedDate) {
      alert('Appointment date is required');
      return;
    }
    
    // Validate appointment date - must not be in the future
    if (member.appointedDate) {
      const appointedDate = new Date(member.appointedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      
      if (appointedDate > today) {
        alert('Appointment date cannot be in the future. Please select a date that is today or in the past.');
        return;
      }
    }
    
    // Validate role assignment - at least one role must be selected
    const hasRole = member.chair || member.viceChair || member.committeeSecretary || 
                   member.committeeMember || member.delegationSecretary;
    
    if (!hasRole) {
      alert('At least one role must be assigned to the committee member.');
      return;
    }

    // Prepare the member data to send - ensure all boolean fields are included
    const memberToSend = {
      ...member,
      // Ensure all boolean fields are included in the payload
      delegationSecretary: member.delegationSecretary || false,
      chair: member.chair || false,
      viceChair: member.viceChair || false,
      committeeSecretary: member.committeeSecretary || false,
      committeeMember: member.committeeMember || false
    };

    console.log('Sending member data:', memberToSend); // Debug log

    try {
      if (id) {
        await updateMember(id, memberToSend);
      } else {
        await createMember(memberToSend);
      }
      navigate('/sub-committee-members');
    } catch (error) {
      console.error('Error saving member:', error); // Debug log
      alert(error.message);
    }
  };

  return (
    <div className="member-form-container">
      <h2>{id ? 'Edit Member' : 'Add Member'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            name="name"
            value={member.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={member.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Phone:</label>
          <input
            type="tel"
            name="phone"
            value={member.phone}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Position in Your RA:</label>
          <input
            type="text"
            name="positionInYourRA"
            value={member.positionInYourRA}
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
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Sub-Committee:</label>
          <select
            name="subCommittee"
            value={member.subCommittee?.id || ''}
            onChange={handleSelectChange}
            required
          >
            <option value="">Select Sub-Committee</option>
            {subCommittees.map(sc => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Appointed Date: <span className="required">*</span></label>
          <input
            type="date"
            name="appointedDate"
            value={member.appointedDate}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]} // Prevent future dates in date picker
            required
          />
          <small className="form-help">Appointment date must be today or in the past</small>
        </div>
        
        <div className="form-group checkbox-group">
          <label>Roles: <span className="required">*</span></label>
          <div>
            <label>
              <input
                type="checkbox"
                name="chair"
                checked={member.chair}
                onChange={handleChange}
                disabled={!member.chair && selectedRolesCount >= 2}
              /> Chair
            </label>
            <label>
              <input
                type="checkbox"
                name="viceChair"
                checked={member.viceChair}
                onChange={handleChange}
                disabled={!member.viceChair && selectedRolesCount >= 2}
              /> Vice Chair
            </label>
            <label>
              <input
                type="checkbox"
                name="committeeSecretary"
                checked={member.committeeSecretary}
                onChange={handleChange}
                disabled={!member.committeeSecretary && selectedRolesCount >= 2}
              /> Committee Secretary
            </label>
            <label>
              <input
                type="checkbox"
                name="committeeMember"
                checked={member.committeeMember}
                onChange={handleChange}
                disabled={!member.committeeMember && selectedRolesCount >= 2}
              /> Committee Member
            </label>
            <label>
              <input
                type="checkbox"
                name="delegationSecretary"
                checked={member.delegationSecretary}
                onChange={handleChange}
                disabled={!member.delegationSecretary && selectedRolesCount >= 2}
              /> Delegation Secretary
            </label>
          </div>
          <small className="form-help">Select at least one and at most two roles</small>
        </div>
        
        <div className="form-group">
          <label>Appointment Letter:</label>
          {filePreview ? (
            <div className="file-preview">
              <span>{filePreview.name}</span>
              <button type="button" onClick={removeFile}>
                Remove
              </button>
              {filePreview.id && (
                <a
                  href={`${process.env.REACT_APP_BASE_URL}/country-committee-members/${id}/appointment-letter`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  Download Current Appointment Letter
                </a>
              )}
            </div>
          ) : (
            <div>
              <input
                type="file"
                id="appointmentLetter"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <small>PDF or Image (JPG, PNG) - Max 10MB</small>
            </div>
          )}
        </div>
        
        <button type="submit" className="btn btn-primary">Save</button>
        <button
          type="button"
          onClick={() => navigate('/sub-committee-members')}
          className="btn btn-cancel"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default MemberForm;