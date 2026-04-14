const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { generateOTP, storeOTP, verifyOTP, sendOTP } = require('../services/otp');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      address: address || '',
      role: 'user'
    });

    await user.save();

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify role if provided
    if (role && user.role !== role) {
      return res.status(403).json({ message: `Access denied. This account is registered as ${user.role}, not ${role}.` });
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isOnline: user.isOnline,
        language: user.language,
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (update online status)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isOnline = false;
    user.lastSeen = new Date();
    await user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP to email or phone
// @access  Public
router.post('/send-otp', [
  body('identifier').notEmpty().withMessage('Email or phone number is required'),
  body('method').optional().isIn(['email', 'sms', 'phone']).withMessage('Method must be email, sms, or phone')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, method = 'sms' } = req.body;

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(identifier, otp);
    
    // Send OTP
    await sendOTP(identifier, otp, method);

    res.json({ 
      message: `OTP sent to ${identifier}`,
      expiresIn: 300 // 5 minutes in seconds
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Server error while sending OTP' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login/register
// @access  Public
router.post('/verify-otp', [
  body('identifier').notEmpty().withMessage('Email or phone number is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('action').isIn(['login', 'register']).withMessage('Action must be login or register')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, otp, action, name, phone, email, address } = req.body;

    // Verify OTP
    const verification = verifyOTP(identifier, otp);
    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }

    if (action === 'login') {
      // Find user by email or phone
      const user = await User.findOne({
        $or: [
          { email: identifier },
          { phone: identifier }
        ]
      });

      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

      // Update online status
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();

      const token = generateToken(user._id);

      res.json({
        token,
        user: {
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isOnline: user.isOnline,
          language: user.language || 'en',
          theme: user.theme || 'light'
        }
      });
    } else if (action === 'register') {
      // Validate required fields for registration
      if (!name || !email || !phone) {
        return res.status(400).json({ message: 'Name, email, and phone are required for registration' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [
          { email },
          { phone }
        ]
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email or phone' });
      }

      // Create new user (password will be set later or can be optional)
      const user = new User({
        name,
        email,
        phone,
        password: Math.random().toString(36).slice(-12), // Generate random password
        address: address || '',
        role: 'user',
        isOnline: true,
        lastSeen: new Date()
      });

      await user.save();

      const token = generateToken(user._id);

      res.status(201).json({
        token,
        user: {
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isOnline: user.isOnline,
          language: user.language || 'en',
          theme: user.theme || 'light'
        }
      });
    }
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
});

module.exports = router;
