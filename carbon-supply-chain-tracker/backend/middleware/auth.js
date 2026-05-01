const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // Check cookies first (Production-grade security)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // Fallback to Authorization header for flexibility during transition/API testing
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};
