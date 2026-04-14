import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  FiClock, FiCheckCircle, FiXCircle, FiFileText, FiSearch, 
  FiShield, FiEdit, FiUpload, FiDownload, FiEye, FiLock 
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './OfficerDashboard.css';

const OfficerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [pendingFIRs, setPendingFIRs] = useState([]);
  const [activeCases, setActiveCases] = useState([]);
  const [selectedFIR, setSelectedFIR] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [reviewData, setReviewData] = useState({ status: '', comments: '', caseNumber: '', rejectionReason: '' });
  const [caseData, setCaseData] = useState({ notes: '', findings: '', resolutionDetails: '' });
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    active: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, activeRes] = await Promise.all([
        axios.get('/api/fir/all/pending'),
        axios.get('/api/fir/all/active')
      ]);
      setPendingFIRs(pendingRes.data);
      setActiveCases(activeRes.data || []);
      setStats({
        pending: pendingRes.data.length,
        approved: 0,
        rejected: 0,
        active: activeRes.data?.length || 0,
        total: pendingRes.data.length + (activeRes.data?.length || 0)
      });
    } catch (error) {
      console.error('Error fetching FIRs:', error);
      toast.error('Failed to load FIRs');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (fir) => {
    setSelectedFIR(fir);
    setReviewData({ status: '', comments: '', caseNumber: '', rejectionReason: '' });
    setShowReviewModal(true);
  };

  const handleStatusUpdate = async () => {
    try {
      await axios.put(`/api/fir/${selectedFIR._id}/status`, {
        status: reviewData.status,
        reviewComments: reviewData.comments,
        caseNumber: reviewData.caseNumber || undefined,
        rejectionReason: reviewData.rejectionReason || undefined
      });
      toast.success(`FIR ${reviewData.status} successfully`);
      setShowReviewModal(false);
      setSelectedFIR(null);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update FIR status');
    }
  };

  const handleCaseUpdate = async () => {
    try {
      await axios.put(`/api/fir/${selectedFIR._id}/status`, {
        status: 'resolved',
        resolutionDetails: caseData.resolutionDetails,
        reviewComments: caseData.notes
      });
      toast.success('Case updated successfully');
      setShowCaseModal(false);
      setSelectedFIR(null);
      fetchData();
    } catch (error) {
      console.error('Error updating case:', error);
      toast.error('Failed to update case');
    }
  };

  const generateReport = async (fir) => {
    try {
      const response = await axios.get(`/api/fir/${fir._id}/report`);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FIR-Report-${fir.caseNumber || fir._id.slice(-6)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="officer-dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Officer Dashboard</h2>
          <p>Review and manage FIR submissions</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon pending">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <FiFileText />
          </div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Active Cases</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rejected">
            <FiXCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      <div className="tabs-section">
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending FIRs ({stats.pending})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Cases ({stats.active})
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="pending-firs-section">
          <h3>Pending FIRs for Review</h3>
          {pendingFIRs.length === 0 ? (
            <div className="empty-state">
              <FiFileText />
              <p>No pending FIRs</p>
            </div>
          ) : (
            <div className="fir-list">
              {pendingFIRs.map((fir) => (
                <div key={fir._id} className="fir-review-card">
                  <div className="fir-review-header">
                    <div>
                      <h4>{fir.caseNumber || `FIR-${fir._id.slice(-6)}`}</h4>
                      <p className="fir-complainant">{fir.complainantName}</p>
                      <p className="fir-meta-small">
                        {format(new Date(fir.incidentDate), 'MMM dd, yyyy')} • {fir.incidentLocation}
                      </p>
                    </div>
                    <div className="fir-actions">
                      <button
                        className="btn-view"
                        onClick={() => handleReview(fir)}
                      >
                        <FiEye /> Review
                      </button>
                      <Link to={`/fir/${fir._id}`} className="btn-view">
                        <FiSearch /> Details
                      </Link>
                    </div>
                  </div>
                  <div className="fir-review-body">
                    <p>{fir.incidentDescription.substring(0, 150)}...</p>
                    {fir.blockchainHash && (
                      <div className="blockchain-badge">
                        <FiLock />
                        <span>Blockchain Verified</span>
                        <small>{fir.blockchainHash.substring(0, 16)}...</small>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'active' && (
        <div className="active-cases-section">
          <h3>Active Cases</h3>
          {activeCases.length === 0 ? (
            <div className="empty-state">
              <FiFileText />
              <p>No active cases</p>
            </div>
          ) : (
            <div className="fir-list">
              {activeCases.map((fir) => (
                <div key={fir._id} className="fir-review-card">
                  <div className="fir-review-header">
                    <div>
                      <h4>{fir.caseNumber || `Case-${fir._id.slice(-6)}`}</h4>
                      <p className="fir-complainant">{fir.complainantName}</p>
                    </div>
                    <div className="fir-actions">
                      <button
                        className="btn-edit"
                        onClick={() => {
                          setSelectedFIR(fir);
                          setCaseData({ notes: fir.reviewComments || '', findings: '', resolutionDetails: '' });
                          setShowCaseModal(true);
                        }}
                      >
                        <FiEdit /> Update
                      </button>
                      <button
                        className="btn-download"
                        onClick={() => generateReport(fir)}
                      >
                        <FiDownload /> Report
                      </button>
                    </div>
                  </div>
                  <div className="fir-review-body">
                    <p>{fir.incidentDescription.substring(0, 150)}...</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedFIR && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Review FIR</h3>
            <div className="modal-body">
              <div className="fir-details-preview">
                <p><strong>Complainant:</strong> {selectedFIR.complainantName}</p>
                <p><strong>Location:</strong> {selectedFIR.incidentLocation}</p>
                <p><strong>Date:</strong> {format(new Date(selectedFIR.incidentDate), 'MMM dd, yyyy')}</p>
                <p><strong>Description:</strong> {selectedFIR.incidentDescription}</p>
                {selectedFIR.blockchainHash && (
                  <div className="blockchain-info">
                    <FiLock />
                    <div>
                      <strong>Blockchain Hash:</strong>
                      <code>{selectedFIR.blockchainHash}</code>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Action</label>
                <select
                  value={reviewData.status}
                  onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                >
                  <option value="">Select action</option>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>

              {reviewData.status === 'approved' && (
                <>
                  <div className="form-group">
                    <label>Case Number</label>
                    <input
                      type="text"
                      value={reviewData.caseNumber}
                      onChange={(e) => setReviewData({ ...reviewData, caseNumber: e.target.value })}
                      placeholder="Enter case number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Review Comments</label>
                    <textarea
                      value={reviewData.comments}
                      onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                      placeholder="Add review comments"
                      rows="3"
                    />
                  </div>
                </>
              )}

              {reviewData.status === 'rejected' && (
                <div className="form-group">
                  <label>Rejection Reason *</label>
                  <textarea
                    value={reviewData.rejectionReason}
                    onChange={(e) => setReviewData({ ...reviewData, rejectionReason: e.target.value })}
                    placeholder="Provide reason for rejection"
                    rows="3"
                    required
                  />
                </div>
              )}

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowReviewModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-submit" 
                  onClick={handleStatusUpdate}
                  disabled={!reviewData.status || (reviewData.status === 'rejected' && !reviewData.rejectionReason)}
                >
                  {reviewData.status === 'approved' ? 'Approve FIR' : 'Reject FIR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Update Modal */}
      {showCaseModal && selectedFIR && (
        <div className="modal-overlay" onClick={() => setShowCaseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Update Case: {selectedFIR.caseNumber}</h3>
            <div className="modal-body">
              <div className="form-group">
                <label>Investigation Notes</label>
                <textarea
                  value={caseData.notes}
                  onChange={(e) => setCaseData({ ...caseData, notes: e.target.value })}
                  placeholder="Add investigation notes"
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Findings</label>
                <textarea
                  value={caseData.findings}
                  onChange={(e) => setCaseData({ ...caseData, findings: e.target.value })}
                  placeholder="Add investigation findings"
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Resolution Details</label>
                <textarea
                  value={caseData.resolutionDetails}
                  onChange={(e) => setCaseData({ ...caseData, resolutionDetails: e.target.value })}
                  placeholder="Enter resolution details"
                  rows="4"
                />
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowCaseModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-submit" 
                  onClick={handleCaseUpdate}
                >
                  Update Case
                </button>
                <button 
                  className="btn-resolve" 
                  onClick={() => {
                    if (caseData.resolutionDetails) {
                      handleCaseUpdate();
                    } else {
                      toast.error('Please provide resolution details');
                    }
                  }}
                >
                  Close Case
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
