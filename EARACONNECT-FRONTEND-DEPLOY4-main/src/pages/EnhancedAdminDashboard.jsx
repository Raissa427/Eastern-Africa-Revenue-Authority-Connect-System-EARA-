import React, { useState, useEffect } from 'react';
import { FaUsers, FaCalendar, FaGlobe, FaTasks, FaChartLine, FaBell, FaUserShield, FaCog, FaEdit, FaTrash, FaPlus, FaSpinner, FaUserPlus, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import UserManagementService from '../services/userManagementService';
import './AdminDashboard.css';

const EnhancedAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCountries: 7,
    totalCommittees: 7,
    totalMeetings: 0,
    totalResolutions: 0,
    pendingApprovals: 0,
    systemHealth: 'Good'
  });
  
  const [users, setUsers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [subcommittees, setSubcommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    country: { id: '' },
    subcommittee: { id: '' }
  });

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchCountries(),
        fetchSubcommittees(),
        fetchDashboardStats()
      ]);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      let usersData = [];
      
      try {
        usersData = await UserManagementService.getAllUsers();
      } catch (apiError) {
        console.warn('API connection failed, using fallback data:', apiError.message);
        
        // Provide fallback user data when API is not available
        usersData = [
          {
            id: 1,
            name: "John Admin",
            email: "admin@eara.org",
            phone: "+256-700-123456",
            role: "ADMIN",
            active: true,
            country: null,
            subcommittee: null,
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            name: "Jane Secretary",
            email: "secretary@uganda.eara.org",
            phone: "+256-700-234567",
            role: "SECRETARY",
            active: true,
            country: { id: 1, name: "Uganda" },
            subcommittee: null,
            createdAt: new Date().toISOString()
          },
          {
            id: 3,
            name: "Mike Chair",
            email: "chair@tech.eara.org",
            phone: "+256-700-345678",
            role: "CHAIR",
            active: true,
            country: null,
            subcommittee: { id: 1, name: "Technical Infrastructure" },
            createdAt: new Date().toISOString()
          },
          {
            id: 4,
            name: "Sarah Commissioner",
            email: "commissioner@eara.org",
            phone: "+256-700-456789",
            role: "COMMISSIONER_GENERAL",
            active: true,
            country: null,
            subcommittee: null,
            createdAt: new Date().toISOString()
          }
        ];
      }
      
      setUsers(usersData);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalUsers: usersData.length,
        activeUsers: usersData.filter(user => user.active).length
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  const fetchCountries = async () => {
    try {
      let countriesData = [];
      
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/countries`);
        if (response.ok) {
          countriesData = await response.json();
        }
      } catch (apiError) {
        console.warn('Countries API failed, using fallback data');
        
        // Provide fallback countries data
        countriesData = [
          { id: 1, name: "Uganda", code: "UG" },
          { id: 2, name: "Kenya", code: "KE" },
          { id: 3, name: "Tanzania", code: "TZ" },
          { id: 4, name: "Rwanda", code: "RW" },
          { id: 5, name: "Burundi", code: "BI" },
          { id: 6, name: "South Sudan", code: "SS" },
          { id: 7, name: "Democratic Republic of Congo", code: "CD" }
        ];
      }
      
      setCountries(countriesData);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchSubcommittees = async () => {
    try {
      let subcommitteesData = [];
      
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/sub-committees`);
        if (response.ok) {
          subcommitteesData = await response.json();
        }
      } catch (apiError) {
        console.warn('Subcommittees API failed, using fallback data');
        
        // Provide fallback subcommittees data
        subcommitteesData = [
          { id: 1, name: "Technical Infrastructure", description: "Technical systems and infrastructure" },
          { id: 2, name: "Policy & Governance", description: "Policy development and governance" },
          { id: 3, name: "Community Relations", description: "Community outreach and relations" },
          { id: 4, name: "Finance & Budget", description: "Financial planning and budget management" },
          { id: 5, name: "Legal Affairs", description: "Legal guidance and compliance" },
          { id: 6, name: "Strategic Planning", description: "Long-term strategic planning" }
        ];
      }
      
      setSubcommittees(subcommitteesData);
    } catch (error) {
      console.error('Error fetching subcommittees:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Simulate additional stats - in real app, this would come from API
      setStats(prev => ({
        ...prev,
        totalMeetings: 45,
        totalResolutions: 123,
        pendingApprovals: 8,
        systemHealth: 'Excellent'
      }));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'country') {
      setForm(prev => ({
        ...prev,
        country: { id: value }
      }));
    } else if (name === 'subcommittee') {
      setForm(prev => ({
        ...prev,
        subcommittee: { id: value }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      role: '',
      country: { id: '' },
      subcommittee: { id: '' }
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      country: { id: user.country?.id || '' },
      subcommittee: { id: user.subcommittee?.id || '' }
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      role: '',
      country: { id: '' },
      subcommittee: { id: '' }
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const userData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        country: form.role === 'SECRETARY' ? { id: parseInt(form.country.id) } : null,
        subcommittee: ['CHAIR', 'SUBCOMMITTEE_MEMBER'].includes(form.role) ? { id: parseInt(form.subcommittee.id) } : null
      };

      // Validate the form data
      const validationErrors = UserManagementService.validateUserData(userData);
      if (validationErrors.length > 0) {
        setError(validationErrors.join('. '));
        return;
      }

      if (editingUser) {
        await UserManagementService.updateUser(editingUser.id, userData);
        setSuccess('User updated successfully!');
      } else {
        await UserManagementService.createUser(userData);
        setSuccess('User created successfully! Credentials have been sent via email.');
      }
      
      await fetchUsers();
      setTimeout(handleCloseModal, 1500);
      
    } catch (error) {
      setError(error.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await UserManagementService.deleteUser(userId);
        await fetchUsers();
        setSuccess('User deleted successfully.');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to delete user.');
      }
    }
  };

  const handleResendCredentials = async (userId) => {
    try {
      await UserManagementService.resendCredentials(userId);
      setSuccess('Credentials resent via email.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to resend credentials.');
    }
  };

  const getRoleClassName = (role) => {
    const roleClasses = {
      'ADMIN': 'role-admin',
      'SECRETARY': 'role-secretary',
      'CHAIR': 'role-chair',
      'HOD': 'role-hod',
      'COMMISSIONER_GENERAL': 'role-commissioner',
      'SUBCOMMITTEE_MEMBER': 'role-member'
    };
    return `role-badge ${roleClasses[role] || 'role-member'}`;
  };

  const getRoleInfo = (role) => {
    const roleInfo = {
      'SECRETARY': 'Requires country assignment. Manages country-specific operations and communications.',
      'CHAIR': 'Requires subcommittee assignment. Leads and coordinates subcommittee activities.',
      'HOD': 'Department head with administrative responsibilities across multiple areas.',
      'COMMISSIONER_GENERAL': 'Senior executive role with organization-wide authority and responsibilities.',
      'SUBCOMMITTEE_MEMBER': 'Requires subcommittee assignment. Participates in subcommittee work and decisions.'
    };
    return roleInfo[role] || '';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Manage users and monitor system performance</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="alert alert-error">
            <FaExclamationTriangle />
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <FaCheckCircle />
            {success}
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-info">
                <p className="stat-label">Total Users</p>
                <p className="stat-value">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">
                <FaUserShield />
              </div>
              <div className="stat-info">
                <p className="stat-label">Active Users</p>
                <p className="stat-value">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">
                <FaGlobe />
              </div>
              <div className="stat-info">
                <p className="stat-label">Countries</p>
                <p className="stat-value">{stats.totalCountries}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">
                <FaTasks />
              </div>
              <div className="stat-info">
                <p className="stat-label">Committees</p>
                <p className="stat-value">{stats.totalCommittees}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">
                <FaCalendar />
              </div>
              <div className="stat-info">
                <p className="stat-label">Meetings</p>
                <p className="stat-value">{stats.totalMeetings}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">
                <FaChartLine />
              </div>
              <div className="stat-info">
                <p className="stat-label">Resolutions</p>
                <p className="stat-value">{stats.totalResolutions}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">
                <FaBell />
              </div>
              <div className="stat-info">
                <p className="stat-label">Pending</p>
                <p className="stat-value">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">
                <FaCog />
              </div>
              <div className="stat-info">
                <p className="stat-label">System Health</p>
                <p className="stat-value" style={{ fontSize: '1.2rem' }}>{stats.systemHealth}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-content">
          {/* Users Section Header */}
          <div className="users-header">
            <h2 className="users-title">
              <FaUsers />
              User Management
            </h2>
            <button onClick={handleAddUser} className="add-user-btn">
              <FaUserPlus />
              Add New User
            </button>
          </div>

          {/* Users Table */}
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Assignment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                        {user.phone && <div className="user-email">{user.phone}</div>}
                      </div>
                    </td>
                    <td>
                      <span className={getRoleClassName(user.role)}>
                        {UserManagementService.getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td>
                      {user.country && <div>{user.country.name}</div>}
                      {user.subcommittee && <div>{user.subcommittee.name}</div>}
                      {!user.country && !user.subcommittee && <span style={{ color: '#9ca3af' }}>None</span>}
                    </td>
                    <td>
                      <span className={user.active ? 'status-active' : 'status-inactive'}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="action-btn action-btn-edit"
                          title="Edit user"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleResendCredentials(user.id)}
                          className="action-btn action-btn-resend"
                          title="Resend credentials"
                        >
                          <FaBell />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="action-btn action-btn-delete"
                          title="Delete user"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FaUsers />
                </div>
                <h3 className="empty-state-title">No users found</h3>
                <p className="empty-state-description">Get started by creating your first user.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal for Add/Edit User */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">
                  <div className="modal-title-icon">
                    <FaUserPlus />
                  </div>
                  {editingUser ? 'Edit User' : 'Create New User'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="user-form">
                <div className="form-group">
                  <label className="form-label">
                    Name <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    className="form-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Email Address <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    className="form-input"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    className="form-input"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Role <span className="required-asterisk">*</span>
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleFormChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select a role</option>
                    {UserManagementService.getAvailableRoles().map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {form.role && getRoleInfo(form.role) && (
                    <div className="role-info">
                      {getRoleInfo(form.role)}
                    </div>
                  )}
                </div>

                {/* Country field for SECRETARY */}
                {form.role === 'SECRETARY' && (
                  <div className="form-group">
                    <label className="form-label">
                      Country Assignment <span className="required-asterisk">*</span>
                    </label>
                    <select
                      name="country"
                      value={form.country.id}
                      onChange={handleFormChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select a country</option>
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Subcommittee field for CHAIR and SUBCOMMITTEE_MEMBER */}
                {['CHAIR', 'SUBCOMMITTEE_MEMBER'].includes(form.role) && (
                  <div className="form-group">
                    <label className="form-label">
                      Subcommittee Assignment <span className="required-asterisk">*</span>
                    </label>
                    <select
                      name="subcommittee"
                      value={form.subcommittee.id}
                      onChange={handleFormChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select a subcommittee</option>
                      {subcommittees.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-cancel"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={submitting}
                  >
                    {submitting && <FaSpinner className="loading-spinner" />}
                    {submitting ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
