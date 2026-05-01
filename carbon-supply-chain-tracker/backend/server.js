const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// Critical Env Check
const requiredEnv = [
  'MONGODB_URI', 
  'JWT_SECRET', 
  'COOKIE_SECRET',
  'OPENROUTER_API_KEY', 
  'SENDGRID_API_KEY', 
  'ORS_API_KEY'
];

requiredEnv.forEach(env => {
  if (!process.env[env]) {
    console.error(`CRITICAL ERROR: Environment variable ${env} is missing.`);
    process.exit(1);
  }
});

if (process.env.JWT_SECRET.length < 64) {
  console.warn('WARNING: JWT_SECRET should be at least 64 characters for production.');
}

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],

      scriptSrc: ["'self'"],

      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],

      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],

      imgSrc: [
        "'self'",
        "data:",
        "https:"
      ],

      connectSrc: [
        "'self'",
        "https://openrouter.ai",
        "https://api.openrouteservice.org",
        process.env.FRONTEND_URL,
        process.env.BACKEND_URL
      ].filter(Boolean),
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(hpp());

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Specific Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Please wait 15 minutes.' }
});

const optimizeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 10,
  message: { success: false, message: 'Optimization limit reached. Please wait a minute.' }
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/shipments/optimize', optimizeLimiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Use a more production-friendly logger in real apps, morgan combined is okay for now
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400
  }));
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/shipments', require('./routes/shipments'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/operations', require('./routes/operations'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/notifications', require('./routes/notifications'));

// Root route
app.get('/', (req, res) => {
  res.send('Carbon Trace API is running securely...');
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

