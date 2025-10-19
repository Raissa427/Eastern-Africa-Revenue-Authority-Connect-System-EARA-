import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const MemberDashboard = () => {
  return (
    <div className="dashboard">
      <h1>Member Dashboard</h1>
      <p>Welcome! As a Committee Member, you can view committees and related information.</p>
      <div className="dashboard-cards">
        <Link to="/committees" className="dashboard-card">
          <h3>Committees</h3>
          <p>View committees and their information</p>
        </Link>
      </div>
    </div>
  );
};

export default MemberDashboard; 