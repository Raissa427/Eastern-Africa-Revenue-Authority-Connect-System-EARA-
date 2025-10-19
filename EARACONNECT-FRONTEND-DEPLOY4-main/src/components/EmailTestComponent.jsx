import React, { useState } from 'react';
import { FaEnvelope, FaSpinner, FaCheck, FaTimes, FaCog } from 'react-icons/fa';

const EmailTestComponent = () => {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [configStatus, setConfigStatus] = useState(null);

  const testEmailConfiguration = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/email-test/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setConfigStatus(data);
      
      console.log('Email config test result:', data);
    } catch (error) {
      console.error('Error testing email configuration:', error);
      setConfigStatus({
        success: false,
        error: 'Failed to test email configuration: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      setResult({
        success: false,
        error: 'Please enter an email address'
      });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/email-test/send-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail.trim()
        }),
      });

      const data = await response.json();
      setResult(data);
      
      console.log('Test email result:', data);
    } catch (error) {
      console.error('Error sending test email:', error);
      setResult({
        success: false,
        error: 'Failed to send test email: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestInvitation = async () => {
    if (!testEmail.trim()) {
      setResult({
        success: false,
        error: 'Please enter an email address'
      });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/email-test/test-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail.trim()
        }),
      });

      const data = await response.json();
      setResult(data);
      
      console.log('Test invitation result:', data);
    } catch (error) {
      console.error('Error sending test invitation:', error);
      setResult({
        success: false,
        error: 'Failed to send test invitation: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <FaEnvelope className="text-blue-600 text-xl" />
        <h2 className="text-2xl font-bold text-gray-900">Email System Test</h2>
      </div>

      {/* Email Configuration Test */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <FaCog className="text-gray-600" />
          Email Configuration Test
        </h3>
        
        <button
          onClick={testEmailConfiguration}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaCog />}
          Test Email Configuration
        </button>

        {configStatus && (
          <div className={`mt-3 p-3 rounded-lg ${
            configStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {configStatus.success ? (
                <FaCheck className="text-green-600" />
              ) : (
                <FaTimes className="text-red-600" />
              )}
              <span className="font-medium">
                {configStatus.success ? 'Configuration Working' : 'Configuration Failed'}
              </span>
            </div>
            <p className="text-sm mt-1">
              {configStatus.message || configStatus.error}
            </p>
            {configStatus.timestamp && (
              <p className="text-xs text-gray-500 mt-1">
                Tested at: {new Date(configStatus.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Test Email Sending */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Test Email Sending</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Email Address
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email address to test"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={sendTestEmail}
            disabled={loading || !testEmail.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaEnvelope />}
            Send Test Email
          </button>

          <button
            onClick={sendTestInvitation}
            disabled={loading || !testEmail.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaEnvelope />}
            Send Test Invitation
          </button>
        </div>

        {result && (
          <div className={`mt-3 p-3 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <FaCheck className="text-green-600" />
              ) : (
                <FaTimes className="text-red-600" />
              )}
              <span className="font-medium">
                {result.success ? 'Email Sent Successfully' : 'Email Failed'}
              </span>
            </div>
            <p className="text-sm mt-1">
              {result.message || result.error}
            </p>
            {result.timestamp && (
              <p className="text-xs text-gray-500 mt-1">
                Sent at: {new Date(result.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-900">Instructions</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. First, test the email configuration to ensure the backend is properly configured</li>
          <li>2. Enter a valid email address to test email sending</li>
          <li>3. Try both the general test email and the meeting invitation test</li>
          <li>4. Check the browser console for detailed error messages</li>
          <li>5. If emails fail, check the backend logs for SMTP errors</li>
        </ol>
      </div>
    </div>
  );
};

export default EmailTestComponent;
