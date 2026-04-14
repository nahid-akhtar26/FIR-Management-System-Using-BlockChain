import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

axios.defaults.baseURL = API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
      
      // Update online status
      axios.put('/api/user/online-status', { isOnline: true }).catch(console.error);
    } catch (error) {
      console.error('Fetch user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role = 'user') => {
    try {
      const response = await axios.post('/api/auth/login', { email, password, role });
      const { token: newToken, user: userData } = response.data;
      
      // Verify role matches
      if (userData.role !== role) {
        toast.error(`Access denied. This account is registered as ${userData.role}, not ${role}.`);
        return { success: false, error: 'Role mismatch', user: userData };
      }
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Login successful!');
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      let message = 'Login failed';
      
      if (error.response) {
        if (error.response.data.errors) {
          message = error.response.data.errors.map(e => e.msg).join(', ');
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      } else if (error.request) {
        message = 'Cannot connect to server. Make sure backend is running on port 5000.';
      } else {
        message = error.message || 'Login failed';
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Registration successful!');
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      let message = 'Registration failed';
      
      if (error.response) {
        // Server responded with error
        if (error.response.data.errors) {
          // Validation errors
          message = error.response.data.errors.map(e => e.msg).join(', ');
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      } else if (error.request) {
        // Request made but no response
        message = 'Cannot connect to server. Make sure backend is running on port 5000.';
      } else {
        // Error setting up request
        message = error.message || 'Registration failed';
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const otpLogin = async (tokenData, userData) => {
    try {
      if (!tokenData || !userData) {
        throw new Error('Token or user data is missing');
      }
      
      setToken(tokenData);
      setUser(userData);
      localStorage.setItem('token', tokenData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`;
      
      // Update online status
      axios.put('/api/user/online-status', { isOnline: true }).catch(console.error);
      
      toast.success('Login successful!');
      return { success: true, user: userData };
    } catch (error) {
      console.error('OTP Login Error:', error);
      toast.error('Failed to complete login');
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchUser, otpLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

