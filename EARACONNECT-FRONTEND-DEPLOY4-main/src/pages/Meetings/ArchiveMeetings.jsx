import React, { useState, useEffect } from 'react';
import { FaCalendar, FaSearch, FaFileAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import MeetingDetailModal from '../../components/MeetingDetailModal';
import './ArchiveMeetings.css';

const ArchiveMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    filterMeetings();
  }, [meetings, selectedYear, searchTerm]);

  const fetchMeetings = async () => {
    try {
      // Always fetch the same data source that Secretary uses (all meetings)
      // This ensures all roles see the same data as Secretary
      // Use the same API endpoint and logic regardless of user role
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/meetings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Ensure we get the same data as Secretary (no role-based filtering)
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter to only show completed meetings (same logic as Secretary)
        const completedMeetings = data.filter(meeting => 
          meeting.status === 'COMPLETED'
        );
        setMeetings(completedMeetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const filterMeetings = () => {
    let filtered = [...meetings];

    // Filter by year
    if (selectedYear) {
      filtered = filtered.filter(meeting => {
        const meetingYear = new Date(meeting.meetingDate).getFullYear().toString();
        return meetingYear === selectedYear;
      });
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(meeting =>
        meeting.title.toLowerCase().includes(term) ||
        meeting.description?.toLowerCase().includes(term) ||
        meeting.meetingType.toLowerCase().includes(term) ||
        meeting.location?.toLowerCase().includes(term) ||
        meeting.hostingCountry?.name?.toLowerCase().includes(term)
      );
    }

    setFilteredMeetings(filtered);
  };

  const getAvailableYears = () => {
    const years = new Set();
    meetings.forEach(meeting => {
      const year = new Date(meeting.meetingDate).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  };

  const handleMeetingClick = (meeting) => {
    setSelectedMeeting(meeting);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMeeting(null);
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

  if (loading) {
    return (
      <div className="archive-meetings-container">
        <div className="loading">Loading archived meetings...</div>
      </div>
    );
  }

  return (
    <div className="archive-meetings-container">
      <div className="archive-meetings-header">
        <h1>Archive Meetings</h1>
        <p>Search and view past meetings by year</p>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search meetings by title, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="year-filter">
          <label htmlFor="yearSelect">Filter by Year:</label>
          <select
            id="yearSelect"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="year-select"
          >
            <option value="">All Years</option>
            {getAvailableYears().map(year => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Results Summary */}
      <div className="results-summary">
        <p>
          Showing {filteredMeetings.length} of {meetings.length} archived meetings
          {selectedYear && ` for ${selectedYear}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>

      {/* Meetings List */}
      <div className="meetings-list">
        {filteredMeetings.length === 0 ? (
          <div className="empty-state">
            <FaCalendar className="empty-icon" />
            <h3>No meetings found</h3>
            <p>
              {selectedYear || searchTerm 
                ? 'Try adjusting your search criteria or year filter.'
                : 'No completed meetings found in the archive.'
              }
            </p>
          </div>
        ) : (
          filteredMeetings.map(meeting => (
            <div 
              key={meeting.id} 
              className="meeting-card clickable"
              onClick={() => handleMeetingClick(meeting)}
            >
              <div className="meeting-header">
                <div className="meeting-type-badge">
                  {getMeetingTypeLabel(meeting.meetingType)}
                </div>
                <div className="meeting-date">
                  <FaCalendar />
                  {formatDate(meeting.meetingDate)} at {formatTime(meeting.meetingDate)}
                </div>
              </div>

              <div className="meeting-content">
                <h3 className="meeting-title">{meeting.title}</h3>
                
                {meeting.description && (
                  <p className="meeting-description">{meeting.description}</p>
                )}

                <div className="meeting-details">
                  {meeting.location && (
                    <div className="meeting-detail">
                      <FaMapMarkerAlt />
                      <span>{meeting.location}</span>
                    </div>
                  )}
                  
                  {meeting.hostingCountry && (
                    <div className="meeting-detail">
                      <FaUsers />
                      <span>Hosted by {meeting.hostingCountry.name}</span>
                    </div>
                  )}
                </div>

                {meeting.agenda && (
                  <div className="meeting-agenda">
                    <h4>Agenda Items:</h4>
                    <ul>
                      {meeting.agenda.split('\n').filter(item => item.trim()).map((item, index) => (
                        <li key={index}>{item.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {meeting.minutes && (
                  <div className="meeting-minutes">
                    <h4>Minutes:</h4>
                    <p>{meeting.minutes}</p>
                  </div>
                )}
              </div>

              <div className="meeting-footer">
                <div className="meeting-stats">
                  {meeting.invitations && (
                    <span className="stat">
                      <FaUsers /> {meeting.invitations.length} Invitations
                    </span>
                  )}
                  {meeting.resolutions && (
                    <span className="stat">
                      <FaFileAlt /> {meeting.resolutions.length} Resolutions
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Meeting Detail Modal */}
      <MeetingDetailModal
        meeting={selectedMeeting}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default ArchiveMeetings; 