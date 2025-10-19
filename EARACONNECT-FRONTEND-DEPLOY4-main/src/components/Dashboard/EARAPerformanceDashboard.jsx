import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  FaChartBar, FaUsers, FaCheckCircle, FaClock, FaExclamationTriangle,
  FaGlobe, FaBuilding, FaTasks, FaChartLine, FaDownload, FaSync
} from 'react-icons/fa';
import EARADashboardService from '../../services/earaDashboardService';
import './EARAPerformanceDashboard.css';

const EARAPerformanceDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCommittee, setSelectedCommittee] = useState('all');
  const [timeFilter, setTimeFilter] = useState('month');
  const [countries, setCountries] = useState([]);
  const [committees, setCommittees] = useState([]);

  // Enhanced sample data structure with more realistic project data
  const sampleData = {
    countries: ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi'],
    committees: ['Finance', 'Audit', 'Compliance', 'Risk Management'],
    performanceMetrics: {
      approvalRate: 85,
      taskCompletion: 72,
      averageResolutionTime: 15,
      memberParticipation: 88
    },
    countryPerformance: [
      { country: 'Kenya', approvalRate: 90, taskCompletion: 85, resolutionTime: 12, participation: 92 },
      { country: 'Uganda', approvalRate: 82, taskCompletion: 78, resolutionTime: 18, participation: 85 },
      { country: 'Tanzania', approvalRate: 88, taskCompletion: 80, resolutionTime: 14, participation: 89 },
      { country: 'Rwanda', approvalRate: 85, taskCompletion: 75, resolutionTime: 16, participation: 87 },
      { country: 'Burundi', approvalRate: 80, taskCompletion: 70, resolutionTime: 20, participation: 83 }
    ],
    resolutionStatus: [
      { name: 'Approved', value: 156, percentage: 65, color: '#10B981' },
      { name: 'Pending', value: 45, percentage: 19, color: '#F59E0B' },
      { name: 'Under Review', value: 25, percentage: 10, color: '#3B82F6' },
      { name: 'Rejected', value: 15, percentage: 6, color: '#EF4444' }
    ],
    monthlyTrends: [
      { month: 'Jan', approvals: 45, tasks: 52, resolutions: 38 },
      { month: 'Feb', approvals: 52, tasks: 48, resolutions: 42 },
      { month: 'Mar', approvals: 48, tasks: 55, resolutions: 45 },
      { month: 'Apr', approvals: 55, tasks: 50, resolutions: 48 },
      { month: 'May', approvals: 50, tasks: 53, resolutions: 51 },
      { month: 'Jun', approvals: 58, tasks: 47, resolutions: 54 }
    ],
    taskAssignments: [
      { committee: 'Finance', assigned: 45, completed: 38, pending: 7 },
      { committee: 'Audit', assigned: 38, completed: 32, pending: 6 },
      { committee: 'Compliance', assigned: 42, completed: 35, pending: 7 },
      { committee: 'Risk Management', assigned: 35, completed: 28, pending: 7 }
    ],
    // Enhanced Gantt data similar to the PROJECT MANAGEMENT DASHBOARD
    ganttData: [
      { task: 'Q1 Review', start: '2024-01-01', end: '2024-03-31', progress: 100, status: 'completed', days: 90 },
      { task: 'Q2 Planning', start: '2024-04-01', end: '2024-06-30', progress: 75, status: 'in-progress', days: 90 },
      { task: 'Annual Audit', start: '2024-07-01', end: '2024-09-30', progress: 25, status: 'in-progress', days: 90 },
      { task: 'Budget Review', start: '2024-10-01', end: '2024-12-31', progress: 0, status: 'pending', days: 90 },
      { task: 'Risk Assessment', start: '2024-02-01', end: '2024-04-30', progress: 100, status: 'completed', days: 90 },
      { task: 'Compliance Check', start: '2024-05-01', end: '2024-07-31', progress: 60, status: 'in-progress', days: 90 }
    ]
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (countries.length > 0 && committees.length > 0) {
      fetchDashboardData();
    }
  }, [selectedCountry, selectedCommittee, timeFilter, countries, committees]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch countries and committees first
      const [countriesData, committeesData] = await Promise.all([
        EARADashboardService.getAvailableCountries(),
        EARADashboardService.getAvailableCommittees()
      ]);
      
      setCountries(countriesData);
      setCommittees(committeesData);
    } catch (error) {
      console.warn('Using fallback data for countries and committees');
      setCountries(sampleData.countries);
      setCommittees(sampleData.committees);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch real data from API
      const data = await EARADashboardService.getComprehensiveDashboardData(
        selectedCountry, 
        selectedCommittee, 
        timeFilter
      );
      
      setDashboardData(data);
    } catch (err) {
      console.warn('Using fallback sample data due to API error:', err);
      setDashboardData(sampleData);
      // Don't set error for fallback data
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      await EARADashboardService.exportDashboardData(format, selectedCountry, selectedCommittee, timeFilter);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const getPerformanceColor = (value, threshold = 80) => {
    if (value >= threshold) return '#10B981';
    if (value >= threshold * 0.8) return '#F59E0B';
    return '#EF4444';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in-progress': return '#F59E0B';
      case 'pending': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="eara-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eara-dashboard-error">
        <FaExclamationTriangle className="error-icon" />
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-button">
          <FaSync /> Retry
        </button>
      </div>
    );
  }

  const data = dashboardData || sampleData;

  return (
    <div className="eara-performance-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1><FaChartBar /> EARACONNECT Performance Dashboard</h1>
          <p>Comprehensive performance metrics and analytics for committee members, subcommittees, and secretaries</p>
        </div>
        <div className="header-actions">
          <button className="action-button" onClick={fetchDashboardData}>
            <FaSync /> Refresh
          </button>
          <button className="action-button" onClick={() => handleExport('csv')}>
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="dashboard-filters">
        <div className="filter-group">
          <label>Country:</label>
          <select 
            value={selectedCountry} 
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Countries</option>
            {data.countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Committee:</label>
          <select 
            value={selectedCommittee} 
            onChange={(e) => setSelectedCommittee(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Committees</option>
            {data.committees.map(committee => (
              <option key={committee} value={committee}>{committee}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Time Period:</label>
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="kpi-section">
        <div className="kpi-card">
          <div className="kpi-icon">
            <FaCheckCircle style={{ color: getPerformanceColor(data.performanceMetrics.approvalRate) }} />
          </div>
          <div className="kpi-content">
            <h3>Approval Rate</h3>
            <p className="kpi-value">{data.performanceMetrics.approvalRate}%</p>
            <p className="kpi-change positive">+5.2% from last month</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">
            <FaTasks style={{ color: getPerformanceColor(data.performanceMetrics.taskCompletion) }} />
          </div>
          <div className="kpi-content">
            <h3>Task Completion</h3>
            <p className="kpi-value">{data.performanceMetrics.taskCompletion}%</p>
            <p className="kpi-change positive">+3.8% from last month</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">
            <FaClock style={{ color: getPerformanceColor(100 - data.performanceMetrics.averageResolutionTime * 2) }} />
          </div>
          <div className="kpi-content">
            <h3>Avg Resolution Time</h3>
            <p className="kpi-value">{data.performanceMetrics.averageResolutionTime} days</p>
            <p className="kpi-change negative">+2.1 days from last month</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">
            <FaUsers style={{ color: getPerformanceColor(data.performanceMetrics.memberParticipation) }} />
          </div>
          <div className="kpi-content">
            <h3>Member Participation</h3>
            <p className="kpi-value">{data.performanceMetrics.memberParticipation}%</p>
            <p className="kpi-change positive">+1.5% from last month</p>
          </div>
        </div>
      </div>

      {/* Charts Section - Ensuring all charts are visible */}
      <div className="charts-section">
        {/* Country Performance Comparison - Bar Chart */}
        <div className="chart-container">
          <h3><FaGlobe /> Country Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.countryPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="approvalRate" fill="#8884d8" name="Approval Rate (%)" />
              <Bar dataKey="taskCompletion" fill="#82ca9d" name="Task Completion (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resolution Status Distribution - Pie Chart */}
        <div className="chart-container">
          <h3><FaChartBar /> Resolution Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.resolutionStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.resolutionStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends - Area Chart */}
        <div className="chart-container">
          <h3><FaChartLine /> Monthly Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="approvals" stackId="1" stroke="#8884d8" fill="#8884d8" name="Approvals" />
              <Area type="monotone" dataKey="tasks" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Tasks" />
              <Area type="monotone" dataKey="resolutions" stackId="1" stroke="#ffc658" fill="#ffc658" name="Resolutions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task Assignment Progress - Bar Chart */}
        <div className="chart-container">
          <h3><FaTasks /> Task Assignment Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.taskAssignments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="committee" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="assigned" fill="#8884d8" name="Assigned" />
              <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
              <Bar dataKey="pending" fill="#ffc658" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gantt Chart Section - Similar to PROJECT MANAGEMENT DASHBOARD */}
      <div className="gantt-section">
        <h3><FaChartBar /> Project Timeline (Gantt Chart)</h3>
        <div className="gantt-container">
          {data.ganttData.map((item, index) => (
            <div key={index} className="gantt-item">
              <div className="gantt-task-info">
                <span className="task-name">{item.task}</span>
                <span className="task-dates">{item.start} - {item.end}</span>
              </div>
              <div className="gantt-progress-bar">
                <div 
                  className="gantt-progress-fill"
                  style={{ 
                    width: `${item.progress}%`,
                    backgroundColor: getStatusColor(item.status)
                  }}
                ></div>
                <span className="progress-text">{item.progress}%</span>
              </div>
              <span className={`task-status status-${item.status}`}>
                {item.status.replace('-', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Days Per Project - Horizontal Bar Chart (Similar to PROJECT MANAGEMENT DASHBOARD) */}
      <div className="chart-container">
        <h3><FaChartBar /> Days Per Project</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.ganttData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="task" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="days" fill="#8884d8" name="Days" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Summary Table */}
      <div className="summary-section">
        <h3><FaBuilding /> Performance Summary by Country</h3>
        <div className="summary-table-container">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Approval Rate</th>
                <th>Task Completion</th>
                <th>Resolution Time (days)</th>
                <th>Participation Rate</th>
                <th>Performance Score</th>
              </tr>
            </thead>
            <tbody>
              {data.countryPerformance.map((country, index) => {
                const performanceScore = Math.round(
                  (country.approvalRate + country.taskCompletion + (100 - country.resolutionTime * 2) + country.participation) / 4
                );
                return (
                  <tr key={index}>
                    <td>{country.country}</td>
                    <td>
                      <div className="metric-with-bar">
                        <span>{country.approvalRate}%</span>
                        <div className="metric-bar">
                          <div 
                            className="metric-bar-fill"
                            style={{ 
                              width: `${country.approvalRate}%`,
                              backgroundColor: getPerformanceColor(country.approvalRate)
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="metric-with-bar">
                        <span>{country.taskCompletion}%</span>
                        <div className="metric-bar">
                          <div 
                            className="metric-bar-fill"
                            style={{ 
                              width: `${country.taskCompletion}%`,
                              backgroundColor: getPerformanceColor(country.taskCompletion)
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>{country.resolutionTime}</td>
                    <td>
                      <div className="metric-with-bar">
                        <span>{country.participation}%</span>
                        <div className="metric-bar">
                          <div 
                            className="metric-bar-fill"
                            style={{ 
                              width: `${country.participation}%`,
                              backgroundColor: getPerformanceColor(country.participation)
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`performance-score score-${performanceScore >= 80 ? 'high' : performanceScore >= 60 ? 'medium' : 'low'}`}>
                        {performanceScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EARAPerformanceDashboard;
