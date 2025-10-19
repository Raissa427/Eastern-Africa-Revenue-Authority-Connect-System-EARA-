import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMembers, deleteMember } from '../../services/SubmemberService';
import './SubCommitteeMembers.css';
import { FaEdit, FaTrash, FaEye, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Ensure members is always an array and add defensive programming
  const safeMembers = useMemo(() => {
    console.log('Members state:', members, 'Type:', typeof members, 'IsArray:', Array.isArray(members));
    if (!members) return [];
    if (!Array.isArray(members)) {
      console.error('Members is not an array:', members);
      return [];
    }
    return members;
  }, [members]);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchMembers(currentPage, 10, 'name', 'ASC');
        console.log('MemberList received response:', response);
        
        if (response && response.content && Array.isArray(response.content)) {
          setMembers(response.content);
          setTotalPages(response.totalPages || 1);
        } else {
          console.error('Invalid response structure:', response);
          setError('Invalid response from server');
          setMembers([]);
        }
      } catch (err) {
        console.error('Error loading members:', err);
        setError(err.message);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [currentPage]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteMember(id);
        setMembers(safeMembers.filter(member => member.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const filtered = await fetchMembers(1, 10, 'name', 'ASC', searchTerm);
      console.log('Search response:', filtered);
      
      if (filtered && filtered.content && Array.isArray(filtered.content)) {
        setMembers(filtered.content);
        setTotalPages(filtered.totalPages || 1);
        setCurrentPage(1);
      } else {
        console.error('Invalid search response structure:', filtered);
        setError('Invalid response from server');
        setMembers([]);
      }
    } catch (err) {
      console.error('Error searching members:', err);
      setError(err.message);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (member) => {
    if (member.isChair) return <span className="badge chair">Chair</span>;
    if (member.isViceChair) return <span className="badge vice-chair">Vice Chair</span>;
    if (member.isCommitteeSecretary) return <span className="badge secretary">Secretary</span>;
    if (member.isCommitteeMember) return <span className="badge member">Member</span>;
    
    return null;
  };

  console.log('Rendering MemberList with safeMembers:', safeMembers);
  
  return (
    <div className="member-list-container">
      <div className="header">
        <h2>Sub-Committee Members</h2>
        <Link to="/sub-committee-members/new" className="btn btn-primary">
          Add New Member
        </Link>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className="btn btn-search">
          <FaSearch /> Search
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading members...</div>
      ) : (
        <>
          <table className="member-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Country</th>
                <th>Sub-Committee</th>
                <th>Position</th>
                <th>Appointed</th>
                <th>Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeMembers && Array.isArray(safeMembers) && safeMembers.length > 0 ? (
                safeMembers.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>{member.country?.name || '-'}</td>
                    <td>{member.subCommittee?.name || '-'}</td>
                    <td>{member.positionInYourRA || '-'}</td>
                    <td>{member.appointedDate || '-'}</td>
                    <td>
                      {getRoleBadge(member)}
                      {member.isDelegationSecretary && (
                        <span className="badge delegation">Delegation Sec.</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => navigate(`/sub-committee-members/${member.id}/edit`)}
                        className="btn-icon btn-edit"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="btn-icon btn-delete"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={() => navigate(`/sub-committee-members/${member.id}`)}
                        className="btn-icon btn-view"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-results">
                    {!safeMembers || !Array.isArray(safeMembers) ? 'Error loading members' : 'No members found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="btn-pagination"
            >
              <FaChevronLeft /> Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="btn-pagination"
            >
              Next <FaChevronRight />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MemberList;