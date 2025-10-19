import React, { useState } from 'react';
import { FaEnvelope, FaUser, FaDatabase, FaCheck, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import UserManagementService from '../services/userManagementService';
import './AdminTestInterface.css';

const AdminTestInterface = () => {
  const [testResults, setTestResults] = useState({});
  const [running, setRunning] = useState({});
  const [emailTest, setEmailTest] = useState({ email: '', name: '' });

  const runTest = async (testName, testFunction) => {
    setRunning(prev => ({ ...prev, [testName]: true }));
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, message: result.message, data: result.data }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, message: error.message }
      }));
    } finally {
      setRunning(prev => ({ ...prev, [testName]: false }));
    }
  };

  const testEmailService = async () => {
    if (!emailTest.email || !emailTest.name) {
      throw new Error('Please provide both email and name for testing');
    }

          const response = await fetch('http://localhost:8081/api/auth/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailTest.email,
        name: emailTest.name,
        password: 'test123'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Email test failed');
    }

    return { message: `Test email sent successfully to ${emailTest.email}` };
  };

  const testUserCreation = async () => {
    const testUser = {
      name: 'Test User ' + Date.now(),
      email: `test${Date.now()}@example.com`,
      role: 'SUBCOMMITTEE_MEMBER',
      phone: '+1234567890'
    };

    const result = await UserManagementService.createUser(testUser);
    return { 
      message: `User created successfully with ID: ${result.id}`,
      data: result
    };
  };

  const testUserCreationWithCountry = async () => {
    const testUser = {
      name: 'Test Secretary ' + Date.now(),
      email: `secretary${Date.now()}@example.com`,
      role: 'SECRETARY',
      phone: '+1234567890',
      country: { id: 1 } // Assuming country with ID 1 exists
    };

    const result = await UserManagementService.createUser(testUser);
    return { 
      message: `Secretary created successfully with ID: ${result.id}`,
      data: result
    };
  };

  const testUserCreationWithSubcommittee = async () => {
    const testUser = {
      name: 'Test Chair ' + Date.now(),
      email: `chair${Date.now()}@example.com`,
      role: 'CHAIR',
      phone: '+1234567890',
      subcommittee: { id: 1 } // Assuming subcommittee with ID 1 exists
    };

    const result = await UserManagementService.createUser(testUser);
    return { 
      message: `Chair created successfully with ID: ${result.id}`,
      data: result
    };
  };

  const testDatabaseFixes = async () => {
          const response = await fetch('http://localhost:8081/api/admin/database-fixes/report');
    if (!response.ok) {
      throw new Error('Failed to get database report');
    }

    const result = await response.json();
    return {
      message: result.hasIssues ? 'Database issues found - check report' : 'Database integrity OK',
      data: result.report
    };
  };

  const testRoleValidation = async () => {
    try {
      // This should fail - Secretary without country
      await UserManagementService.createUser({
        name: 'Invalid Secretary',
        email: 'invalid@example.com',
        role: 'SECRETARY'
        // Missing country
      });
      throw new Error('Validation should have failed but did not');
    } catch (error) {
      if (error.message.includes('Country is required')) {
        return { message: 'Role validation working correctly' };
      }
      throw error;
    }
  };

  const tests = [
    {
      id: 'email',
      name: 'Email Service Test',
      description: 'Test if credentials can be sent via email',
      icon: FaEnvelope,
      testFunction: testEmailService,
      requiresInput: true
    },
    {
      id: 'userCreation',
      name: 'User Creation Test',
      description: 'Test basic user creation functionality',
      icon: FaUser,
      testFunction: testUserCreation
    },
    {
      id: 'userWithCountry',
      name: 'Secretary Creation Test',
      description: 'Test creating user with country requirement',
      icon: FaUser,
      testFunction: testUserCreationWithCountry
    },
    {
      id: 'userWithSubcommittee',
      name: 'Chair Creation Test',
      description: 'Test creating user with subcommittee requirement',
      icon: FaUser,
      testFunction: testUserCreationWithSubcommittee
    },
    {
      id: 'roleValidation',
      name: 'Role Validation Test',
      description: 'Test that role-specific requirements are enforced',
      icon: FaExclamationTriangle,
      testFunction: testRoleValidation
    },
    {
      id: 'databaseFixes',
      name: 'Database Integrity Check',
      description: 'Check database for NULL values and integrity issues',
      icon: FaDatabase,
      testFunction: testDatabaseFixes
    }
  ];

  return (
    <div className="admin-test-interface">
      <div className="test-header">
        <h1>Admin Testing Interface</h1>
        <p>Test core admin functionalities to ensure everything works correctly</p>
      </div>

      <div className="tests-grid">
        {tests.map(test => {
          const Icon = test.icon;
          const result = testResults[test.id];
          const isRunning = running[test.id];

          return (
            <div key={test.id} className="test-card">
              <div className="test-card-header">
                <div className="test-info">
                  <Icon className="test-icon" />
                  <div>
                    <h3>{test.name}</h3>
                    <p>{test.description}</p>
                  </div>
                </div>
                <div className="test-status">
                  {result && (
                    <div className={`status-badge ${result.success ? 'success' : 'error'}`}>
                      {result.success ? <FaCheck /> : <FaExclamationTriangle />}
                    </div>
                  )}
                </div>
              </div>

              {test.requiresInput && test.id === 'email' && (
                <div className="test-inputs">
                  <input
                    type="email"
                    placeholder="Test email address"
                    value={emailTest.email}
                    onChange={(e) => setEmailTest(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Test name"
                    value={emailTest.name}
                    onChange={(e) => setEmailTest(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              )}

              <div className="test-actions">
                <button
                  onClick={() => runTest(test.id, test.testFunction)}
                  disabled={isRunning}
                  className="test-button"
                >
                  {isRunning ? (
                    <>
                      <FaSpinner className="loading-spinner" />
                      Running...
                    </>
                  ) : (
                    'Run Test'
                  )}
                </button>
              </div>

              {result && (
                <div className={`test-result ${result.success ? 'success' : 'error'}`}>
                  <div className="result-message">{result.message}</div>
                  {result.data && (
                    <details className="result-data">
                      <summary>View Details</summary>
                      <pre>{typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}</pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="test-footer">
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button
              onClick={() => {
                tests.forEach(test => {
                  if (!test.requiresInput) {
                    runTest(test.id, test.testFunction);
                  }
                });
              }}
              className="action-button primary"
            >
              Run All Tests (except email)
            </button>
            <button
              onClick={() => {
                setTestResults({});
              }}
              className="action-button secondary"
            >
              Clear Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTestInterface;
