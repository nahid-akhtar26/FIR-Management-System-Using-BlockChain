import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { FiFileText, FiCalendar, FiMapPin, FiUser, FiPhone, FiMail, FiHome, FiCheck, FiUpload, FiX, FiImage, FiFile, FiVideo } from 'react-icons/fi';
import Tooltip from '../components/Tooltip';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import './FIRSubmission.css';

const FIRSubmission = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [autoSaved, setAutoSaved] = useState(false);
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('fir_draft');
    return saved ? JSON.parse(saved) : {
      complainantName: '',
      complainantPhone: '',
      complainantEmail: '',
      complainantAddress: '',
      incidentDate: '',
      incidentLocation: '',
      incidentDescription: '',
      policeStation: '',
      witnesses: [{ name: '', phone: '', address: '' }],
      evidence: []
    };
  });
  const [evidenceFiles, setEvidenceFiles] = useState([]);

  // Calculate form progress
  useEffect(() => {
    const fields = [
      formData.complainantName,
      formData.complainantPhone,
      formData.complainantEmail,
      formData.complainantAddress,
      formData.incidentDate,
      formData.incidentLocation,
      formData.incidentDescription
    ];
    const filled = fields.filter(f => f && f.trim() !== '').length;
    setProgress(Math.round((filled / fields.length) * 100));
  }, [formData]);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.complainantName || formData.incidentDescription) {
        localStorage.setItem('fir_draft', JSON.stringify(formData));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleWitnessChange = (index, field, value) => {
    const witnesses = [...formData.witnesses];
    witnesses[index][field] = value;
    setFormData({ ...formData, witnesses });
  };

  const addWitness = () => {
    setFormData({
      ...formData,
      witnesses: [...formData.witnesses, { name: '', phone: '', address: '' }]
    });
  };

  const removeWitness = (index) => {
    if (formData.witnesses.length > 1) {
      const witnesses = formData.witnesses.filter((_, i) => i !== index);
      setFormData({ ...formData, witnesses });
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileType = file.type.startsWith('image/') ? 'image' :
                        file.type.startsWith('video/') ? 'video' :
                        file.type.startsWith('audio/') ? 'audio' : 'document';
        
        const evidenceItem = {
          type: fileType,
          url: reader.result,
          name: file.name,
          size: file.size,
          file: file
        };
        
        setEvidenceFiles(prev => [...prev, evidenceItem]);
        setFormData(prev => ({
          ...prev,
          evidence: [...prev.evidence, evidenceItem]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEvidence = (index) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare form data with files
      const submitData = {
        ...formData,
        evidence: formData.evidence.map(ev => ({
          type: ev.type,
          url: ev.url,
          description: ev.description || ''
        }))
      };

      const response = await axios.post('/api/fir/submit', submitData);
      localStorage.removeItem('fir_draft');
      setEvidenceFiles([]);
      toast.success('FIR submitted successfully! Blockchain hash generated.');
      
      // Check if fir data exists before navigating
      if (response.data && response.data.fir && response.data.fir.id) {
        setTimeout(() => {
          navigate(`/fir/${response.data.fir.id}`);
        }, 500);
      } else {
        // If no ID, navigate to tracking page
        setTimeout(() => {
          navigate('/track-fir');
        }, 500);
      }
    } catch (error) {
      console.error('FIR submission error:', error);
      const message = error.response?.data?.message || 'Failed to submit FIR';
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="fir-submission">
      {loading && <Loader message="Submitting FIR & Validating on Blockchain..." />}
      
      <div className="submission-header">
        <div>
          <h2>{t('firSubmission')}</h2>
          <p>Fill in all the details to submit your FIR. All fields are required.</p>
        </div>
        {autoSaved && (
          <div className="auto-save-indicator">
            <FiCheck />
            <span>Auto-saved</span>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="progress-section">
        <div className="progress-header">
          <span>Form Progress</span>
          <span className="progress-percentage">{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="submission-form">
        <div className="form-section">
          <h3>
            <FiUser />
            {t('complainantInfo')}
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label>
                {t('name')} *
                <Tooltip text="Enter your full legal name as it appears on your ID">
                  <span></span>
                </Tooltip>
              </label>
              <input
                type="text"
                name="complainantName"
                value={formData.complainantName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>
                <FiPhone />
                {t('phone')} *
              </label>
              <input
                type="tel"
                name="complainantPhone"
                value={formData.complainantPhone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label>
                <FiMail />
                {t('email')} *
              </label>
              <input
                type="email"
                name="complainantEmail"
                value={formData.complainantEmail}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>
                <FiHome />
                {t('address')} *
              </label>
              <input
                type="text"
                name="complainantAddress"
                value={formData.complainantAddress}
                onChange={handleChange}
                required
                placeholder="Enter your address"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>
            <FiFileText />
            {t('incidentDetails')}
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label>
                <FiCalendar />
                {t('incidentDate')} *
              </label>
              <input
                type="datetime-local"
                name="incidentDate"
                value={formData.incidentDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FiMapPin />
                {t('incidentLocation')} *
              </label>
              <input
                type="text"
                name="incidentLocation"
                value={formData.incidentLocation}
                onChange={handleChange}
                required
                placeholder="Enter incident location"
              />
            </div>

            <div className="form-group">
              <label>
                <FiMapPin />
                Police Station *
              </label>
              <input
                type="text"
                name="policeStation"
                value={formData.policeStation}
                onChange={handleChange}
                required
                placeholder="Select or enter police station"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>{t('description')} *</label>
            <textarea
              name="incidentDescription"
              value={formData.incidentDescription}
              onChange={handleChange}
              required
              rows="6"
              placeholder="Describe the incident in detail..."
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Witnesses (Optional)</h3>
            <button type="button" className="add-witness-btn" onClick={addWitness}>
              + Add Witness
            </button>
          </div>
          {formData.witnesses.map((witness, index) => (
            <div key={index} className="witness-group">
              <div className="witness-header">
                <h4>Witness {index + 1}</h4>
                {formData.witnesses.length > 1 && (
                  <button
                    type="button"
                    className="remove-witness-btn"
                    onClick={() => removeWitness(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={witness.name}
                    onChange={(e) => handleWitnessChange(index, 'name', e.target.value)}
                    placeholder="Witness name"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={witness.phone}
                    onChange={(e) => handleWitnessChange(index, 'phone', e.target.value)}
                    placeholder="Witness phone"
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={witness.address}
                    onChange={(e) => handleWitnessChange(index, 'address', e.target.value)}
                    placeholder="Witness address"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-section">
          <h3>
            <FiUpload />
            Upload Evidence (Optional)
          </h3>
          <p className="section-description">
            Upload images, videos, documents, or audio files related to the incident. Maximum file size: 10MB per file.
          </p>
          
          <div className="file-upload-area">
            <input
              type="file"
              id="evidence-upload"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="file-input"
            />
            <label htmlFor="evidence-upload" className="file-upload-label">
              <FiUpload />
              <span>Click to upload or drag and drop</span>
              <small>Images, Videos, Documents, Audio (Max 10MB each)</small>
            </label>
          </div>

          {evidenceFiles.length > 0 && (
            <div className="evidence-preview">
              <h4>Uploaded Evidence ({evidenceFiles.length})</h4>
              <div className="evidence-grid">
                {evidenceFiles.map((file, index) => (
                  <div key={index} className="evidence-item">
                    <div className="evidence-icon">
                      {file.type === 'image' && <FiImage />}
                      {file.type === 'video' && <FiVideo />}
                      {file.type === 'document' && <FiFile />}
                      {file.type === 'audio' && <FiFile />}
                    </div>
                    <div className="evidence-info">
                      <p className="evidence-name">{file.name}</p>
                      <p className="evidence-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      className="remove-evidence-btn"
                      onClick={() => removeEvidence(index)}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit FIR'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FIRSubmission;

