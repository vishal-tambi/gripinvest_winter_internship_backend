// Simple Logging Middleware
const { TransactionLog } = require('../models');

const logTransaction = async (req, res, next) => {
  const originalSend = res.send;

  res.send = function(data) {
    // Log after response is sent
    setTimeout(async () => {
      try {
        await TransactionLog.create({
          user_id: req.user ? req.user.userId : null,
          email: req.user ? req.user.email : null,
          endpoint: req.path,
          http_method: req.method,
          status_code: res.statusCode,
          error_message: res.statusCode >= 400 ? data : null
        });
      } catch (error) {
        console.error('Logging error:', error);
      }
    }, 0);

    originalSend.call(this, data);
  };

  next();
};

module.exports = { logTransaction };