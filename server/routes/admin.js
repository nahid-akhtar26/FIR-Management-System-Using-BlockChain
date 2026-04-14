const express = require('express');
const User = require('../models/User');
const FIR = require('../models/FIR');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check admin role
const adminAuth = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/officers
// @desc    Get all officers
// @access  Private (Admin only)
router.get('/officers', auth, adminAuth, async (req, res) => {
  try {
    const officers = await User.find({ role: 'officer' }).select('-password');
    res.json(officers);
  } catch (error) {
    console.error('Get Officers Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/firs
// @desc    Get all FIRs
// @access  Private (Admin only)
router.get('/firs', auth, adminAuth, async (req, res) => {
  try {
    const firs = await FIR.find().sort({ createdAt: -1 });
    res.json(firs);
  } catch (error) {
    console.error('Get FIRs Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/users', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, phone, password, role: role || 'user' });
    await user.save();
    
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/officers
// @desc    Create new officer
// @access  Private (Admin only)
router.post('/officers', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, phone, password, badgeNumber } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Officer already exists' });
    }

    const officer = new User({ 
      name, 
      email, 
      phone, 
      password, 
      role: 'officer',
      badgeNumber 
    });
    await officer.save();
    
    res.status(201).json({ message: 'Officer created successfully', officer });
  } catch (error) {
    console.error('Create Officer Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/officers/:id
// @desc    Update officer status
// @access  Private (Admin only)
router.put('/officers/:id', auth, adminAuth, async (req, res) => {
  try {
    const { approved } = req.body;
    const officer = await User.findById(req.params.id);
    
    if (!officer) {
      return res.status(404).json({ message: 'Officer not found' });
    }

    officer.approved = approved !== undefined ? approved : officer.approved;
    await officer.save();
    
    res.json({ message: 'Officer status updated', officer });
  } catch (error) {
    console.error('Update Officer Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

