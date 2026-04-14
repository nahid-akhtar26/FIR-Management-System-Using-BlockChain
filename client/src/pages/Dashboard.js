import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FiFileText, FiClock, FiCheckCircle, FiXCircle, FiPlus, FiTrendingUp } from 'react-icons/fi';
import { format } from 'date-fns';
import './Dashboard.css';

const Dashboard = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalFIRs: 0,
    pending: 0,
    approved: 0,
    resolved: 0
  });
  const [recentFIRs, setRecentFIRs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, firsRes] = await Promise.all([
        axios.get('/api/user/profile'),
        axios.get('/api/fir/my-firs')
      ]);

      setStats(profileRes.data.stats);
      setRecentFIRs(firsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="status-icon pending" />;
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
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>{t('welcome')}, {user?.name}!</h2>
          <p>Here's an overview of your FIR submissions</p>
        </div>
        <Link to="/submit-fir" className="submit-fir-btn">
          <FiPlus />
          {t('submitFIR')}
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <FiFileText />
          </div>
          <div className="stat-content">
            <h3>{stats.totalFIRs}</h3>
            <p>{t('totalFIRs')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>{t('pendingFIRs')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.approved}</h3>
            <p>{t('approvedFIRs')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>{stats.resolved}</h3>
            <p>{t('resolvedFIRs')}</p>
          </div>
        </div>
      </div>

      <div className="recent-firs">
        <div className="section-header">
          <h3>Recent FIRs</h3>
          <Link to="/track-fir" className="view-all-link">
            View All →
          </Link>
        </div>

        {recentFIRs.length === 0 ? (
          <div className="empty-state">
            <FiFileText />
            <p>No FIRs submitted yet</p>
            <Link to="/submit-fir" className="empty-state-btn">
              Submit Your First FIR
            </Link>
          </div>
        ) : (
          <div className="fir-list">
            {recentFIRs.map((fir) => (
              <Link key={fir._id} to={`/fir/${fir._id}`} className="fir-card">
                <div className="fir-card-header">
                  <div className="fir-id">
                    {fir.caseNumber || `FIR-${fir._id.slice(-6)}`}
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
                    <span>{format(new Date(fir.incidentDate), 'MMM dd, yyyy')}</span>
                    <span>•</span>
                    <span>{fir.incidentLocation}</span>
                  </div>
                </div>
                {fir.blockchainHash && (
                  <div className="fir-blockchain">
                    <span>Blockchain Verified</span>
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

export default Dashboard;

