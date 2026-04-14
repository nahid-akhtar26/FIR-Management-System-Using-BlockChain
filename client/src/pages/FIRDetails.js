import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import {
  FiArrowLeft,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiHome,
  FiShield,
  FiCopy
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './FIRDetails.css';

const FIRDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState(null);

  useEffect(() => {
    fetchFIRDetails();
  }, [id]);

  const fetchFIRDetails = async () => {
    try {
      const response = await axios.get(`/api/fir/${id}`);
      setFir(response.data);
      const verifyResponse = await axios.get(`/api/fir/${id}/verify`);
      setVerification(verifyResponse.data);
    } catch (error) {
      console.error('FIR details fetch error:', error);
      toast.error('Failed to load FIR details');
      navigate('/track-fir');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'var(--warning)';
      case 'under_review':
        return 'var(--accent)';
      case 'approved':
        return 'var(--success)';
      case 'rejected':
        return 'var(--danger)';
      case 'resolved':
        return 'var(--success)';
      default:
        return 'var(--text-secondary)';
    }
  };

  if (loading) {
    return (
      <div className="details-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!fir) {
    return null;
  }

  return (
    <div className="fir-details">
      <button className="back-btn" onClick={() => navigate('/track-fir')}>
        <FiArrowLeft />
        Back to Tracking
      </button>

      <div className="details-header">
        <div>
          <h2>{fir.caseNumber || `FIR-${fir._id.slice(-6)}`}</h2>
          <div
            className="status-badge"
            style={{ backgroundColor: getStatusColor(fir.status) + '20', color: getStatusColor(fir.status) }}
          >
            {t(fir.status)}
          </div>
        </div>
        {fir.blockchainHash && (
          <div className="blockchain-badge">
            <FiShield />
            <span>Blockchain Verified</span>
          </div>
        )}
      </div>

      <div className="details-grid">
        <div className="details-section">
          <h3>
            <FiUser />
            Complainant Information
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name</label>
              <p>{fir.complainantName}</p>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <p>{fir.complainantPhone}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{fir.complainantEmail}</p>
            </div>
            <div className="info-item">
              <label>Address</label>
              <p>{fir.complainantAddress}</p>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h3>
            <FiCalendar />
            Incident Details
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Incident Date</label>
              <p>{format(new Date(fir.incidentDate), 'MMMM dd, yyyy hh:mm a')}</p>
            </div>
            <div className="info-item">
              <label>Incident Location</label>
              <p>{fir.incidentLocation}</p>
            </div>
            <div className="info-item full-width">
              <label>Description</label>
              <p className="description-text">{fir.incidentDescription}</p>
            </div>
          </div>
        </div>

        {fir.blockchainHash && (
          <div className="details-section">
            <h3>
              <FiShield />
              Blockchain Information
            </h3>
            <div className="blockchain-info">
              <div className="blockchain-item">
                <label>Blockchain Hash</label>
                <div className="hash-display">
                  <code>{fir.blockchainHash}</code>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(fir.blockchainHash)}
                    title="Copy hash"
                  >
                    <FiCopy />
                  </button>
                </div>
              </div>
              <div className="blockchain-item">
                <label>Block Index</label>
                <div className="hash-display">
                  <code>{fir.blockchainBlockIndex}</code>
                </div>
              </div>
              <div className="blockchain-item">
                <label>Previous Hash</label>
                <div className="hash-display">
                  <code>{fir.blockchainPreviousHash || 'N/A'}</code>
                </div>
              </div>
              {verification && (
                <div className="blockchain-item">
                  <label>Integrity Check</label>
                  <p>{verification.isValid ? 'Valid and tamper-proof' : 'Verification failed'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {fir.witnesses && fir.witnesses.length > 0 && fir.witnesses[0].name && (
          <div className="details-section">
            <h3>Witnesses</h3>
            <div className="witnesses-list">
              {fir.witnesses.map((witness, index) => (
                <div key={index} className="witness-card">
                  <h4>Witness {index + 1}</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Name</label>
                      <p>{witness.name}</p>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <p>{witness.phone}</p>
                    </div>
                    <div className="info-item full-width">
                      <label>Address</label>
                      <p>{witness.address}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {fir.reviewComments && (
          <div className="details-section">
            <h3>Review Comments</h3>
            <div className="review-box">
              <p>{fir.reviewComments}</p>
              {fir.reviewedBy && (
                <div className="reviewer-info">
                  Reviewed by: {fir.reviewedBy.name || 'Officer'}
                </div>
              )}
            </div>
          </div>
        )}

        {fir.rejectionReason && (
          <div className="details-section rejection-section">
            <h3>Rejection Reason</h3>
            <div className="rejection-box">
              <p>{fir.rejectionReason}</p>
            </div>
          </div>
        )}

        {fir.finalReport && (
          <div className="details-section final-report-section">
            <h3>Final Report</h3>
            <div className="final-report-box">
              <p>{fir.finalReport}</p>
            </div>
          </div>
        )}

        <div className="details-section">
          <h3>Timeline</h3>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <strong>FIR Submitted</strong>
                <span>{format(new Date(fir.createdAt), 'MMM dd, yyyy hh:mm a')}</span>
              </div>
            </div>
            {fir.updatedAt && fir.updatedAt !== fir.createdAt && (
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <strong>Last Updated</strong>
                  <span>{format(new Date(fir.updatedAt), 'MMM dd, yyyy hh:mm a')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FIRDetails;

