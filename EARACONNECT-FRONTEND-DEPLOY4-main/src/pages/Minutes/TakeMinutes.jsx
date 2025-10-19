import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileAlt, FaUsers, FaCalendar, FaSave, FaPlus, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import './TakeMinutes.css';

const TakeMinutes = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [minutes, setMinutes] = useState('');
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Select Meeting, 2: Minutes, 3: Resolutions
  const [savingMinutes, setSavingMinutes] = useState(false);
  const [creatingResolutions, setCreatingResolutions] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/meetings`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Invalid JSON response from server');
      }
      
      if (!Array.isArray(data)) {
        console.error('Expected array but got:', typeof data, data);
        throw new Error('Expected array of meetings from server');
      }
      
      // Filter out completed meetings - only show meetings that can still have minutes taken
      const activeMeetings = data.filter(meeting => 
        meeting.status !== 'COMPLETED' && 
        meeting.status !== 'completed'
      );
      
      setMeetings(activeMeetings);
      
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setError(`Failed to load meetings: ${error.message}`);
    }
  };

  const handleMeetingSelect = (meeting) => {
    setSelectedMeeting(meeting);
    setMinutes(meeting.minutes || '');
    if (meeting.resolutions && Array.isArray(meeting.resolutions)) {
      setResolutions(meeting.resolutions);
    } else {
      setResolutions([]);
    }
    setCurrentStep(2);
    setError('');
  };

  const goBackToMeetings = () => {
    setCurrentStep(1);
    setSelectedMeeting(null);
    setMinutes('');
    setResolutions([]);
    setError('');
  };

  const goToResolutions = () => {
    setCurrentStep(3);
    setError('');
  };

  const goBackToMinutes = () => {
    setCurrentStep(2);
    setError('');
  };

  const addResolution = () => {
    const newResolution = {
      id: Date.now(),
      title: '',
      description: '',
      status: 'ASSIGNED'
    };
    setResolutions([...resolutions, newResolution]);
  };

  const updateResolution = (index, field, value) => {
    const updatedResolutions = [...resolutions];
    updatedResolutions[index] = {
      ...updatedResolutions[index],
      [field]: value
    };
    setResolutions(updatedResolutions);
  };

  const removeResolution = (index) => {
    const updatedResolutions = resolutions.filter((_, i) => i !== index);
    setResolutions(updatedResolutions);
  };

  const saveMinutes = async () => {
    if (!selectedMeeting) {
      setError('Please select a meeting first');
      return;
    }

    if (!minutes.trim()) {
      setError('Please enter meeting minutes');
      return;
    }

    setSavingMinutes(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/meetings/${selectedMeeting.id}/minutes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minutes: minutes.trim()
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Minutes saved successfully:', result);
      setError('');
      goToResolutions();
      
    } catch (error) {
      console.error('Error saving minutes:', error);
      setError(`Failed to save minutes: ${error.message}`);
    } finally {
      setSavingMinutes(false);
    }
  };

  const createResolutions = async () => {
    if (!selectedMeeting) {
      setError('Please select a meeting first');
      return;
    }

    if (resolutions.length === 0) {
      setError('Please add at least one resolution');
      return;
    }

    const invalidResolutions = resolutions.filter(r => !r.title.trim() || !r.description.trim());
    if (invalidResolutions.length > 0) {
      setError('Please fill in all resolution titles and descriptions');
      return;
    }

    setCreatingResolutions(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/meetings/${selectedMeeting.id}/resolutions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolutions: resolutions.map(r => ({
            title: r.title.trim(),
            description: r.description.trim(),
            status: r.status || 'ASSIGNED'
          }))
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Resolutions created successfully:', result);
      alert('Resolutions created successfully!');
      navigate('/resolutions/assign');
      
    } catch (error) {
      console.error('Error creating resolutions:', error);
      setError(`Failed to create resolutions: ${error.message}`);
    } finally {
      setCreatingResolutions(false);
    }
  };

  const getMeetingTypeLabel = (type) => {
    switch (type) {
      case 'COMMISSIONER_GENERAL_MEETING':
        return 'Commissioner General Meeting (CG)';
      case 'TECHNICAL_MEETING':
        return 'Technical Committee Meeting (TC)';
      case 'SUBCOMMITTEE_MEETING':
        return 'Subcommittee Meeting';
      default:
        return type;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Step 1: Meeting Selection
  const renderMeetingSelection = () => (
    <div className="step-container meeting-selection-step">
      <div className="step-header">
        <h1>Select Meeting</h1>
        <p>Choose a meeting to take minutes for</p>
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {meetings.length === 0 ? (
        <div className="empty-state">
          <p>No active meetings available for taking minutes. All meetings are either completed or not yet scheduled.</p>
        </div>
      ) : (
        <div className="meetings-grid">
          {meetings.map(meeting => (
            <div
              key={meeting.id}
              className="meeting-card"
              onClick={() => handleMeetingSelect(meeting)}
            >
              <div className="meeting-card-header">
                <h3>{meeting.title}</h3>
                <span className={`status-badge ${meeting.status?.toLowerCase() || 'unknown'}`}>
                  {meeting.status || 'UNKNOWN'}
                </span>
              </div>
              
              <div className="meeting-card-content">
                <div className="meeting-type">
                  {getMeetingTypeLabel(meeting.meetingType)}
                </div>
                
                <div className="meeting-details">
                  <div className="detail-item">
                    <FaCalendar />
                    <span>{formatDate(meeting.meetingDate)} at {formatTime(meeting.meetingDate)}</span>
                  </div>
                  
                  {meeting.location && (
                    <div className="detail-item">
                      <FaUsers />
                      <span>{meeting.location}</span>
                    </div>
                  )}
                  
                  {meeting.hostingCountry && (
                    <div className="detail-item">
                      <FaUsers />
                      <span>Hosted by {meeting.hostingCountry.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Step 2: Meeting Minutes
  const renderMinutesStep = () => (
    <div className="step-container minutes-step">
      <div className="step-header">
        <button className="back-button" onClick={goBackToMeetings}>
          <FaArrowLeft /> Back to Meetings
        </button>
        <h1>Meeting Minutes</h1>
        <div className="selected-meeting-info">
          <h2>{selectedMeeting?.title}</h2>
          <p>{formatDate(selectedMeeting?.meetingDate)} at {formatTime(selectedMeeting?.meetingDate)}</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="minutes-form">
        <div className="form-group">
          <label htmlFor="minutes">Minutes Content</label>
          <textarea
            id="minutes"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="Record the meeting minutes here..."
            rows="15"
            disabled={savingMinutes}
          />
        </div>
        
        <div className="form-actions">
          <button
            onClick={saveMinutes}
            className="btn btn-primary"
            disabled={savingMinutes || !minutes.trim()}
          >
            {savingMinutes ? <FaCheckCircle /> : <FaSave />}
            {savingMinutes ? 'Saving...' : 'Save Minutes'}
          </button>
        </div>
      </div>
    </div>
  );

  // Step 3: Resolutions
  const renderResolutionsStep = () => (
    <div className="step-container resolutions-step">
      <div className="step-header">
        <button className="back-button" onClick={goBackToMinutes}>
          <FaArrowLeft /> Back to Minutes
        </button>
        <h1>Create Resolutions</h1>
        <div className="selected-meeting-info">
          <h2>{selectedMeeting?.title}</h2>
          <p>{formatDate(selectedMeeting?.meetingDate)} at {formatTime(selectedMeeting?.meetingDate)}</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="resolutions-form">
        <div className="resolutions-header">
          <h3>Resolutions</h3>
          <button
            onClick={addResolution}
            className="btn btn-secondary"
            disabled={creatingResolutions}
          >
            <FaPlus /> Add Resolution
          </button>
        </div>

        {resolutions.length === 0 ? (
          <div className="empty-resolutions">
            <p>No resolutions added yet. Click "Add Resolution" to get started.</p>
          </div>
        ) : (
          <div className="resolutions-list">
            {resolutions.map((resolution, index) => (
              <div key={resolution.id || index} className="resolution-form-item">
                <div className="resolution-header">
                  <h4>Resolution {index + 1}</h4>
                  <button
                    onClick={() => removeResolution(index)}
                    className="btn btn-danger"
                    disabled={creatingResolutions}
                  >
                    Remove
                  </button>
                </div>
                
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={resolution.title}
                    onChange={(e) => updateResolution(index, 'title', e.target.value)}
                    placeholder="Enter resolution title"
                    disabled={creatingResolutions}
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={resolution.description}
                    onChange={(e) => updateResolution(index, 'description', e.target.value)}
                    placeholder="Enter resolution description"
                    rows="6"
                    disabled={creatingResolutions}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {resolutions.length > 0 && (
          <div className="form-actions">
            <button
              onClick={createResolutions}
              className="btn btn-primary"
              disabled={creatingResolutions || resolutions.some(r => !r.title.trim() || !r.description.trim())}
            >
              <FaFileAlt />
              {creatingResolutions ? 'Creating...' : 'Create Resolutions'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Main render based on current step
  return (
    <div className="take-minutes-container">
      {currentStep === 1 && renderMeetingSelection()}
      {currentStep === 2 && renderMinutesStep()}
      {currentStep === 3 && renderResolutionsStep()}
    </div>
  );
};

export default TakeMinutes;