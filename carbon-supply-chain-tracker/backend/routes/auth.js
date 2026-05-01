const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { validate, registerValidationRules, loginValidationRules } = require('../middleware/validation');
const sendEmail = require('../utils/sendEmail');

// Helper to send token via cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const options = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // Match JWT_EXPIRE (default 7d)
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      // Still sending token for transition period, but frontend should prefer cookies
      
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerValidationRules(), validate, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Send welcome email (non-blocking)
      sendEmail({
        email: user.email,
        subject: 'Welcome to CarbonTrace',
        message: `Hello ${user.name},\n\nWelcome to CarbonTrace! Your account has been successfully created.`,
        html: `<h1>Welcome to CarbonTrace</h1><p>Hello ${user.name},</p><p>Your account has been successfully created.</p>`
      }).catch(err => console.error('Welcome email failed:', err.message));

      sendTokenResponse(user, 201, res);
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginValidationRules(), validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      sendTokenResponse(user, 200, res);
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
router.get('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

module.exports = router;

