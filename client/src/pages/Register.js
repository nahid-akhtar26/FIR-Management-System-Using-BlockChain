import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { FiLock, FiMail, FiUser, FiPhone, FiMapPin, FiEye, FiEyeOff, FiGlobe, FiHelpCircle, FiShield, FiSettings, FiMessageCircle } from 'react-icons/fi';
import Chatbot from '../components/Chatbot';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, user, otpLogin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    role: 'user'
  });
  const [registerMethod, setRegisterMethod] = useState('password'); // 'password' or 'otp'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOTP = async () => {
    if (!formData.email && !formData.phone) {
      toast.error('Please enter your email or phone number');
      return;
    }

    const identifier = formData.email || formData.phone;
    setOtpLoading(true);
    try {
      const response = await axios.post('/api/auth/send-otp', {
        identifier,
        method: formData.email ? 'email' : 'sms'
      });
      
      toast.success(response.data.message);
      setOtpSent(true);
      setCountdown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOTPRegister = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !otp) {
      toast.error('Please fill all required fields and enter OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/verify-otp', {
        identifier: formData.email || formData.phone,
        otp,
        action: 'register',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: formData.role
      });

      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      const { token, user: userData } = response.data;
      
      if (!token || !userData) {
        throw new Error('Missing token or user data');
      }
      
      // Use otpLogin to update auth context
      await otpLogin(token, userData);
      
      // Small delay to ensure context is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast.success('Registration successful!');
      
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'officer') {
        navigate('/officer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('OTP Register Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('passwordsDoNotMatch') || 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('passwordMinLength') || 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    setLoading(false);
    if (result.success) {
      // Navigate based on role
      if (registerData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (registerData.role === 'officer') {
        navigate('/officer/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="auth-container">
      {/* Language Selector and Help */}
      <div className="auth-top-actions">
        <div className="language-selector-auth">
          <FiGlobe />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="language-select-auth"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                  <option value="zh">中文</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                  <option value="pt">Português</option>
                  <option value="ru">Русский</option>
                </select>
        </div>
        <button
          className="help-btn-auth"
          onClick={() => setChatbotOpen(true)}
          title="Get Help"
        >
          <FiHelpCircle />
          <span>Help</span>
        </button>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>{t('register')}</h1>
          <p>Register for FIR Management System</p>
        </div>

        {/* Registration Method Toggle */}
        <div className="login-method-toggle">
          <button
            type="button"
            className={`method-btn ${registerMethod === 'password' ? 'active' : ''}`}
            onClick={() => {
              setRegisterMethod('password');
              setOtpSent(false);
              setOtp('');
            }}
          >
            <FiLock />
            <span>Password</span>
          </button>
          <button
            type="button"
            className={`method-btn ${registerMethod === 'otp' ? 'active' : ''}`}
            onClick={() => {
              setRegisterMethod('otp');
              setOtpSent(false);
              setFormData({ ...formData, password: '', confirmPassword: '' });
            }}
          >
            <FiMessageCircle />
            <span>OTP</span>
          </button>
        </div>

        {registerMethod === 'password' ? (
          <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <FiUser />
              {t('name')}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FiMail />
              {t('email')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FiPhone />
              {t('phone')}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FiMapPin />
              {t('address')}
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
            />
          </div>

          <div className="form-group">
            <label>
              <FiLock />
              {t('password') || 'Password'}
            </label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password (min 6 characters)"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>
              <FiLock />
              {t('confirmPassword') || 'Confirm Password'}
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FiShield />
              Register As
            </label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${formData.role === 'user' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'user' })}
              >
                <FiUser />
                <span>User</span>
              </button>
              <button
                type="button"
                className={`role-option ${formData.role === 'officer' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'officer' })}
              >
                <FiShield />
                <span>Officer</span>
              </button>
              <button
                type="button"
                className={`role-option ${formData.role === 'admin' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'admin' })}
              >
                <FiSettings />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (t('creatingAccount') || 'Creating account...') : t('register')}
          </button>
        </form>
        ) : (
          <form onSubmit={handleOTPRegister} className="auth-form">
            <div className="form-group">
              <label>
                <FiUser />
                {t('name')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FiMail />
                {t('email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FiPhone />
                {t('phone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FiMapPin />
                {t('address')}
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
              />
            </div>

            {!otpSent ? (
              <button
                type="button"
                className="auth-button"
                onClick={handleSendOTP}
                disabled={otpLoading || !formData.email || !formData.phone}
              >
                {otpLoading ? 'Sending...' : 'Send OTP'}
              </button>
            ) : (
              <>
                <div className="form-group">
                  <label>
                    <FiMessageCircle />
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    required
                    className="otp-input"
                  />
                  {countdown > 0 && (
                    <p className="otp-countdown">Resend OTP in {countdown}s</p>
                  )}
                  {countdown === 0 && (
                    <button
                      type="button"
                      className="resend-otp-btn"
                      onClick={handleSendOTP}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <FiShield />
                    Register As
                  </label>
                  <div className="role-selector">
                    <button
                      type="button"
                      className={`role-option ${formData.role === 'user' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, role: 'user' })}
                    >
                      <FiUser />
                      <span>User</span>
                    </button>
                    <button
                      type="button"
                      className={`role-option ${formData.role === 'officer' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, role: 'officer' })}
                    >
                      <FiShield />
                      <span>Officer</span>
                    </button>
                    <button
                      type="button"
                      className={`role-option ${formData.role === 'admin' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, role: 'admin' })}
                    >
                      <FiSettings />
                      <span>Admin</span>
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-button" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Register'}
                </button>
              </>
            )}
          </form>
        )}

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">{t('login')}</Link>
          </p>
        </div>
      </div>

      {/* Chatbot */}
      {chatbotOpen && (
        <Chatbot onClose={() => setChatbotOpen(false)} />
      )}
    </div>
  );
};

export default Register;

