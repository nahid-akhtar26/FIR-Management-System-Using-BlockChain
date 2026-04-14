import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Chatbot from './Chatbot';
import {
  FiHome,
  FiFileText,
  FiSearch,
  FiUser,
  FiLogOut,
  FiMoon,
  FiSun,
  FiGlobe,
  FiMenu,
  FiX,
  FiMessageCircle,
  FiSettings,
  FiShield
} from 'react-icons/fi';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (!user) return [];
    
    const baseItems = [
      { path: '/dashboard', icon: FiHome, label: t('dashboard'), roles: ['user'] },
      { path: '/submit-fir', icon: FiFileText, label: t('submitFIR'), roles: ['user'] },
      { path: '/track-fir', icon: FiSearch, label: t('trackFIR'), roles: ['user'] },
      { path: '/officer/dashboard', icon: FiShield, label: 'Review FIRs', roles: ['officer', 'admin'] },
      { path: '/admin/dashboard', icon: FiSettings, label: 'Admin Panel', roles: ['admin'] },
      { path: '/profile', icon: FiUser, label: t('profile'), roles: ['user', 'officer', 'admin'] },
    ];
    
    return baseItems.filter(item => !item.roles || item.roles.includes(user?.role));
  };

  const navItems = getNavItems();

  return (
    <div className="layout">
      {/* Horizontal Top Navigation */}
      <header className="top-navbar">
        <div className="navbar-container">
          {/* Logo and User Profile */}
          <div className="navbar-left">
            <div className="logo-section">
              <h2 className="logo">FIR System</h2>
            </div>
            <div className="user-profile-nav">
              <div className="user-avatar-nav">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info-nav">
                <div className="user-name-nav">{user?.name}</div>
                <div className={`user-status-nav ${user?.isOnline ? 'online' : 'offline'}`}>
                  <span className="status-dot-nav"></span>
                  {user?.isOnline ? t('online') : t('offline')}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="navbar-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="navbar-right">
            <button
              className="action-icon-btn"
              onClick={() => setChatbotOpen(!chatbotOpen)}
              title="Chatbot Help"
            >
              <FiMessageCircle />
            </button>
            
            <div className="language-selector-nav">
              <FiGlobe />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="language-select-nav"
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
              className="action-icon-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            >
              {theme === 'light' ? <FiMoon /> : <FiSun />}
            </button>

            <button
              className="action-icon-btn logout-btn-nav"
              onClick={handleLogout}
              title={t('logout')}
            >
              <FiLogOut />
            </button>

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FiMenu />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-nav-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="main-content-wrapper">
        <main className="page-content">{children}</main>
      </div>

      {/* Chatbot */}
      {chatbotOpen && (
        <Chatbot onClose={() => setChatbotOpen(false)} />
      )}
    </div>
  );
};

export default Layout;
