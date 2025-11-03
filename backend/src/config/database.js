const { Sequelize } = require('sequelize');
const winston = require('winston');

// Load environment variables
require('dotenv').config();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: process.env.LOG_FILE_PATH || './logs/app.log' })
  ]
});

// Database configuration
const dbConfig = process.env.NODE_ENV === 'development' && !process.env.FORCE_MYSQL ? {
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: (msg) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(msg);
    }
  },
  define: {
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
} : {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'investment_platform',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  dialect: 'mysql',
  dialectOptions: {
    charset: 'utf8mb4',
  },
  pool: {
    min: parseInt(process.env.DB_POOL_MIN) || 0,
    max: parseInt(process.env.DB_POOL_MAX) || 5,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 10000
  },
  logging: (msg) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(msg);
    }
  },
  define: {
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
};

// Create Sequelize instance
const sequelize = new Sequelize(dbConfig);

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ MySQL database connection established successfully');

    if (process.env.NODE_ENV === 'development') {
      // Sync database in development (create tables if they don't exist)
      await sequelize.sync({ alter: false }); // Use alter: true carefully in development
      logger.info('✅ Database synchronized');
    }
  } catch (error) {
    logger.error('❌ Unable to connect to MySQL database:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const disconnectDB = async () => {
  try {
    await sequelize.close();
    logger.info('✅ Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
  }
};

module.exports = {
  sequelize,
  connectDB,
  disconnectDB,
  logger
};
