const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const { firstName, lastName, company, email } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const userExists = await User.findOne({ email });
      if (userExists && userExists._id.toString() !== req.user.id) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    const fieldsToUpdate = {
      firstName,
      lastName,
      company,
      email,
      name: `${firstName || ''} ${lastName || ''}`.trim() || undefined
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update password
// @route   PUT /api/users/password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    const { currentPassword, newPassword } = req.body;

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update preferences
// @route   PUT /api/users/preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { theme, defaultVehicle, carbonUnit, language } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        preferences: { theme, defaultVehicle, carbonUnit, language }
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      data: user.preferences
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update notification settings
// @route   PUT /api/users/notifications
// @access  Private
router.put('/notifications', protect, async (req, res) => {
  try {
    const { emailAlerts, lowStockAlerts, shipmentUpdates, carbonReportAlerts } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        notifications: { emailAlerts, lowStockAlerts, shipmentUpdates, carbonReportAlerts }
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      data: user.notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
