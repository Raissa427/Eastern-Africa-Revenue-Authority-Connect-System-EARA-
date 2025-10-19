import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaCheck, FaTimes, FaComment, FaUser, FaCalendar, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import AuthService from '../services/authService';
import HODPermissionService from '../../services/hodPermissionService';

const ReportReviewForm = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewAction, setReviewAction] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentUser = AuthService.getCurrentUser();
  const isHOD = HODPermissionService.hasHODPrivileges(currentUser);
  const isCommissioner = currentUser?.role === 'COMMISSIONER_GENERAL';

  useEffect(() => {
    fetchReportsForReview();
  }, []);

  const fetchReportsForReview = async () => {
    try {
      let endpoint = '';
      
      if (isHOD) {
        // HOD sees reports submitted by chairs
        endpoint = `${process.env.REACT_APP_BASE_URL}/reports/status/SUBMITTED`;
      } else if (isCommissioner) {
        // Commissioner sees reports approved by HOD
                  endpoint = `${process.env.REACT_APP_BASE_URL}/reports/status/APPROVED_BY_HOD`;
      } else {
        setError('You do not have permission to review reports');
        setLoading(false);
        return;
      }

      const response = await fetch(endpoint);
      if (response.ok) {
        const reportsData = await response.json();
        setReports(reportsData);
      } else {
        throw new Error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports for review');
    } finally {
      setLoading(false);
    }
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
    setReviewAction('');
    setComments('');
    setError('');
    setSuccess('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!selectedReport) {
      setError('Please select a report to review');
      return;
    }

    if (!reviewAction) {
      setError('Please select approve or reject');
      return;
    }

    if (reviewAction === 'reject' && !comments.trim()) {
      setError('Comments are required when rejecting a report');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const isApproved = reviewAction === 'approve';
      const endpoint = isHOD 
                            ? `${process.env.REACT_APP_BASE_URL}/reports/${selectedReport.id}/hod-review`
        : `${process.env.REACT_APP_BASE_URL}/reports/${selectedReport.id}/commissioner-review`;

      const reviewData = isHOD ? {
        hodId: currentUser.id,
        approved: isApproved,
        comments: comments.trim() || (isApproved ? 'Approved' : 'Rejected')
      } : {
        commissionerId: currentUser.id,
        approved: isApproved,
        comments: comments.trim() || (isApproved ? 'Approved' : 'Rejected')
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        const action = isApproved ? 'approved' : 'rejected';
        const nextStep = isHOD && isApproved 
          ? ' The report has been forwarded to the Commissioner General.'
          : isCommissioner && isApproved
          ? ' The report has been marked as final approved.'
          : ' The report has been sent back to the Chair with your feedback.';

        setSuccess(`Report ${action} successfully!${nextStep}`);
        
        // Reset form
        setSelectedReport(null);
        setReviewAction('');
        setComments('');

        // Refresh reports list
        await fetchReportsForReview();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Very Good';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Satisfactory';
    if (percentage >= 50) return 'Fair';
    if (percentage >= 30) return 'Poor';
    return 'Very Poor';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading reports for review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FaFileAlt className="text-blue-600" />
            Report Review - {isHOD ? 'HOD Review' : 'Commissioner Review'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isHOD 
              ? 'Review progress reports submitted by committee chairs'
              : 'Final review of reports approved by HODs'
            }
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <FaCheck />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reports List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Reports Pending Review ({reports.length})
              </h2>
              <p className="text-sm text-gray-600">
                Select a report to review and provide feedback
              </p>
            </div>
            
            <div className="p-6">
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Reports Pending</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {isHOD 
                      ? 'No reports submitted by chairs require your review.'
                      : 'No reports approved by HODs require your review.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reports.map(report => (
                    <div
                      key={report.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedReport?.id === report.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleReportSelect(report)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          {report.resolution?.title || 'Resolution Report'}
                        </h4>
                        <span className={`text-lg font-bold ${getPerformanceColor(report.performancePercentage)}`}>
                          {report.performancePercentage}%
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-gray-400" />
                          <span>By: {report.submittedBy?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCalendar className="text-gray-400" />
                          <span>Submitted: {formatDate(report.submittedAt)}</span>
                        </div>
                        <div>
                          <span className="font-medium">Subcommittee:</span> {report.subcommittee?.name}
                        </div>
                      </div>

                      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${report.performancePercentage}%`,
                            backgroundColor: 
                              report.performancePercentage >= 80 ? '#16a34a' :
                              report.performancePercentage >= 60 ? '#eab308' :
                              report.performancePercentage >= 40 ? '#f59e0b' : '#ef4444'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Review Form */}
          {selectedReport && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Review Report</h2>
                <p className="text-sm text-gray-600">{selectedReport.resolution?.title}</p>
              </div>

              <div className="p-6">
                {/* Report Details */}
                <div className="mb-6 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Report Summary</h3>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Performance Rating:</span>
                        <span className={`font-bold ${getPerformanceColor(selectedReport.performancePercentage)}`}>
                          {selectedReport.performancePercentage}% ({getPerformanceLabel(selectedReport.performancePercentage)})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submitted by:</span>
                        <span className="font-medium">{selectedReport.submittedBy?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subcommittee:</span>
                        <span className="font-medium">{selectedReport.subcommittee?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submitted:</span>
                        <span className="font-medium">{formatDate(selectedReport.submittedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Progress Details</h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedReport.progressDetails || 'No progress details provided'}
                      </p>
                    </div>
                  </div>

                  {/* Hindrances */}
                  {selectedReport.hindrances && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Challenges & Hindrances</h4>
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedReport.hindrances}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Previous Reviews */}
                  {selectedReport.hodComments && isCommissioner && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">HOD Review</h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FaCheck className="text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            Approved by {selectedReport.reviewedByHod?.name}
                          </span>
                          <span className="text-xs text-green-600">
                            ({formatDate(selectedReport.hodReviewedAt)})
                          </span>
                        </div>
                        <p className="text-sm text-green-700">
                          {selectedReport.hodComments}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Review Form */}
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  {/* Review Decision */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Review Decision *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="reviewAction"
                          value="approve"
                          checked={reviewAction === 'approve'}
                          onChange={(e) => setReviewAction(e.target.value)}
                          className="mr-2"
                          disabled={submitting}
                        />
                        <FaCheck className="text-green-600 mr-2" />
                        <span className="text-green-800 font-medium">
                          Approve {isHOD ? '(Forward to Commissioner)' : '(Final Approval)'}
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="reviewAction"
                          value="reject"
                          checked={reviewAction === 'reject'}
                          onChange={(e) => setReviewAction(e.target.value)}
                          className="mr-2"
                          disabled={submitting}
                        />
                        <FaTimes className="text-red-600 mr-2" />
                        <span className="text-red-800 font-medium">
                          Reject (Send back to Chair)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                      Review Comments {reviewAction === 'reject' && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      id="comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={
                        reviewAction === 'approve' 
                          ? "Optional: Provide positive feedback or recommendations..."
                          : reviewAction === 'reject'
                          ? "Required: Explain why the report is being rejected and what needs to be improved..."
                          : "Provide your review comments..."
                      }
                      disabled={submitting}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {reviewAction === 'reject' 
                        ? 'Detailed feedback is required when rejecting a report'
                        : 'Your comments will be sent to the chair as feedback'
                      }
                    </p>
                  </div>

                  {/* Performance Assessment (for reference) */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Performance Assessment</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div>
                        <strong>Current Rating:</strong> 
                        <span className={`ml-1 font-bold ${getPerformanceColor(selectedReport.performancePercentage)}`}>
                          {selectedReport.performancePercentage}% ({getPerformanceLabel(selectedReport.performancePercentage)})
                        </span>
                      </div>
                      <div>
                        <strong>Resolution:</strong> {selectedReport.resolution?.title}
                      </div>
                      <div>
                        <strong>Contribution:</strong> This subcommittee's assigned portion of the resolution
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md disabled:opacity-50 flex items-center gap-2 ${
                        reviewAction === 'approve' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      disabled={submitting || !reviewAction}
                    >
                      {submitting ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {reviewAction === 'approve' ? <FaCheck /> : <FaTimes />}
                          {reviewAction === 'approve' ? 'Approve Report' : 'Reject Report'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isHOD ? 'HOD Review Guidelines' : 'Commissioner Review Guidelines'}
          </h3>
          <div className="prose text-sm text-gray-600">
            <ul className="space-y-2">
              {isHOD ? (
                <>
                  <li>• <strong>Review Progress:</strong> Assess if the progress details are realistic and measurable</li>
                  <li>• <strong>Performance Rating:</strong> Verify if the percentage aligns with the actual progress described</li>
                  <li>• <strong>Approve:</strong> Forward well-documented reports with reasonable progress to Commissioner</li>
                  <li>• <strong>Reject:</strong> Send back reports needing more detail, clarification, or realistic assessment</li>
                  <li>• <strong>Feedback:</strong> Always provide constructive comments to help chairs improve</li>
                </>
              ) : (
                <>
                  <li>• <strong>Final Review:</strong> This is the final approval stage for the report</li>
                  <li>• <strong>Strategic Assessment:</strong> Consider the overall impact and strategic alignment</li>
                  <li>• <strong>Approve:</strong> Mark reports as finally approved for organizational records</li>
                  <li>• <strong>Reject:</strong> Send back to Chair with detailed feedback for improvement</li>
                  <li>• <strong>System Impact:</strong> Your decision affects final resolution tracking and metrics</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportReviewForm;