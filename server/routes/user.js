const express = require('express');
const User = require('../models/User');
const FIR = require('../models/FIR');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const firCount = await FIR.countDocuments({ userId: req.user._id });
    const pendingCount = await FIR.countDocuments({ userId: req.user._id, status: 'pending' });
    const approvedCount = await FIR.countDocuments({ userId: req.user._id, status: 'approved' });
    const resolvedCount = await FIR.countDocuments({ userId: req.user._id, status: 'resolved' });

    res.json({
      user,
      stats: {
        totalFIRs: firCount,
        pending: pendingCount,
        approved: approvedCount,
        resolved: resolvedCount
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address, language, theme } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (language) user.language = language;
    if (theme) user.theme = theme;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/user/online-status
// @desc    Update online status
// @access  Private
router.put('/online-status', auth, async (req, res) => {
  try {
    const { isOnline } = req.body;
    const user = await User.findById(req.user._id);
    user.isOnline = isOnline !== undefined ? isOnline : true;
    user.lastSeen = new Date();
    await user.save();
    res.json({ message: 'Online status updated', isOnline: user.isOnline });
  } catch (error) {
    console.error('Update Online Status Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

