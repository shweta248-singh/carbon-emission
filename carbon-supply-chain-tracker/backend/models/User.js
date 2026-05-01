const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
    password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 10,
    select: false,
  },
  preferences: {
    theme: { type: String, default: 'dark' },
    defaultVehicle: { type: String, default: 'truck' },
    carbonUnit: { type: String, default: 'kg' },
    language: { type: String, default: 'en' }
  },
  notifications: {
    emailAlerts: { type: Boolean, default: true },
    lowStockAlerts: { type: Boolean, default: true },
    shipmentUpdates: { type: Boolean, default: true },
    carbonReportAlerts: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
