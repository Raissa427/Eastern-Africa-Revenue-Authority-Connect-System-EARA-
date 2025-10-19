import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import AuthService from '../services/authService';

const EnhancedLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      const user = AuthService.getCurrentUser();
      redirectToDashboard(user.role);
    }
  }, []);

  const redirectToDashboard = (userRole) => {
    const roleDashboards = {
      'ADMIN': '/admin/dashboard',
      'SECRETARY': '/secretary/dashboard',
      'CHAIR': '/chair/dashboard',
      'VICE_CHAIR': '/chair/dashboard',
      'HOD': '/hod/dashboard',
      'COMMISSIONER_GENERAL': '/commissioner/dashboard',
      'SUBCOMMITTEE_MEMBER': '/member/dashboard',
      'COMMITTEE_MEMBER': '/member/dashboard',
      'COMMITTEE_SECRETARY': '/member/dashboard',
      'DELEGATION_SECRETARY': '/member/dashboard'
    };

    const redirectPath = roleDashboards[userRole] || '/dashboard';
    navigate(redirectPath, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const result = await AuthService.login(email.trim(), password);
      
      console.log('Login successful:', result);
      console.log('User role:', result.user.role);
      
      // Redirect based on user role
      redirectToDashboard(result.user.role);
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
            <FaUser className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            EARA Connect
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            EARA CONNECT
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Please sign in to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white shadow-xl rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Default Credentials Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Default Credentials</h3>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="text-sm">
                <div className="font-medium text-blue-900">System Administrator</div>
                <div className="text-blue-700 mt-1">
                  <div><strong>Email:</strong> admin@earaconnect.com</div>
                  <div><strong>Password:</strong> admin123</div>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Use the admin credentials above to access the system</p>
              <p>• Admin can create other users (Secretary, Chair, HOD, etc.)</p>
              <p>• New users receive login credentials via email automatically</p>
              <p>• Each user role has different permissions and dashboard access</p>
            </div>
          </div>
        </div>

        {/* Role Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Roles</h3>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-blue-600">ADMIN</span>
              <span className="text-gray-600">System management & user creation</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-green-600">SECRETARY</span>
              <span className="text-gray-600">Meeting management & invitations</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-purple-600">CHAIR</span>
              <span className="text-gray-600">Report submission & task management</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-orange-600">HOD</span>
              <span className="text-gray-600">Report review & approval</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-red-600">COMMISSIONER_GENERAL</span>
              <span className="text-gray-600">Final review & oversight</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">MEMBER</span>
              <span className="text-gray-600">Notifications & basic access</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            East African Revenue Administration (EARA) Committee Management System
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Version 1.0 - Secure & Reliable
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLogin;