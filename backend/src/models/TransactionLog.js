const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Transaction Log model - Exact schema from specification
const TransactionLog = sequelize.define('TransactionLog', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  endpoint: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Endpoint cannot be empty'
      }
    }
  },
  http_method: {
    type: DataTypes.ENUM('GET', 'POST', 'PUT', 'DELETE', 'HEAD'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['GET', 'POST', 'PUT', 'DELETE']],
        msg: 'HTTP method must be GET, POST, PUT, or DELETE'
      }
    }
  },
  status_code: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [100],
        msg: 'Status code must be a valid HTTP status code'
      },
      max: {
        args: [599],
        msg: 'Status code must be a valid HTTP status code'
      }
    }
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'transaction_logs',
  timestamps: false, // We're handling timestamps manually to match exact schema
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['email']
    },
    {
      fields: ['endpoint']
    },
    {
      fields: ['status_code']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['user_id', 'created_at']
    }
  ]
});

// Instance methods
TransactionLog.prototype.isError = function() {
  return this.status_code >= 400;
};

TransactionLog.prototype.isSuccess = function() {
  return this.status_code >= 200 && this.status_code < 400;
};

TransactionLog.prototype.getStatusCategory = function() {
  if (this.status_code >= 500) return 'server_error';
  if (this.status_code >= 400) return 'client_error';
  if (this.status_code >= 300) return 'redirect';
  if (this.status_code >= 200) return 'success';
  return 'informational';
};

// Static methods
TransactionLog.createLog = async function(logData) {
  try {
    return await TransactionLog.create({
      user_id: logData.userId || null,
      email: logData.email || null,
      endpoint: logData.endpoint,
      http_method: logData.method,
      status_code: logData.statusCode,
      error_message: logData.errorMessage || null,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Error creating transaction log:', error);
    // Don't throw error to prevent logging from breaking the main request
    return null;
  }
};

TransactionLog.getLogsByUser = async function(userId, limit = 50, offset = 0) {
  return await TransactionLog.findAndCountAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit: limit,
    offset: offset
  });
};

TransactionLog.getLogsByEmail = async function(email, limit = 50, offset = 0) {
  return await TransactionLog.findAndCountAll({
    where: { email: email },
    order: [['created_at', 'DESC']],
    limit: limit,
    offset: offset
  });
};

TransactionLog.getErrorLogs = async function(userId = null, startDate = null, endDate = null) {
  const where = {
    status_code: {
      [require('sequelize').Op.gte]: 400
    }
  };

  if (userId) {
    where.user_id = userId;
  }

  if (startDate && endDate) {
    where.created_at = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  return await TransactionLog.findAll({
    where,
    order: [['created_at', 'DESC']]
  });
};

TransactionLog.getLogsSummary = async function(userId = null, days = 7) {
  const { Op } = require('sequelize');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const where = {
    created_at: {
      [Op.gte]: startDate
    }
  };

  if (userId) {
    where.user_id = userId;
  }

  const logs = await TransactionLog.findAll({
    where,
    attributes: ['status_code', 'http_method', 'endpoint', 'error_message'],
    order: [['created_at', 'DESC']]
  });

  // Analyze the logs
  const summary = {
    total_requests: logs.length,
    success_count: 0,
    error_count: 0,
    methods: {},
    status_codes: {},
    error_endpoints: {},
    common_errors: {}
  };

  logs.forEach(log => {
    // Count by status
    if (log.status_code >= 400) {
      summary.error_count++;

      // Track error endpoints
      if (!summary.error_endpoints[log.endpoint]) {
        summary.error_endpoints[log.endpoint] = 0;
      }
      summary.error_endpoints[log.endpoint]++;

      // Track common errors
      if (log.error_message) {
        const errorKey = log.error_message.substring(0, 100); // Truncate for grouping
        if (!summary.common_errors[errorKey]) {
          summary.common_errors[errorKey] = 0;
        }
        summary.common_errors[errorKey]++;
      }
    } else {
      summary.success_count++;
    }

    // Count by method
    if (!summary.methods[log.http_method]) {
      summary.methods[log.http_method] = 0;
    }
    summary.methods[log.http_method]++;

    // Count by status code
    if (!summary.status_codes[log.status_code]) {
      summary.status_codes[log.status_code] = 0;
    }
    summary.status_codes[log.status_code]++;
  });

  // Calculate percentages
  summary.success_rate = summary.total_requests > 0
    ? Math.round((summary.success_count / summary.total_requests) * 10000) / 100
    : 0;

  summary.error_rate = summary.total_requests > 0
    ? Math.round((summary.error_count / summary.total_requests) * 10000) / 100
    : 0;

  return summary;
};

TransactionLog.cleanOldLogs = async function(daysToKeep = 90) {
  const { Op } = require('sequelize');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const deletedCount = await TransactionLog.destroy({
    where: {
      created_at: {
        [Op.lt]: cutoffDate
      }
    }
  });

  return deletedCount;
};

module.exports = TransactionLog;