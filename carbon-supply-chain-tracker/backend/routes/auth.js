const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { validate, registerValidationRules, loginValidationRules } = require('../middleware/validation');
const sendEmail = require('../utils/sendEmail');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many attempts, please try again after 15 minutes'
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', authLimiter, registerValidationRules(), validate, async (req, res, next) => {
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
      // Send welcome email
      let emailError = null;
      try {
        await sendEmail({
          email: user.email,
          subject: 'Welcome to CarbonTrace',
          message: `Hello ${user.name},\n\nWelcome to CarbonTrace! Your account has been successfully created.`,
          html: `<h1>Welcome to CarbonTrace</h1><p>Hello ${user.name},</p><p>Your account has been successfully created.</p>`
        });
      } catch (err) {
        console.error('Email could not be sent');
        emailError = err.message;
      }

      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        ...(process.env.NODE_ENV === 'development' && emailError ? { emailError } : {})
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authLimiter, loginValidationRules(), validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
