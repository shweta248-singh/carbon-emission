const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();
const { validate } = require('../middleware/validation');
const { body } = require('express-validator');
const sendEmail = require('../utils/sendEmail');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
router.put('/me', protect, [
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  validate
], async (req, res, next) => {
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
    next(error);
  }
});

// @desc    Update password
// @route   PUT /api/users/password
// @access  Private
router.put('/password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
  validate
], async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    const { currentPassword, newPassword } = req.body;

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    // Send notification
    let emailError = null;
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Changed - CarbonTrace',
        message: `Hello ${user.name},\n\nYour password for CarbonTrace has been successfully changed. If you did not perform this action, please contact support immediately.`,
        html: `<h1>Security Alert</h1><p>Hello ${user.name},</p><p>Your password for CarbonTrace has been successfully changed.</p><p>If you did not perform this action, please contact support immediately.</p>`
      });
    } catch (err) {
      console.error('Email could not be sent');
      emailError = err.message;
    }

    res.json({
      success: true,
      message: 'Password updated successfully',
      ...(process.env.NODE_ENV === 'development' && emailError ? { emailError } : {})
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update preferences
// @route   PUT /api/users/preferences
// @access  Private
router.put('/preferences', protect, async (req, res, next) => {
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
    next(error);
  }
});

// @desc    Update notification settings
// @route   PUT /api/users/notifications
// @access  Private
router.put('/notifications', protect, async (req, res, next) => {
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
    next(error);
  }
});

module.exports = router;
