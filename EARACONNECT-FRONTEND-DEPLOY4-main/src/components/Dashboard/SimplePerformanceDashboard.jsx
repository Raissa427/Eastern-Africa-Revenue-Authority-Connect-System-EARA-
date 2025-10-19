import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  FaChartBar, FaGlobe, FaFileAlt, FaCheckCircle, FaClock, FaExclamationTriangle, FaCalendar, FaDatabase
} from 'react-icons/fa';
import './SimplePerformanceDashboard.css';

const SimplePerformanceDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    fetchAvailableYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchDashboardData(selectedYear);
    }
  }, [selectedYear]);

  // Fetch available years from database
  const fetchAvailableYears = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/dashboard/available-years`);
      if (response.ok) {
        const years = await response.json();
        setAvailableYears(years);
        if (years.length > 0 && !years.includes(selectedYear)) {
          setSelectedYear(years[0]);
        }
      } else {
        // Fallback to current year if API fails
        setAvailableYears([new Date().getFullYear()]);
      }
    } catch (err) {
      console.error('Error fetching years:', err);
      setAvailableYears([new Date().getFullYear()]);
    }
  };

  // Fetch dashboard data from database
  const fetchDashboardData = async (year) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/dashboard/performance/simple?year=${year}`);
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please check your database connection.');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <FaCheckCircle style={{ color: '#10B981' }} />;
      case 'down':
        return <FaExclamationTriangle style={{ color: '#EF4444' }} />;
      case 'stable':
        return <FaClock style={{ color: '#3B82F6' }} />;
      default:
        return <FaClock style={{ color: '#6B7280' }} />;
    }
  };

  const getTrendText = (trend) => {
    switch (trend) {
      case 'up': return 'up';
      case 'down': return 'down';
      case 'stable': return 'stable';
      default: return 'stable';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="simple-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading performance data from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="simple-dashboard-error">
        <FaDatabase className="error-icon" />
        <h3>Database Connection Error</h3>
        <p>{error}</p>
        <p>Please ensure your backend API is running and database is connected.</p>
        <button onClick={() => fetchDashboardData(selectedYear)} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  // Debug: Log the dashboard data structure
  console.log('🔍 SimplePerformanceDashboard: dashboardData:', dashboardData);
  console.log('🔍 SimplePerformanceDashboard: dashboardData.subcommittees:', dashboardData?.subcommittees);

  if (!dashboardData) {
    return (
      <div className="simple-dashboard-no-data">
        <FaDatabase className="no-data-icon" />
        <h3>No Data Available</h3>
        <p>Dashboard data is null or undefined.</p>
        <p>Please check your backend API connection.</p>
      </div>
    );
  }

  // Only check for subcommittees data - this is a SUBCOMMITTEE performance dashboard
  if (!dashboardData.subcommittees || dashboardData.subcommittees.length === 0) {
    return (
      <div className="simple-dashboard-no-data">
        <FaDatabase className="no-data-icon" />
        <h3>No Data Available</h3>
        <p>No subcommittee performance data found for {selectedYear}.</p>
        <p>Available data keys: {Object.keys(dashboardData).join(', ')}</p>
        <p>Please check your database or try a different year.</p>
      </div>
    );
  }

  // Use subcommittees data only - this is what we want
  const dataToUse = dashboardData.subcommittees;

  return (
    <div className="simple-performance-dashboard">
      {/* Year Selector */}
      <div className="year-selector">
        <h3><FaCalendar /> Select Year</h3>
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="year-select"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Monthly Overview Widget - Database Driven */}
      <div className="monthly-overview-widget">
        <h3><FaChartBar /> Performance Overview for {selectedYear}</h3>
        <div className="overview-metrics">
          <div className="metric-item">
            <span className="metric-label">APPROVAL RATE</span>
            <span className="metric-value">{dashboardData.monthlyOverview?.approvalRate || 0}%</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">TOTAL REVIEWS</span>
            <span className="metric-value">{dashboardData.monthlyOverview?.totalReviews || 0}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">TOTAL REPORTS</span>
            <span className="metric-value">{dashboardData.monthlyOverview?.totalReports || 0}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">TOTAL RESOLUTIONS</span>
            <span className="metric-value">{dashboardData.monthlyOverview?.totalResolutions || 0}</span>
          </div>
        </div>
      </div>

      {/* Subcommittee Performance Widget - Database Driven */}
      <div className="subcommittee-performance-widget">
        <h3><FaGlobe /> Subcommittee Performance for {selectedYear}</h3>
        <div className="performance-table">
          <table>
            <thead>
              <tr>
                <th>Subcommittee</th>
                <th>Reports</th>
                <th>Assigned Resolutions</th>
                <th>Approval Rate</th>
                <th>Performance %</th>
                <th>Task Assignment %</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {dataToUse.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.reports}</td>
                  <td>{item.assignedResolutions}</td>
                  <td>{item.approvalRate}%</td>
                  <td>{item.performancePercentage || 0}%</td>
                  <td>{item.taskAssignmentPercentage || 0}%</td>
                  <td className="trend-cell">
                    {getTrendIcon(item.trend)}
                    <span className="trend-text">{getTrendText(item.trend)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Bar Chart - Performance Metrics for Subcommittees */}
      <div className="chart-widget">
        <h3><FaFileAlt /> Performance Metrics for Subcommittees - {selectedYear}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataToUse}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="performancePercentage" fill="#8884d8" name="Performance %" />
            <Bar dataKey="taskAssignmentPercentage" fill="#82ca9d" name="Task Assignment %" />
            <Bar dataKey="approvalRate" fill="#ffc658" name="Approval Rate %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Pie Chart - Performance Percentage Distribution */}
      <div className="chart-widget">
        <h3><FaCheckCircle /> Performance Percentage Distribution for Subcommittees - {selectedYear}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dataToUse}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, performancePercentage }) => `${name}: ${performancePercentage || 0}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="performancePercentage"
            >
              {dataToUse.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Task Assignment Percentage Chart */}
      <div className="chart-widget">
        <h3><FaClock /> Task Assignment Percentage Distribution for Subcommittees - {selectedYear}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dataToUse}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, taskAssignmentPercentage }) => `${name}: ${taskAssignmentPercentage || 0}%`}
              outerRadius={80}
              fill="#82ca9d"
              dataKey="taskAssignmentPercentage"
            >
              {dataToUse.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Data Source Info */}
      <div className="data-source-info">
        <p><FaDatabase /> All data is fetched from your database for {selectedYear}</p>
        <p>Data type: Subcommittees ({dataToUse.length} items)</p>
        <p>Available data keys: {Object.keys(dashboardData).join(', ')}</p>
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default SimplePerformanceDashboard;
