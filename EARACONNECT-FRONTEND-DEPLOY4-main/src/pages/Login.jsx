import React, { useState } from 'react';
import { API_BASE } from '../services/apiConfig';
import { useNavigate } from 'react-router-dom';
import HODPermissionService from '../services/hodPermissionService';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Login successful:', data);
        console.log('User role:', data.user.role);
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        
        console.log('localStorage set, redirecting...');
        console.log('localStorage isAuthenticated:', localStorage.getItem('isAuthenticated'));
        console.log('localStorage user:', localStorage.getItem('user'));
        
        // Redirect based on user role and HOD privileges
        const user = data.user;
        let redirectPath = '/dashboard'; // Default to general dashboard
        
        // Debug logging for user data
        console.log('🔍 Login Debug - User data:', user);
        console.log('🔍 Login Debug - User role:', user.role);
        console.log('🔍 Login Debug - User subcommittee:', user.subcommittee);
        if (user.subcommittee) {
          console.log('🔍 Login Debug - Subcommittee name:', user.subcommittee.name);
        }
        
        // Check if user has HOD privileges first (Chair of Head of Delegation)
        const hasHODPrivileges = HODPermissionService.hasHODPrivileges(user);
        console.log('🔍 Login Debug - Has HOD privileges:', hasHODPrivileges);
        
        if (hasHODPrivileges) {
          redirectPath = '/hod/dashboard';
          console.log('🎯 User has HOD privileges, redirecting to HOD dashboard');
        } else {
          // Use regular role-based routing for non-HOD users
          const userRole = user.role;
          switch (userRole) {
            case 'ADMIN':
              redirectPath = '/admin/dashboard';
              break;
            case 'SECRETARY':
              redirectPath = '/secretary/dashboard';
              break;
            case 'CHAIR':
              redirectPath = '/chair/dashboard';
              break;
            case 'VICE_CHAIR':
              redirectPath = '/chair/dashboard';
              break;
            case 'COMMISSIONER_GENERAL':
              redirectPath = '/commissioner/dashboard';
              break;
            case 'SUBCOMMITTEE_MEMBER':
            case 'COMMITTEE_MEMBER':
            case 'COMMITTEE_SECRETARY':
            case 'DELEGATION_SECRETARY':
              redirectPath = '/member/dashboard';
              break;
            default:
              redirectPath = '/dashboard';
          }
        }
        
        console.log('Redirecting to:', redirectPath);
        console.log('Current URL before redirect:', window.location.href);
        
        // Force page reload to ensure routing works properly
        window.location.href = redirectPath;
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>EARA CONNECT</h1>
          <p>Please sign in to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Copyright © 2025 EARACONNECT. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 