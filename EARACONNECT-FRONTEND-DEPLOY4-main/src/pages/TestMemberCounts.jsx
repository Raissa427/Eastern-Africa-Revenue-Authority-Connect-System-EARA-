import React, { useState, useEffect } from 'react';
import SubcommitteeMemberService from '../services/subcommitteeMemberService';
import CommitteeMemberService from '../services/committeeMemberService';

const TestMemberCounts = () => {
  const [committees, setCommittees] = useState([]);
  const [subcommittees, setSubcommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('🔍 Testing member count services...');
      
      const [committeesWithMembers, subcommitteesWithMembers] = await Promise.all([
        CommitteeMemberService.getAllCommitteesWithMembers(),
        SubcommitteeMemberService.getAllSubcommitteesWithMembers()
      ]);

      setCommittees(committeesWithMembers);
      setSubcommittees(subcommitteesWithMembers);
      
      console.log('✅ Committees with members:', committeesWithMembers);
      console.log('✅ Subcommittees with members:', subcommitteesWithMembers);
      
    } catch (error) {
      console.error('❌ Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading member counts...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  const totalCommitteeMembers = committees.reduce((sum, c) => sum + (c.memberCount || 0), 0);
  const totalSubcommitteeMembers = subcommittees.reduce((sum, s) => sum + (s.memberCount || 0), 0);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🧪 Member Count Test Results</h2>
      
      <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f0f8ff', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>📊 Summary</h3>
        <p><strong>Total Committee Members:</strong> {totalCommitteeMembers}</p>
        <p><strong>Total Subcommittee Members:</strong> {totalSubcommitteeMembers}</p>
        <p><strong>Grand Total:</strong> {totalCommitteeMembers + totalSubcommitteeMembers}</p>
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        <div style={{ flex: 1 }}>
          <h3>🏛️ Committees ({committees.length})</h3>
          {committees.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No committees found</p>
          ) : (
            <div style={{ border: '1px solid #ddd', borderRadius: '5px' }}>
              {committees.map((committee, index) => (
                <div 
                  key={committee.id} 
                  style={{ 
                    padding: '12px', 
                    borderBottom: index < committees.length - 1 ? '1px solid #eee' : 'none',
                    backgroundColor: committee.memberCount > 0 ? '#f0f8f0' : '#fff8f0'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{committee.name}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    ID: {committee.id} | Members: {committee.memberCount || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h3>🏢 Subcommittees ({subcommittees.length})</h3>
          {subcommittees.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No subcommittees found</p>
          ) : (
            <div style={{ border: '1px solid #ddd', borderRadius: '5px' }}>
              {subcommittees.map((subcommittee, index) => (
                <div 
                  key={subcommittee.id} 
                  style={{ 
                    padding: '12px', 
                    borderBottom: index < subcommittees.length - 1 ? '1px solid #eee' : 'none',
                    backgroundColor: subcommittee.memberCount > 0 ? '#f0f8f0' : '#fff8f0'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{subcommittee.name}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    ID: {subcommittee.id} | Members: {subcommittee.memberCount || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f8f8', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h4>🔧 Expected vs Actual</h4>
        <p><strong>Expected Subcommittees with Members:</strong></p>
        <ul>
          <li>Head Of Delegation: 3 members</li>
          <li>IT Sub Committee: 3 members</li>
          <li>HR Sub Committee: 3 members</li>
        </ul>
        <p><strong>Expected Total:</strong> 9 members</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={fetchData} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default TestMemberCounts;
