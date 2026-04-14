import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { FiSearch, FiClock, FiCheckCircle, FiXCircle, FiFileText } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './FIRTracking.css';

const FIRTracking = () => {
  const { t } = useLanguage();
  const [firs, setFirs] = useState([]);
  const [filteredFirs, setFilteredFirs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFIRs();
  }, []);

  useEffect(() => {
    filterFIRs();
  }, [searchTerm, statusFilter, firs]);

  const fetchFIRs = async () => {
    try {
      const response = await axios.get('/api/fir/my-firs');
      setFirs(response.data);
      setFilteredFirs(response.data);
    } catch (error) {
      console.error('FIR fetch error:', error);
      toast.error('Failed to load FIRs');
    } finally {
      setLoading(false);
    }
  };

  const filterFIRs = () => {
    let filtered = [...firs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(fir =>
        fir.incidentDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fir.incidentLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (fir.caseNumber && fir.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(fir => fir.status === statusFilter);
    }

    setFilteredFirs(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="status-icon pending" />;
      case 'under_review':
        return <FiClock className="status-icon under-review" />;
      case 'approved':
        return <FiCheckCircle className="status-icon approved" />;
      case 'rejected':
        return <FiXCircle className="status-icon rejected" />;
      case 'resolved':
        return <FiCheckCircle className="status-icon resolved" />;
      default:
        return <FiFileText className="status-icon" />;
    }
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
      <div className="tracking-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="fir-tracking">
      <div className="tracking-header">
        <h2>{t('trackFIR')}</h2>
        <p>View and track all your submitted FIRs</p>
      </div>

      <div className="tracking-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by case number, location, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-filters">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${statusFilter === 'under_review' ? 'active' : ''}`}
            onClick={() => setStatusFilter('under_review')}
          >
            Under Review
          </button>
          <button
            className={`filter-btn ${statusFilter === 'approved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('approved')}
          >
            Approved
          </button>
          <button
            className={`filter-btn ${statusFilter === 'resolved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('resolved')}
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="fir-list-container">
        {filteredFirs.length === 0 ? (
          <div className="empty-state">
            <FiFileText />
            <p>No FIRs found</p>
          </div>
        ) : (
          <div className="fir-list">
            {filteredFirs.map((fir) => (
              <Link key={fir._id} to={`/fir/${fir._id}`} className="fir-card">
                <div className="fir-card-header">
                  <div className="fir-id-section">
                    <div className="fir-id">
                      {fir.caseNumber || `FIR-${fir._id.slice(-6)}`}
                    </div>
                    <div className="fir-date">
                      {format(new Date(fir.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div
                    className="fir-status"
                    style={{ color: getStatusColor(fir.status) }}
                  >
                    {getStatusIcon(fir.status)}
                    <span>{t(fir.status)}</span>
                  </div>
                </div>

                <div className="fir-card-body">
                  <p className="fir-description">{fir.incidentDescription}</p>
                  <div className="fir-meta">
                    <span>
                      <strong>Location:</strong> {fir.incidentLocation}
                    </span>
                    <span>
                      <strong>Date:</strong> {format(new Date(fir.incidentDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>

                {fir.blockchainHash && (
                  <div className="fir-blockchain">
                    <span>✓ Blockchain Verified</span>
                    <span className="hash-preview">{fir.blockchainHash.slice(0, 20)}...</span>
                  </div>
                )}

                {fir.reviewComments && (
                  <div className="fir-review">
                    <strong>Review Comments:</strong> {fir.reviewComments}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FIRTracking;

