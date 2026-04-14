import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, token, fetchUser } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [stats, setStats] = useState({
    totalFIRs: 0,
    pending: 0,
    approved: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      setProfile(response.data.user);
      setStats(response.data.stats);
      setFormData({
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone,
        address: response.data.user.address || ''
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      await axios.put('/api/user/profile', formData);
      await fetchUser();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <h2>{t('myProfile')}</h2>
        {!isEditing ? (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            <FiEdit2 />
            Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button className="cancel-btn" onClick={handleCancel}>
              <FiX />
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave}>
              <FiSave />
              Save
            </button>
          </div>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <h3>{profile?.name}</h3>
          <div className={`online-status ${profile?.isOnline ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            {profile?.isOnline ? t('online') : t('offline')}
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h4>Personal Information</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <label>
                  <FiUser />
                  {t('name')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profile?.name}</p>
                )}
              </div>

              <div className="detail-item">
                <label>
                  <FiMail />
                  {t('email')}
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                  />
                ) : (
                  <p>{profile?.email}</p>
                )}
              </div>

              <div className="detail-item">
                <label>
                  <FiPhone />
                  {t('phone')}
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profile?.phone}</p>
                )}
              </div>

              <div className="detail-item">
                <label>
                  <FiMapPin />
                  {t('address')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profile?.address || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4>Statistics</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.totalFIRs}</div>
                <div className="stat-label">{t('totalFIRs')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.pending}</div>
                <div className="stat-label">{t('pendingFIRs')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.approved}</div>
                <div className="stat-label">{t('approvedFIRs')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.resolved}</div>
                <div className="stat-label">{t('resolvedFIRs')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

