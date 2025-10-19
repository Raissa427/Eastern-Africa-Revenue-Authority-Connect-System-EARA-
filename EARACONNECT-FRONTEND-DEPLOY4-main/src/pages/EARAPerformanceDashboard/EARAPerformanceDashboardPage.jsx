import React from 'react';
import { useNavigate } from 'react-router-dom';
import EARAPerformanceDashboard from '../../components/Dashboard/EARAPerformanceDashboard';
import './EARAPerformanceDashboardPage.css';

const EARAPerformanceDashboardPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="eara-performance-dashboard-page">
      <div className="page-header">
        <div className="header-content">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <h1>EARACONNECT Performance Dashboard</h1>
          <p>Comprehensive analytics and performance metrics for committee members, subcommittees, and secretaries</p>
        </div>
      </div>
      
      <EARAPerformanceDashboard />
    </div>
  );
};

export default EARAPerformanceDashboardPage;
