import React from 'react';
import SimplePerformanceDashboard from '../../components/Dashboard/SimplePerformanceDashboard';

const SimplePerformanceDashboardPage = () => {
  const pageStyles = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  };

  const headerStyles = {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    color: 'white',
    padding: '30px 20px',
    textAlign: 'center'
  };

  const headerContentStyles = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const titleStyles = {
    margin: '0 0 10px 0',
    fontSize: '2rem',
    fontWeight: '600'
  };

  const descriptionStyles = {
    margin: '0',
    fontSize: '1rem',
    opacity: '0.9',
    maxWidth: '500px',
    margin: '0 auto'
  };

  return (
    <div style={pageStyles}>
      <div style={headerStyles}>
        <div style={headerContentStyles}>
          <h1 style={titleStyles}>Simple Performance Dashboard</h1>
          <p style={descriptionStyles}>Simple comparative diagrams for subcommittees based on reports and assigned resolutions</p>
        </div>
      </div>
      <SimplePerformanceDashboard />
    </div>
  );
};

export default SimplePerformanceDashboardPage;
