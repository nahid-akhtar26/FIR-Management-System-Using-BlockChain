import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { FiLock, FiMail, FiEye, FiEyeOff, FiGlobe, FiHelpCircle, FiUser, FiShield, FiSettings, FiPhone, FiMessageCircle } from 'react-icons/fi';
import Chatbot from '../components/Chatbot';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, user, otpLogin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    identifier: '', // for OTP
    otp: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [chatbotOpen, setChatbotOpen] = useState(false);

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
    if (!formData.identifier) {
      toast.error('Please enter your email or phone number');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await axios.post('/api/auth/send-otp', {
        identifier: formData.identifier,
        method: formData.identifier.includes('@') ? 'email' : 'sms'
      });
      
      toast.success(response.data.message);
      setOtpSent(true);
      setCountdown(60); // 60 seconds countdown
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOTPLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.identifier || !formData.otp) {
      toast.error('Please enter identifier and OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/verify-otp', {
        identifier: formData.identifier,
        otp: formData.otp,
        action: 'login'
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
      
      // Navigate based on role
      const userRole = userData?.role || formData.role;
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'officer') {
        navigate('/officer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('OTP Login Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Invalid OTP or server error';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData.email, formData.password, formData.role);
    setLoading(false);
    if (result.success) {
      // Navigate based on role
      const userRole = result.user?.role || formData.role;
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'officer') {
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
          <h1>FIR Management System</h1>
          <p>{t('login')} to your account</p>
        </div>

        {/* Login Method Toggle */}
        <div className="login-method-toggle">
          <button
            type="button"
            className={`method-btn ${loginMethod === 'password' ? 'active' : ''}`}
            onClick={() => {
              setLoginMethod('password');
              setOtpSent(false);
              setFormData({ ...formData, otp: '', identifier: '' });
            }}
          >
            <FiLock />
            <span>Password</span>
          </button>
          <button
            type="button"
            className={`method-btn ${loginMethod === 'otp' ? 'active' : ''}`}
            onClick={() => {
              setLoginMethod('otp');
              setOtpSent(false);
              setFormData({ ...formData, password: '', email: '' });
            }}
          >
            <FiMessageCircle />
            <span>OTP</span>
          </button>
        </div>

        {loginMethod === 'password' ? (
          <form onSubmit={handleSubmit} className="auth-form">
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
                <FiLock />
                {t('password') || 'Password'}
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
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
                <FiShield />
                Login As
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
                  <span>Investigating Officer</span>
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
              {loading ? (t('loggingIn') || 'Logging in...') : t('login')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOTPLogin} className="auth-form">
            <div className="form-group">
              <label>
                {formData.identifier.includes('@') ? <FiMail /> : <FiPhone />}
                Email or Phone Number
              </label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter email or phone number"
                required
              />
            </div>

            {!otpSent ? (
              <button
                type="button"
                className="auth-button"
                onClick={handleSendOTP}
                disabled={otpLoading || !formData.identifier}
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
                    value={formData.otp}
                    onChange={handleChange}
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
                    Login As
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
                      <span>Investigating Officer</span>
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
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </>
            )}
          </form>
        )}

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">{t('register')}</Link>
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

export default Login;
