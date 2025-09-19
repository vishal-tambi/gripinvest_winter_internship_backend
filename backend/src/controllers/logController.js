// Simple Log Controller
const { TransactionLog } = require('../models');
const { summarizeUserErrors } = require('../services/aiService');

// Get user logs
const getUserLogs = async (req, res) => {
  try {
    const { userId } = req.query;
    const targetUserId = userId || req.user.userId;

    const logs = await TransactionLog.findAll({
      where: { user_id: targetUserId },
      order: [['created_at', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get AI error summary
const getErrorSummary = async (req, res) => {
  try {
    const errorLogs = await TransactionLog.findAll({
      where: {
        user_id: req.user.userId,
        status_code: { [require('sequelize').Op.gte]: 400 }
      },
      order: [['created_at', 'DESC']],
      limit: 20
    });

    // Use AI to generate user-friendly summary
    const aiSummary = await summarizeUserErrors(errorLogs);

    res.json({
      success: true,
      data: {
        summary: aiSummary,
        error_count: errorLogs.length,
        recent_errors: errorLogs.slice(0, 3).map(log => ({
          endpoint: log.endpoint,
          method: log.http_method,
          status: log.status_code,
          time: log.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Get error summary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getUserLogs,
  getErrorSummary
};