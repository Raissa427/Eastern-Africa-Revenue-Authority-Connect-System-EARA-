import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaFileAlt, FaLink, FaCheckCircle } from 'react-icons/fa';
import './CreateMeeting.css';

const CreateMeeting = () => {
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState({
    title: '',
    description: '',
    agenda: '',
    meetingDate: '',
    meetingTime: '',
    location: '',
    meetingLink: '',
    invitationPdf: null,
    meetingType: '',
    hostingCountry: { id: '' }
  });

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/countries`);
      if (response.ok) {
        const data = await response.json();
        setCountries(data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeeting(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setMeeting(prev => ({
      ...prev,
      [name]: { id: value }
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setMeeting(prev => ({
        ...prev,
        invitationPdf: file
      }));
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const clearFile = () => {
    setMeeting(prev => ({
      ...prev,
      invitationPdf: null
    }));
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!meeting.title.trim()) {
      setError('Meeting title is required');
      setLoading(false);
      return;
    }
    if (!meeting.meetingDate) {
      setError('Meeting date is required');
      setLoading(false);
      return;
    }
    if (!meeting.meetingTime) {
      setError('Meeting time is required');
      setLoading(false);
      return;
    }
    if (!meeting.meetingType) {
      setError('Meeting type is required');
      setLoading(false);
      return;
    }
    if (!meeting.hostingCountry.id) {
      setError('Hosting country is required');
      setLoading(false);
      return;
    }
    
    // Validate meeting link if provided
    if (meeting.meetingLink.trim() && !isValidUrl(meeting.meetingLink)) {
      setError('Please enter a valid meeting link URL');
      setLoading(false);
      return;
    }

    try {
      // Get current user for createdBy field
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Combine date and time
      const dateTime = `${meeting.meetingDate}T${meeting.meetingTime}`;
      
      // Create meeting data as JSON
      const meetingData = {
        title: meeting.title,
        description: meeting.description,
        agenda: meeting.agenda,
        meetingDate: dateTime,
        location: meeting.location,
        meetingLink: meeting.meetingLink,
        meetingType: meeting.meetingType,
        hostingCountry: meeting.hostingCountry,
        createdBy: { id: user.id }
      };

      console.log('Sending meeting data:', meetingData); // Debug log

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });

      if (response.ok) {
        const createdMeeting = await response.json();
        
        // Upload PDF invitation if selected
        if (meeting.invitationPdf) {
          try {
            const pdfFormData = new FormData();
            pdfFormData.append('invitationPdf', meeting.invitationPdf);
            
            const pdfResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/meetings/${createdMeeting.id}/upload-invitation`, {
              method: 'POST',
              body: pdfFormData,
            });
            
            if (pdfResponse.ok) {
              console.log('PDF invitation uploaded successfully');
            } else {
              console.warn('PDF upload failed, but meeting was created');
            }
          } catch (pdfError) {
            console.warn('PDF upload error, but meeting was created:', pdfError);
          }
        }
        
        alert('Meeting created successfully!');
        navigate('/meetings/manage');
      } else {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        
        let errorMessage = 'Failed to create meeting';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      
      if (error.message.includes('User not authenticated')) {
        setError('Please log in again to continue.');
        setTimeout(() => {
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
          window.location.href = '/login';
        }, 2000);
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-meeting-container">
      <div className="create-meeting-header">
        <h1>Create Meeting</h1>
        <p>Schedule new Commissioner General or Technical Committee meetings</p>
      </div>

      <form onSubmit={handleSubmit} className="create-meeting-form">
        <div className="form-section">
          <h3>Meeting Details</h3>
          
          <div className="form-group">
            <label htmlFor="title">Meeting Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={meeting.title}
              onChange={handleChange}
              placeholder="Enter meeting title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={meeting.description}
              onChange={handleChange}
              placeholder="Enter meeting description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="agenda">Agenda Items</label>
            <textarea
              id="agenda"
              name="agenda"
              value={meeting.agenda}
              onChange={handleChange}
              placeholder="Enter agenda items (one per line)"
              rows="5"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Meeting Schedule</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="meetingDate">Meeting Date *</label>
              <input
                type="date"
                id="meetingDate"
                name="meetingDate"
                value={meeting.meetingDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="meetingTime">Meeting Time *</label>
              <input
                type="time"
                id="meetingTime"
                name="meetingTime"
                value={meeting.meetingTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="meetingType">Meeting Type *</label>
            <select
              id="meetingType"
              name="meetingType"
              value={meeting.meetingType}
              onChange={handleChange}
              required
            >
              <option value="">Select meeting type</option>
              <option value="COMMISSIONER_GENERAL_MEETING">Commissioner General Meeting (CG)</option>
              <option value="TECHNICAL_MEETING">Technical Committee Meeting (TC)</option>
              <option value="SUBCOMMITTEE_MEETING">Subcommittee Meeting</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Location & Host</h3>
          
          <div className="form-group">
            <label htmlFor="location">Meeting Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={meeting.location}
              onChange={handleChange}
              placeholder="Enter meeting location"
            />
          </div>

          <div className="form-group">
            <label htmlFor="meetingLink">Meeting Link (for online meetings)</label>
            <div className="input-with-icon">
              <input
                type="url"
                id="meetingLink"
                name="meetingLink"
                value={meeting.meetingLink}
                onChange={handleChange}
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                className={meeting.meetingLink && isValidUrl(meeting.meetingLink) ? 'valid-url' : ''}
              />
              {meeting.meetingLink && isValidUrl(meeting.meetingLink) && (
                <FaCheckCircle className="valid-icon" />
              )}
            </div>
            <small className="form-help">Add a meeting link if this is an online/virtual meeting</small>
          </div>

          <div className="form-group">
            <label htmlFor="invitationPdf">Invitation PDF</label>
            <input
              type="file"
              id="invitationPdf"
              name="invitationPdf"
              onChange={handleFileChange}
              accept=".pdf"
              className="file-input"
            />
            {meeting.invitationPdf && (
              <div className="file-selected">
                <span>Selected: {meeting.invitationPdf.name}</span>
                <button type="button" onClick={clearFile} className="clear-file-btn">
                  Clear
                </button>
              </div>
            )}
            <small className="form-help">Upload a PDF invitation document (optional)</small>
          </div>

          <div className="form-group">
            <label htmlFor="hostingCountry">Hosting Country *</label>
            <select
              id="hostingCountry"
              name="hostingCountry"
              value={meeting.hostingCountry.id}
              onChange={handleSelectChange}
              required
            >
              <option value="">Select hosting country</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/meetings/manage')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Meeting'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMeeting;