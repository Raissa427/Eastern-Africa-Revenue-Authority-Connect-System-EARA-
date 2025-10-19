import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>EARA Connect Dashboard</h1>
      <div className="dashboard-cards">
        <Link to="/committees" className="dashboard-card">
          <h3>Committees</h3>
          <p>Manage committees</p>
        </Link>
        <Link to="/countries" className="dashboard-card">
          <h3>Countries</h3>
          <p>Manage countries</p>
        </Link>
        <Link to="/members" className="dashboard-card">
          <h3>Committee Members</h3>
          <p>Manage committee members</p>
        </Link>
        <Link to="/sub-committee-members" className="dashboard-card">
          <h3>Sub-Committee Members</h3>
          <p>Manage sub-committee members</p>
        </Link>
        <Link to="/eara-performance-dashboard" className="dashboard-card">
          <h3>Performance Dashboard</h3>
          <p>View performance metrics and analytics</p>
        </Link>
        <Link to="/simple-performance-dashboard" className="dashboard-card">
          <h3>Simple Performance Dashboard</h3>
          <p>View simple comparative diagrams for countries</p>
        </Link>
        <Link to="/test-simple-dashboard" className="dashboard-card">
          <h3>Test Simple Dashboard</h3>
          <p>Test the dashboard component directly</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;