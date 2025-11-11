require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const notificationRoutes = require('./routes/notifications');
const errorHandler = require('./middleware/errorHandler');
const { textCorrectionMiddleware, createTextCorrectionEndpoint } = require('./middleware/textCorrectionMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Body parsing middleware with explicit UTF-8 support
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true,
  type: 'application/x-www-form-urlencoded'
}));

// Middleware to ensure proper UTF-8 handling
app.use((req, res, next) => {
  // Set response headers for UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Process request body for UTF-8 text fields
  if (req.body && typeof req.body === 'object') {
    const processStrings = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Ensure proper UTF-8 encoding
          obj[key] = Buffer.from(obj[key], 'utf8').toString('utf8');
        } else if (obj[key] && typeof obj[key] === 'object') {
          processStrings(obj[key]);
        }
      }
    };
    processStrings(req.body);
  }
  
  next();
});

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Middleware de correção automática de texto português
app.use(textCorrectionMiddleware());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Endpoint para teste de correção de texto
app.post('/api/correct-text', createTextCorrectionEndpoint());

// API routes
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;