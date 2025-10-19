import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendar, FaMapMarkerAlt, FaUsers, FaFileAlt, FaCheckCircle, FaTimesCircle, FaClock, FaUser, FaClipboardList, FaComments } from 'react-icons/fa';
import './MeetingDetailModal.css';

const MeetingDetailModal = ({ meeting, isOpen, onClose }) => {
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && meeting) {
      fetchMeetingDetails();
    }
  }, [isOpen, meeting]);

  const fetchMeetingDetails = async () => {
    if (!meeting?.id) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Fetch detailed meeting information
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/meetings/${meeting.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meeting details');
      }
      
      const meetingData = await response.json();
      
      // Fetch related data
      const [resolutionsResponse, attendanceResponse, invitationsResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_BASE_URL}/resolutions/meeting/${meeting.id}`),
        fetch(`${process.env.REACT_APP_BASE_URL}/attendance/meeting/${meeting.id}`),
        fetch(`${process.env.REACT_APP_BASE_URL}/meeting-invitations/meeting/${meeting.id}`)
      ]);
      
      const resolutions = resolutionsResponse.ok ? await resolutionsResponse.json() : [];
      const attendance = attendanceResponse.ok ? await attendanceResponse.json() : [];
      const invitations = invitationsResponse.ok ? await invitationsResponse.json() : [];
      
      setMeetingDetails({
        ...meetingData,
        resolutions,
        attendance,
        invitations
      });
    } catch (err) {
      console.error('Error fetching meeting details:', err);
      setError('Failed to load meeting details. Please try again.');
    } finally {
      setLoading(false);
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

  const getAttendanceStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
        return <FaCheckCircle className="status-icon present" />;
      case 'ABSENT':
        return <FaTimesCircle className="status-icon absent" />;
      case 'LATE':
        return <FaClock className="status-icon late" />;
      case 'EXCUSED':
        return <FaClock className="status-icon excused" />;
      default:
        return <FaUser className="status-icon unknown" />;
    }
  };

  const getInvitationStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <FaCheckCircle className="status-icon accepted" />;
      case 'DECLINED':
        return <FaTimesCircle className="status-icon declined" />;
      case 'PENDING':
        return <FaClock className="status-icon pending" />;
      case 'MAYBE':
        return <FaClock className="status-icon maybe" />;
      default:
        return <FaUser className="status-icon unknown" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="meeting-detail-modal-overlay" onClick={onClose}>
      <div className="meeting-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Meeting Details</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading meeting details...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : meetingDetails ? (
          <div className="modal-content">
            {/* Basic Meeting Information */}
            <div className="meeting-basic-info">
              <div className="meeting-header">
                <div className="meeting-type-badge">
                  {getMeetingTypeLabel(meetingDetails.meetingType)}
                </div>
                <div className="meeting-status">
                  Status: <span className={`status-${meetingDetails.status?.toLowerCase()}`}>
                    {meetingDetails.status}
                  </span>
                </div>
              </div>
              
              <h1 className="meeting-title">{meetingDetails.title}</h1>
              
              {meetingDetails.description && (
                <p className="meeting-description">{meetingDetails.description}</p>
              )}
              
              <div className="meeting-meta">
                <div className="meta-item">
                  <FaCalendar />
                  <span>{formatDate(meetingDetails.meetingDate)} at {formatTime(meetingDetails.meetingDate)}</span>
                </div>
                
                {meetingDetails.location && (
                  <div className="meta-item">
                    <FaMapMarkerAlt />
                    <span>{meetingDetails.location}</span>
                  </div>
                )}
                
                {meetingDetails.hostingCountry && (
                  <div className="meta-item">
                    <FaUsers />
                    <span>Hosted by {meetingDetails.hostingCountry.name}</span>
                  </div>
                )}
                
                {meetingDetails.createdBy && (
                  <div className="meta-item">
                    <FaUser />
                    <span>Created by {meetingDetails.createdBy.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Agenda */}
            {meetingDetails.agenda && (
              <div className="detail-section">
                <h3><FaClipboardList /> Agenda</h3>
                <div className="agenda-content">
                  {meetingDetails.agenda.split('\n').filter(item => item.trim()).map((item, index) => (
                    <div key={index} className="agenda-item">
                      <span className="agenda-number">{index + 1}.</span>
                      <span className="agenda-text">{item.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Minutes */}
            {meetingDetails.minutes && (
              <div className="detail-section">
                <h3><FaComments /> Meeting Minutes</h3>
                <div className="minutes-content">
                  {meetingDetails.minutes}
                </div>
              </div>
            )}

            {/* Resolutions */}
            {meetingDetails.resolutions && meetingDetails.resolutions.length > 0 && (
              <div className="detail-section">
                <h3><FaFileAlt /> Resolutions ({meetingDetails.resolutions.length})</h3>
                <div className="resolutions-list">
                  {meetingDetails.resolutions.map((resolution, index) => (
                    <div key={resolution.id} className="resolution-item">
                      <div className="resolution-header">
                        <h4>{resolution.title}</h4>
                        <span className={`resolution-status status-${resolution.status?.toLowerCase()}`}>
                          {resolution.status}
                        </span>
                      </div>
                      {resolution.description && (
                        <p className="resolution-description">{resolution.description}</p>
                      )}
                      <div className="resolution-meta">
                        <span>Created: {formatDate(resolution.createdAt)}</span>
                        {resolution.createdBy && (
                          <span>by {resolution.createdBy.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance */}
            {meetingDetails.attendance && meetingDetails.attendance.length > 0 && (
              <div className="detail-section">
                <h3><FaUsers /> Attendance ({meetingDetails.attendance.length})</h3>
                <div className="attendance-list">
                  {meetingDetails.attendance.map((record) => (
                    <div key={record.id} className="attendance-item">
                      {getAttendanceStatusIcon(record.status)}
                      <div className="attendance-details">
                        <span className="attendee-name">{record.user?.name || 'Unknown User'}</span>
                        <span className="attendance-status">{record.status}</span>
                      </div>
                      {record.notes && (
                        <span className="attendance-notes">{record.notes}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invitations */}
            {meetingDetails.invitations && meetingDetails.invitations.length > 0 && (
              <div className="detail-section">
                <h3><FaUsers /> Invitations ({meetingDetails.invitations.length})</h3>
                <div className="invitations-list">
                  {meetingDetails.invitations.map((invitation) => (
                    <div key={invitation.id} className="invitation-item">
                      {getInvitationStatusIcon(invitation.status)}
                      <div className="invitation-details">
                        <span className="invitee-name">{invitation.user?.name || 'Unknown User'}</span>
                        <span className="invitation-status">{invitation.status}</span>
                      </div>
                      <div className="invitation-meta">
                        <span>Sent: {formatDate(invitation.sentAt)}</span>
                        {invitation.respondedAt && (
                          <span>Responded: {formatDate(invitation.respondedAt)}</span>
                        )}
                      </div>
                      {invitation.responseComment && (
                        <div className="response-comment">
                          Comment: {invitation.responseComment}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting Statistics */}
            <div className="meeting-statistics">
              <h3>Meeting Summary</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{meetingDetails.invitations?.length || 0}</span>
                  <span className="stat-label">Total Invitations</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{meetingDetails.attendance?.length || 0}</span>
                  <span className="stat-label">Attendance Records</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{meetingDetails.resolutions?.length || 0}</span>
                  <span className="stat-label">Resolutions</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {meetingDetails.attendance?.filter(a => a.status === 'PRESENT').length || 0}
                  </span>
                  <span className="stat-label">Present</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="error-message">No meeting details available</div>
        )}
      </div>
    </div>
  );
};

export default MeetingDetailModal;
