import React, { useState } from 'react';
import { FaEnvelope, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

const ButtonTestComponent = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testButtonClick = () => {
    console.log('🧪 Test button clicked!');
    setResult({
      success: true,
      message: 'Button click detected successfully!'
    });
  };

  const testAPI = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🌐 Testing API connection...');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/meetings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          success: true,
          message: `API connection successful! Found ${data.length} meetings.`
        });
      } else {
        setResult({
          success: false,
          error: `API returned ${response.status}: ${response.statusText}`
        });
      }
    } catch (error) {
      console.error('❌ API test failed:', error);
      setResult({
        success: false,
        error: 'Failed to connect to API: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testInvitationAPI = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('📧 Testing invitation API...');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/meetings/5/invitations/send?secretaryId=7`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([1, 2, 3]),
      });

      const responseText = await response.text();
      console.log('📥 Response:', response.status, responseText);

      if (response.ok) {
        setResult({
          success: true,
          message: 'Invitation API test successful!'
        });
      } else {
        setResult({
          success: false,
          error: `Invitation API returned ${response.status}: ${responseText}`
        });
      }
    } catch (error) {
      console.error('❌ Invitation API test failed:', error);
      setResult({
        success: false,
        error: 'Failed to test invitation API: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Button and API Test</h2>

      {/* Test Buttons */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Test Actions</h3>
        
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={testButtonClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaEnvelope />
            Test Button Click
          </button>

          <button
            onClick={testAPI}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaEnvelope />}
            Test API Connection
          </button>

          <button
            onClick={testInvitationAPI}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaEnvelope />}
            Test Invitation API
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
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-900">Instructions</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Click "Test Button Click" to verify button functionality works</li>
          <li>2. Click "Test API Connection" to verify backend connectivity</li>
          <li>3. Click "Test Invitation API" to test the specific invitation endpoint</li>
          <li>4. Check browser console for detailed logs</li>
          <li>5. Use this to isolate where the issue occurs</li>
        </ol>
      </div>
    </div>
  );
};

export default ButtonTestComponent;
