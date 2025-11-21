// Simple Express App
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { connectDB } = require('./config/database');
// Import models to ensure they are registered
require('./models');
const { logTransaction } = require('./middleware/logging');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const investmentRoutes = require('./routes/investments');
const userRoutes = require('./routes/users');
const logRoutes = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(helmet());

// CORS Configuration - UPDATED
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : [
      'http://localhost:8080',
      'http://localhost:5173',
      'http://localhost:3000',
      'https://gripinvest-winter-internship-backen-one.vercel.app' // Add your Vercel URL
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(logTransaction);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const { sequelize } = require('./config/database');
    await sequelize.authenticate();

    res.json({
      success: true,
      data: {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        corsOrigins: allowedOrigins // Helpful for debugging
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message
      }
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/logs', logRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Investment Platform API',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Enhanced error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  // CORS errors
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy: Origin not allowed',
      origin: req.headers.origin
    });
  }
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔧 API base: http://localhost:${PORT}/api`);
      console.log(`🌐 CORS enabled for:`, allowedOrigins);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  const { disconnectDB } = require('./config/database');
  await disconnectDB();
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;