import React, { useState, useEffect } from 'react';
import { FaUsers, FaCalendar, FaGlobe, FaTasks, FaChartLine, FaBell, FaUserShield, FaCog, FaEdit, FaTrash, FaPlus, FaSpinner } from 'react-icons/fa';
import UserManagementService from '../services/userManagementService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCountries: 7, // Pre-seeded countries
    totalCommittees: 7, // Pre-seeded subcommittees
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
      const usersData = await UserManagementService.getAllUsers();
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
              const response = await fetch(`${process.env.REACT_APP_BASE_URL}/countries`);
      if (response.ok) {
        const countriesData = await response.json();
        setCountries(countriesData);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchSubcommittees = async () => {
    try {
              const response = await fetch(`${process.env.REACT_APP_BASE_URL}/sub-committees`);
      if (response.ok) {
        const subcommitteesData = await response.json();
        setSubcommittees(subcommitteesData);
      }
    } catch (error) {
      console.error('Error fetching subcommittees:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch additional stats from dashboard API
              const response = await fetch(`${process.env.REACT_APP_BASE_URL}/dashboard/admin/stats`);
      if (response.ok) {
        const adminStats = await response.json();
        setStats(prev => ({ ...prev, ...adminStats }));
      }
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

  const handleShowModal = (user = null) => {
    setEditingUser(user);
    setForm(user ? {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      country: user.country || { id: '' },
      subcommittee: user.subcommittee || { id: '' }
    } : {
      name: '',
      email: '',
      phone: '',
      role: '',
      country: { id: '' },
      subcommittee: { id: '' }
    });
    setShowModal(true);
    setError('');
    setSuccess('');
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
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = UserManagementService.validateUserData(form);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Prepare user data
      const userData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || '',
        role: form.role
      };

      // Add country for SECRETARY role
      if (form.role === 'SECRETARY' && form.country.id) {
        userData.country = { id: parseInt(form.country.id) };
      }

      // Add subcommittee for CHAIR and SUBCOMMITTEE_MEMBER roles
      if (['CHAIR', 'SUBCOMMITTEE_MEMBER'].includes(form.role) && form.subcommittee.id) {
        userData.subcommittee = { id: parseInt(form.subcommittee.id) };
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

  const getRoleRequirements = (role) => {
    if (role === 'SECRETARY') return 'country';
    if (['CHAIR', 'SUBCOMMITTEE_MEMBER'].includes(role)) return 'subcommittee';
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users and monitor system performance</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUsers className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-3xl font-bold text-gray-900">{stats.totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUserShield className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                  <dd className="text-3xl font-bold text-gray-900">{stats.activeUsers}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaGlobe className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Countries</dt>
                  <dd className="text-3xl font-bold text-gray-900">{stats.totalCountries}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaTasks className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Committees</dt>
                  <dd className="text-3xl font-bold text-gray-900">{stats.totalCommittees}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <button
                onClick={() => handleShowModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaPlus /> Add User
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {UserManagementService.getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.country?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleShowModal(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleResendCredentials(user.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FaBell />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
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
              <div className="text-center py-12">
                <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal for Add/Edit User */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role *</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Role</option>
                    {UserManagementService.getAvailableRoles().map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country field for SECRETARY */}
                {form.role === 'SECRETARY' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country *</label>
                    <select
                      name="country"
                      value={form.country.id}
                      onChange={handleFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Country</option>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subcommittee *</label>
                    <select
                      name="subcommittee"
                      value={form.subcommittee.id}
                      onChange={handleFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Subcommittee</option>
                      {subcommittees.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-2"
                    disabled={submitting}
                  >
                    {submitting && <FaSpinner className="animate-spin" />}
                    {submitting ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
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

export default AdminDashboard;