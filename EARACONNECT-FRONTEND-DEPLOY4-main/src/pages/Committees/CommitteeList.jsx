import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getCommittees,
  deleteCommittee,
  getSubCommittees,
  deleteSubCommittee
} from '../../services/committeeService';
import { FaEdit, FaTrash, FaPlus, FaUsers, FaLayerGroup, FaChevronDown, FaChevronUp, FaTimes, FaCrown, FaUserTie, FaFileAlt, FaUser } from 'react-icons/fa';
import './Committees.css';

const CommitteeList = () => {
  const [committees, setCommittees] = useState([]);
  const [subCommittees, setSubCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedCommittees, setExpandedCommittees] = useState(new Set());
  
  // Modal state
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [committeesData, subCommitteesData] = await Promise.all([
          getCommittees(),
          getSubCommittees()
        ]);
        setCommittees(committeesData);
        setSubCommittees(subCommitteesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch committee members from your backend API
  const fetchCommitteeMembers = async (committeeId, isSubCommittee) => {
    setLoadingMembers(true);
    try {
      const endpoint = isSubCommittee 
        ? `${process.env.REACT_APP_BASE_URL}/country-committee-members/sub-committee/${committeeId}`
        : `${process.env.REACT_APP_BASE_URL}/country-committee-members/committee/${committeeId}`;
      
      const response = await fetch(endpoint);
      if (response.ok) {
        let members = await response.json();
        
        // Transform boolean flags to role properties if needed
        members = Array.isArray(members) ? members.map(member => ({
          ...member,
          chair: member.isChair || member.chair,
          viceChair: member.isViceChair || member.viceChair,
          secretary: member.isCommitteeSecretary || member.isDelegationSecretary || member.secretary
        })) : [];
        
        setCommitteeMembers(members);
      } else if (response.status === 204) {
        setCommitteeMembers([]);
      } else {
        throw new Error('Failed to fetch members');
      }
    } catch (error) {
      console.error('Error fetching committee members:', error);
      setCommitteeMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCommitteeClick = async (committee, isSubCommittee = false) => {
    setSelectedCommittee({ ...committee, isSubCommittee });
    setShowMembersModal(true);
    await fetchCommitteeMembers(committee.id, isSubCommittee);
  };

  const closeMembersModal = () => {
    setShowMembersModal(false);
    setSelectedCommittee(null);
    setCommitteeMembers([]);
  };

  const handleDelete = async (id, isSubCommittee) => {
    const itemType = isSubCommittee ? 'sub-committee' : 'committee';
    if (window.confirm(`Are you sure you want to delete this ${itemType}?`)) {
      try {
        if (isSubCommittee) {
          await deleteSubCommittee(id);
          setSubCommittees(subCommittees.filter(sub => sub.id !== id));
        } else {
          await deleteCommittee(id);
          setCommittees(committees.filter(committee => committee.id !== id));
        }
      } catch (error) {
        console.error(`Error deleting ${itemType}:`, error);
        alert(`Failed to delete ${itemType}. Please try again.`);
      }
    }
  };

  const toggleCommitteeExpansion = (committeeId) => {
    const newExpanded = new Set(expandedCommittees);
    if (newExpanded.has(committeeId)) {
      newExpanded.delete(committeeId);
    } else {
      newExpanded.add(committeeId);
    }
    setExpandedCommittees(newExpanded);
  };

  const getCommitteeSubCommittees = (committeeId) => {
    return subCommittees.filter(sub => sub.parentCommitteeId === committeeId);
  };

  const getFilteredData = () => {
    switch (activeTab) {
      case 'committees':
        return { committees, subCommittees: [] };
      case 'subcommittees':
        return { committees: [], subCommittees };
      default:
        return { committees, subCommittees };
    }
  };

  const getTotalCount = () => {
    const filtered = getFilteredData();
    return filtered.committees.length + filtered.subCommittees.length;
  };

  const getRoleIcon = (member) => {
  if (!member) return <FaUser className="role-icon member" />;
  
  // Check role properties directly
  if (member.chair || member.role?.toLowerCase() === 'chair') {
    return <FaCrown className="role-icon chair" />;
  }
  if (member.viceChair || member.role?.toLowerCase() === 'vice-chair') {
    return <FaUserTie className="role-icon vice-chair" />;
  }
  if (member.secretary || member.role?.toLowerCase() === 'secretary') {
    return <FaFileAlt className="role-icon secretary" />;
  }
  return <FaUser className="role-icon member" />;
};

const getRoleLabel = (member) => {
  if (!member) return 'Member';
  
  if (member.chair || member.role?.toLowerCase() === 'chair') {
    return 'Chair';
  }
  if (member.viceChair || member.role?.toLowerCase() === 'vice-chair') {
    return 'Vice Chair';
  }
  if (member.secretary || member.role?.toLowerCase() === 'secretary') {
    return 'Secretary';
  }
  return 'Member';
};

const groupMembersByRole = (members = []) => {
  const groups = {
    chairs: [],
    viceChairs: [],
    secretaries: [],
    members: []
  };

  members.forEach(member => {
    if (!member) return;
    
    if (member.chair || member.role?.toLowerCase() === 'chair') {
      groups.chairs.push(member);
    } else if (member.viceChair || member.role?.toLowerCase() === 'vice-chair') {
      groups.viceChairs.push(member);
    } else if (member.secretary || member.role?.toLowerCase() === 'secretary') {
      groups.secretaries.push(member);
    } else {
      groups.members.push(member);
    }
  });

  return groups;
};

  if (loading) {
    return (
      <div className="committee-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading committees...</p>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const totalCount = getTotalCount();
  const groupedMembers = committeeMembers.length > 0 ? groupMembersByRole(committeeMembers) : null;

  return (
    <div className="committee-container">
      <div className="header">
        <div className="header-content">
          <h2 className="page-title">
            <FaUsers className="title-icon" />
            Committees
          </h2>
          <p className="page-subtitle">Manage committees</p>
        </div>
        <Link to="/committees/new" className="btn btn-primary">
          <FaPlus className="btn-icon" />
          New Committee
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <FaLayerGroup className="tab-icon" />
          All ({committees.length + subCommittees.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'committees' ? 'active' : ''}`}
          onClick={() => setActiveTab('committees')}
        >
          <FaUsers className="tab-icon" />
          Committees ({committees.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'subcommittees' ? 'active' : ''}`}
          onClick={() => setActiveTab('subcommittees')}
        >
          <FaLayerGroup className="tab-icon" />
          Sub-Committees ({subCommittees.length})
        </button>
      </div>

      {totalCount === 0 ? (
        <div className="empty-state">
          <FaUsers className="empty-icon" />
          <h3>No {activeTab === 'all' ? 'Committees' : activeTab === 'committees' ? 'Committees' : 'Sub-Committees'} Found</h3>
          <p>Start by adding your first committee to the system.</p>
          <Link to="/committees/new" className="btn btn-primary">
            <FaPlus className="btn-icon" />
            Add First Committee
          </Link>
        </div>
      ) : (
        <>
          <div className="results-header">
            <span className="results-count">
              {totalCount} {totalCount === 1 ? 'Item' : 'Items'} Found
            </span>
          </div>

          <div className="committees-grid">
            {/* Regular Committees */}
            {filteredData.committees.map(committee => {
              const committeeSubCommittees = getCommitteeSubCommittees(committee.id);
              const isExpanded = expandedCommittees.has(committee.id);
              
              return (
                <div key={`com-${committee.id}`} className="committee-card">
                  <div 
                    className="card-header clickable"
                    onClick={() => handleCommitteeClick(committee, false)}
                  >
                    <div className="committee-info">
                      <div className="committee-title-row">
                        <h3 className="committee-name">
                          <FaUsers className="committee-icon" />
                          {committee.name}
                        </h3>
                        <span className="committee-type">Committee</span>
                      </div>
                      
                      {committeeSubCommittees.length > 0 && (
                        <div className="sub-committee-info">
                          <button
                            className="expand-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCommitteeExpansion(committee.id);
                            }}
                          >
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                            <span>
                              {committeeSubCommittees.length} Sub-Committee{committeeSubCommittees.length !== 1 ? 's' : ''}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="view-members-hint">
                      <span>Click to view members</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <Link
                      to={`/committees/${committee.id}/edit`}
                      className="btn btn-edit"
                      title="Edit Committee"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(committee.id, false);
                      }}
                      className="btn btn-delete"
                      title="Delete Committee"
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </div>

                  {/* Sub-committees expansion */}
                  {isExpanded && committeeSubCommittees.length > 0 && (
                    <div className="sub-committees-section">
                      <h4 className="sub-committees-title">Sub-Committees</h4>
                      <div className="sub-committees-list">
                        {committeeSubCommittees.map(subCommittee => (
                          <div key={`sub-${subCommittee.id}`} className="sub-committee-item">
                            <div 
                              className="sub-committee-info clickable"
                              onClick={() => handleCommitteeClick(subCommittee, true)}
                            >
                              <span className="sub-committee-name">
                                <FaLayerGroup className="sub-committee-icon" />
                                {subCommittee.name}
                              </span>
                              <span className="view-members-hint-small">Click to view members</span>
                            </div>
                            <div className="sub-committee-actions">
                              <Link
                                to={`/committees/${subCommittee.id}/edit`}
                                className="btn btn-edit btn-sm"
                                title="Edit Sub-Committee"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FaEdit />
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(subCommittee.id, true);
                                }}
                                className="btn btn-delete btn-sm"
                                title="Delete Sub-Committee"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Standalone Sub-Committees (when viewing sub-committees tab) */}
            {filteredData.subCommittees.map(subCommittee => (
              <div key={`sub-${subCommittee.id}`} className="committee-card sub-committee-card">
                <div 
                  className="card-header clickable"
                  onClick={() => handleCommitteeClick(subCommittee, true)}
                >
                  <div className="committee-info">
                    <div className="committee-title-row">
                      <h3 className="committee-name">
                        <FaLayerGroup className="committee-icon" />
                        {subCommittee.name}
                      </h3>
                      <span className="committee-type sub-type">Sub-Committee</span>
                    </div>
                  </div>
                  <div className="view-members-hint">
                    <span>Click to view members</span>
                  </div>
                </div>

                <div className="card-actions">
                  <Link
                    to={`/committees/${subCommittee.id}/edit`}
                    className="btn btn-edit"
                    title="Edit Sub-Committee"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaEdit />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(subCommittee.id, true);
                    }}
                    className="btn btn-delete"
                    title="Delete Sub-Committee"
                  >
                    <FaTrash />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <div className="modal-overlay" onClick={closeMembersModal}>
          <div className="members-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-title-content">
                  {selectedCommittee?.isSubCommittee ? (
                    <FaLayerGroup className="modal-icon" />
                  ) : (
                    <FaUsers className="modal-icon" />
                  )}
                  <div>
                    <h3>{selectedCommittee?.name}</h3>
                    <p className="modal-subtitle">
                      {selectedCommittee?.isSubCommittee ? 'Sub-Committee' : 'Committee'} Members
                    </p>
                  </div>
                </div>
              </div>
              <button className="close-btn" onClick={closeMembersModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {loadingMembers ? (
                <div className="loading-members">
                  <div className="spinner"></div>
                  <p>Loading members...</p>
                </div>
              ) : committeeMembers.length === 0 ? (
                <div className="empty-members">
                  <FaUsers className="empty-members-icon" />
                  <h4>No Members Found</h4>
                  <p>This {selectedCommittee?.isSubCommittee ? 'sub-committee' : 'committee'} doesn't have any members yet.</p>
                </div>
              ) : (
                <div className="members-list">
                  {/* Chairs */}
                  {groupedMembers.chairs.length > 0 && (
                    <div className="role-group">
                      <h4 className="role-group-title">
                        <FaCrown className="role-group-icon chair" />
                        Chairs ({groupedMembers.chairs.length})
                      </h4>
                      <div className="members-grid">
                        {groupedMembers.chairs.map(member => (
                          <div key={member.id} className="member-card chair">
                            <div className="member-info">
                              <div className="member-avatar">
                                {getRoleIcon(member)}
                              </div>
                              <div className="member-details">
                                <h5 className="member-name">{member.name}</h5>
                                <p className="member-role">{getRoleLabel(member)}</p>
                                {member.email && <p className="member-email">{member.email}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vice Chairs */}
                  {groupedMembers.viceChairs.length > 0 && (
                    <div className="role-group">
                      <h4 className="role-group-title">
                        <FaUserTie className="role-group-icon vice-chair" />
                        Vice Chairs ({groupedMembers.viceChairs.length})
                      </h4>
                      <div className="members-grid">
                        {groupedMembers.viceChairs.map(member => (
                          <div key={member.id} className="member-card vice-chair">
                            <div className="member-info">
                              <div className="member-avatar">
                                {getRoleIcon(member.role)}
                              </div>
                              <div className="member-details">
                                <h5 className="member-name">{member.name}</h5>
                                <p className="member-role">{getRoleLabel(member.role)}</p>
                                {member.email && <p className="member-email">{member.email}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Secretaries */}
                  {groupedMembers.secretaries.length > 0 && (
                    <div className="role-group">
                      <h4 className="role-group-title">
                        <FaFileAlt className="role-group-icon secretary" />
                        Secretaries ({groupedMembers.secretaries.length})
                      </h4>
                      <div className="members-grid">
                        {groupedMembers.secretaries.map(member => (
                          <div key={member.id} className="member-card secretary">
                            <div className="member-info">
                              <div className="member-avatar">
                                {getRoleIcon(member.role)}
                              </div>
                              <div className="member-details">
                                <h5 className="member-name">{member.name}</h5>
                                <p className="member-role">{getRoleLabel(member.role)}</p>
                                {member.email && <p className="member-email">{member.email}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regular Members */}
                  {groupedMembers.members.length > 0 && (
                    <div className="role-group">
                      <h4 className="role-group-title">
                        <FaUser className="role-group-icon member" />
                        Members ({groupedMembers.members.length})
                      </h4>
                      <div className="members-grid">
                        {groupedMembers.members.map(member => (
                          <div key={member.id} className="member-card member">
                            <div className="member-info">
                              <div className="member-avatar">
                                {getRoleIcon(member.role)}
                              </div>
                              <div className="member-details">
                                <h5 className="member-name">{member.name}</h5>
                                <p className="member-role">{getRoleLabel(member.role)}</p>
                                {member.email && <p className="member-email">{member.email}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <div className="members-count">
                Total Members: {committeeMembers.length}
              </div>
              <button className="btn btn-secondary" onClick={closeMembersModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitteeList;