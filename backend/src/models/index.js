const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const InvestmentProduct = require('./InvestmentProduct');
const Investment = require('./Investment');
const TransactionLog = require('./TransactionLog');

// Define associations
// User -> Investments (One to Many)
User.hasMany(Investment, {
  foreignKey: 'user_id',
  as: 'investments'
});

Investment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// InvestmentProduct -> Investments (One to Many)
InvestmentProduct.hasMany(Investment, {
  foreignKey: 'product_id',
  as: 'investments'
});

Investment.belongsTo(InvestmentProduct, {
  foreignKey: 'product_id',
  as: 'product'
});

// User -> TransactionLogs (One to Many)
User.hasMany(TransactionLog, {
  foreignKey: 'user_id',
  as: 'transaction_logs'
});

TransactionLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  InvestmentProduct,
  Investment,
  TransactionLog
};