import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import FIRSubmission from './pages/FIRSubmission';
import FIRTracking from './pages/FIRTracking';
import FIRDetails from './pages/FIRDetails';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/submit-fir"
                  element={
                    <PrivateRoute>
                      <FIRSubmission />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/track-fir"
                  element={
                    <PrivateRoute>
                      <FIRTracking />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/fir/:id"
                  element={
                    <PrivateRoute>
                      <FIRDetails />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/officer/dashboard"
                  element={
                    <RoleRoute allowedRoles={['officer', 'admin']}>
                      <OfficerDashboard />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <RoleRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </RoleRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-text)',
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;

