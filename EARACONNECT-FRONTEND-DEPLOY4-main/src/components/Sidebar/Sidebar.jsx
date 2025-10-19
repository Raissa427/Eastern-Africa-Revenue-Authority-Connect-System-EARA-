import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaCalendar, FaFileAlt, FaBell, FaArchive, FaChartBar, FaUser, FaGlobe, FaUsers, FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  
  // Debug theme changes
  useEffect(() => {
    console.log(`🎨 Sidebar: Current theme is ${theme} (isDark: ${isDark})`);
  }, [theme, isDark]);
  
  // Get user data from localStorage
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const userRole = user ? user.role : null;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    console.log('🚪 Logout initiated - clearing session data');
    
    try {
      // Clear all session data immediately
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
      
      console.log('✅ Session data cleared successfully');
      
      // Force immediate redirect to login page
      console.log('🔄 Redirecting to login page...');
      
      // Use both methods for maximum compatibility
      if (navigate) {
        navigate('/login', { replace: true });
        // Fallback to window.location if navigate doesn't work immediately
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            console.log('⚠️ Navigate failed, using window.location fallback');
            window.location.href = '/login';
          }
        }, 100);
      } else {
        console.log('⚠️ Navigate not available, using window.location directly');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Fallback to direct redirect
      window.location.href = '/login';
    }
  };

  // Render menu items based on user role
  const renderMenuItems = () => {
    switch (userRole) {
      case 'SUBCOMMITTEE_MEMBER':
      case 'COMMITTEE_MEMBER':
        return (
          <>
            <li>
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                <FaUser /> My Profile
              </Link>
            </li>
            <li>
              <Link to="/simple-performance-dashboard" onClick={() => setIsOpen(false)}>
                <FaChartBar /> Simple Performance Dashboard
              </Link>
            </li>
            <li>
              <Link to="/notifications" onClick={() => setIsOpen(false)}>
                <FaBell /> Notifications
              </Link>
            </li>
            <li>
              <Link to="/meetings/archive" onClick={() => setIsOpen(false)}>
                <FaArchive /> Archive Meetings
              </Link>
            </li>
            <li>
              <Link to="/countries" onClick={() => setIsOpen(false)}>
                <FaGlobe /> Countries
              </Link>
            </li>
            <li>
              <Link to="/committees" onClick={() => setIsOpen(false)}>
                <FaUsers /> Committees
              </Link>
            </li>
          </>
        );

      case 'SECRETARY':
      case 'COMMITTEE_SECRETARY':
      case 'DELEGATION_SECRETARY':
        return (
          <>
            <li>
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                <FaUser /> My Profile
              </Link>
            </li>
            <li>
              <Link to="/simple-performance-dashboard" onClick={() => setIsOpen(false)}>
                <FaChartBar /> Simple Performance Dashboard
              </Link>
            </li>
            <li>
              <Link to="/meetings/archive" onClick={() => setIsOpen(false)}>
                <FaArchive /> Archive Meetings
              </Link>
            </li>
            <li>
              <Link to="/committees" onClick={() => setIsOpen(false)}>
                <FaUsers /> Committees
              </Link>
            </li>
            <li>
              <Link to="/countries" onClick={() => setIsOpen(false)}>
                <FaGlobe /> Countries
              </Link>
            </li>
            <li>
              <Link to="/meetings/create" onClick={() => setIsOpen(false)}>
                <FaCalendar /> Create Meeting
              </Link>
            </li>
            <li>
              <Link to="/minutes/take" onClick={() => setIsOpen(false)}>
                <FaFileAlt /> Take Minutes
              </Link>
            </li>
          </>
        );

      case 'CHAIR':
      case 'VICE_CHAIR':
        return (
          <>
            <li>
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                <FaUser /> My Profile
              </Link>
            </li>
            <li>
              <Link to="/simple-performance-dashboard" onClick={() => setIsOpen(false)}>
                <FaChartBar /> Simple Performance Dashboard
              </Link>
            </li>
            <li>
              <Link to="/meetings/archive" onClick={() => setIsOpen(false)}>
                <FaArchive /> Archive Meetings
              </Link>
            </li>
            <li>
              <Link to="/countries" onClick={() => setIsOpen(false)}>
                <FaGlobe /> Countries
              </Link>
            </li>
            <li>
              <Link to="/committees" onClick={() => setIsOpen(false)}>
                <FaUsers /> Committees
              </Link>
            </li>
          </>
        );

      case 'HOD':
      case 'CHAIR_OF_HOD':
        return (
          <>
            <li>
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                <FaUser /> My Profile
              </Link>
            </li>
            <li>
              <Link to="/simple-performance-dashboard" onClick={() => setIsOpen(false)}>
                <FaChartBar /> Simple Performance Dashboard
              </Link>
            </li>
            <li>
              <Link to="/meetings/archive" onClick={() => setIsOpen(false)}>
                <FaArchive /> Archive Meetings
              </Link>
            </li>
            <li>
              <Link to="/countries" onClick={() => setIsOpen(false)}>
                <FaGlobe /> Countries
              </Link>
            </li>
            <li>
              <Link to="/committees" onClick={() => setIsOpen(false)}>
                <FaUsers /> Committees
              </Link>
            </li>
          </>
        );

      case 'COMMISSIONER_GENERAL':
        return (
          <>
            <li>
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                <FaUser /> My Profile
              </Link>
            </li>
            <li>
              <Link to="/simple-performance-dashboard" onClick={() => setIsOpen(false)}>
                <FaChartBar /> Simple Performance Dashboard
              </Link>
            </li>
            <li>
              <Link to="/meetings/archive" onClick={() => setIsOpen(false)}>
                <FaArchive /> Archive Meetings
              </Link>
            </li>
            <li>
              <Link to="/countries" onClick={() => setIsOpen(false)}>
                <FaGlobe /> Countries
              </Link>
            </li>
            <li>
              <Link to="/committees" onClick={() => setIsOpen(false)}>
                <FaUsers /> Committees
              </Link>
            </li>
          </>
        );

      case 'ADMIN':
        return (
          <>
            <li>
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                <FaUser /> My Profile
              </Link>
            </li>
            <li>
              <Link to="/simple-performance-dashboard" onClick={() => setIsOpen(false)}>
                <FaChartBar /> Simple Performance Dashboard
              </Link>
            </li>
            <li>
              <Link to="/committees" onClick={() => setIsOpen(false)}>
                <FaUsers /> Committees
              </Link>
            </li>
            <li>
              <Link to="/countries" onClick={() => setIsOpen(false)}>
                <FaGlobe /> Countries
              </Link>
            </li>
            <li>
              <Link to="/members" onClick={() => setIsOpen(false)}>Committee Members</Link>
            </li>
            <li>
              <Link to="/sub-committee-members" onClick={() => setIsOpen(false)}>
                Sub-Committee Members
              </Link>
            </li>
          </>
        );

      default:
        return (
          <>
            <li>
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                <FaUser /> My Profile
              </Link>
            </li>
            <li>
              <Link to="/simple-performance-dashboard" onClick={() => setIsOpen(false)}>
                <FaChartBar /> Simple Performance Dashboard
              </Link>
            </li>
          </>
        );
    }
  };

  return (
    <>
      <button className="menu-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>EARA Connect</h3>
        </div>
        <ul className="sidebar-menu">
          <li>
            <Link to="/" onClick={() => setIsOpen(false)}>Dashboard</Link>
          </li>
          {renderMenuItems()}
         
          <li className="logout-item">
            <button onClick={handleLogout} className="logout-button">
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;