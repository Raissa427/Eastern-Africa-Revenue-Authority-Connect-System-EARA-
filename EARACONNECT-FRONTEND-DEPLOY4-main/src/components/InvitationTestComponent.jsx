import React, { useState } from 'react';
import { FaEnvelope, FaSpinner, FaCheck, FaTimes, FaFlask } from 'react-icons/fa';

const InvitationTestComponent = () => {
  const [testData, setTestData] = useState({
    meetingId: '',
    userIds: '',
    email: '',
    name: '',
    meetingTitle: 'Test Meeting',
    meetingDate: '2024-01-15 10:00:00',
    location: 'Test Location'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testInvitationSystem = async () => {
    if (!testData.meetingId || !testData.userIds) {
      setResult({
        success: false,
        error: 'Please enter meeting ID and user IDs'
      });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const userIds = testData.userIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/test/invitation-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId: parseInt(testData.meetingId),
          userIds: userIds
        }),
      });

      const data = await response.json();
      setResult(data);
      
      console.log('Test invitation result:', data);
    } catch (error) {
      console.error('Error testing invitation system:', error);
      setResult({
        success: false,
        error: 'Failed to test invitation system: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testEmailSending = async () => {
    if (!testData.email || !testData.name) {
      setResult({
        success: false,
        error: 'Please enter email and name'
      });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/test/email-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testData.email,
          name: testData.name,
          meetingTitle: testData.meetingTitle,
          meetingDate: testData.meetingDate,
          location: testData.location
        }),
      });

      const data = await response.json();
      setResult(data);
      
      console.log('Test email result:', data);
    } catch (error) {
      console.error('Error testing email sending:', error);
      setResult({
        success: false,
        error: 'Failed to test email sending: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <FaFlask className="text-purple-600 text-xl" />
        <h2 className="text-2xl font-bold text-gray-900">Invitation System Test</h2>
      </div>

      {/* Test Data Input */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Test Data</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting ID
            </label>
            <input
              type="number"
              value={testData.meetingId}
              onChange={(e) => handleInputChange('meetingId', e.target.value)}
              placeholder="Enter meeting ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User IDs (comma-separated)
            </label>
            <input
              type="text"
              value={testData.userIds}
              onChange={(e) => handleInputChange('userIds', e.target.value)}
              placeholder="1,2,3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Email
            </label>
            <input
              type="email"
              value={testData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="test@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Name
            </label>
            <input
              type="text"
              value={testData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Test User"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Test Actions</h3>
        
        <div className="flex gap-3">
          <button
            onClick={testInvitationSystem}
            disabled={loading || !testData.meetingId || !testData.userIds}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaEnvelope />}
            Test Invitation System
          </button>

          <button
            onClick={testEmailSending}
            disabled={loading || !testData.email || !testData.name}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaEnvelope />}
            Test Email Sending
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className={`p-4 rounded-lg ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {result.success ? (
              <FaCheck className="text-green-600" />
            ) : (
              <FaTimes className="text-red-600" />
            )}
            <span className="font-medium">
              {result.success ? 'Test Successful' : 'Test Failed'}
            </span>
          </div>
          <p className="text-sm mt-1">
            {result.message || result.error}
          </p>
          {result.timestamp && (
            <p className="text-xs text-gray-500 mt-1">
              Tested at: {new Date(result.timestamp).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-900">Instructions</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Enter a valid meeting ID and user IDs to test the invitation system</li>
          <li>2. Enter a valid email and name to test email sending</li>
          <li>3. Click the test buttons to verify functionality</li>
          <li>4. Check the browser console and backend logs for detailed information</li>
          <li>5. Use this to isolate issues with the invitation system</li>
        </ol>
      </div>
    </div>
  );
};

export default InvitationTestComponent;
