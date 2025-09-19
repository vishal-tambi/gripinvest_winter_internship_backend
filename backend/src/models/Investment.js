const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Investment model - Exact schema from specification
const Investment = sequelize.define('Investment', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  user_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  product_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'investment_products',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: {
        args: [1.00],
        msg: 'Investment amount must be at least $1.00'
      }
    }
  },
  invested_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'matured', 'cancelled'),
    defaultValue: 'active',
    allowNull: false,
    validate: {
      isIn: {
        args: [['active', 'matured', 'cancelled']],
        msg: 'Status must be active, matured, or cancelled'
      }
    }
  },
  expected_return: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  maturity_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'investments',
  timestamps: false, // We're handling timestamps manually to match exact schema
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['product_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['invested_at']
    }
  ]
});

// Hooks
Investment.addHook('beforeCreate', async (investment, options) => {
  const { InvestmentProduct } = require('./index');

  // Get product details to calculate expected return and maturity date
  const product = await InvestmentProduct.findByPk(investment.product_id);

  if (!product) {
    throw new Error('Investment product not found');
  }

  // Validate investment amount
  const validation = product.isValidInvestmentAmount(investment.amount);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  // Calculate expected return
  const returnCalculation = product.calculateExpectedReturn(investment.amount);
  investment.expected_return = returnCalculation.expectedAmount;

  // Calculate maturity date
  const investedDate = new Date(investment.invested_at);
  const maturityDate = new Date(investedDate);
  maturityDate.setMonth(maturityDate.getMonth() + product.tenure_months);
  investment.maturity_date = maturityDate.toISOString().split('T')[0]; // YYYY-MM-DD format
});

// Instance methods
Investment.prototype.getRemainingTenure = function() {
  if (!this.maturity_date || this.status !== 'active') {
    return { days: 0, months: 0, isMatured: true };
  }

  const now = new Date();
  const maturity = new Date(this.maturity_date);
  const diffTime = maturity - now;

  if (diffTime <= 0) {
    return { days: 0, months: 0, isMatured: true };
  }

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);

  return {
    days: diffDays,
    months: diffMonths,
    isMatured: false
  };
};

Investment.prototype.getCurrentValue = function() {
  if (this.status === 'cancelled') {
    return {
      currentValue: parseFloat(this.amount),
      profit: 0,
      profitPercentage: 0
    };
  }

  if (this.status === 'matured') {
    return {
      currentValue: parseFloat(this.expected_return) || parseFloat(this.amount),
      profit: parseFloat(this.expected_return) - parseFloat(this.amount),
      profitPercentage: ((parseFloat(this.expected_return) - parseFloat(this.amount)) / parseFloat(this.amount)) * 100
    };
  }

  // For active investments, calculate pro-rated current value
  const remainingTenure = this.getRemainingTenure();
  if (remainingTenure.isMatured) {
    return {
      currentValue: parseFloat(this.expected_return) || parseFloat(this.amount),
      profit: parseFloat(this.expected_return) - parseFloat(this.amount),
      profitPercentage: ((parseFloat(this.expected_return) - parseFloat(this.amount)) / parseFloat(this.amount)) * 100
    };
  }

  // Pro-rate the return based on time elapsed
  const totalReturn = parseFloat(this.expected_return) - parseFloat(this.amount);
  const elapsedDays = Math.max(0, (new Date() - new Date(this.invested_at)) / (1000 * 60 * 60 * 24));
  const totalDays = Math.max(1, (new Date(this.maturity_date) - new Date(this.invested_at)) / (1000 * 60 * 60 * 24));
  const proRatedReturn = (totalReturn * elapsedDays) / totalDays;

  return {
    currentValue: parseFloat(this.amount) + proRatedReturn,
    profit: proRatedReturn,
    profitPercentage: (proRatedReturn / parseFloat(this.amount)) * 100
  };
};

Investment.prototype.canCancel = function() {
  return this.status === 'active';
};

// Static methods
Investment.findByUserId = async function(userId, includeProduct = false) {
  const options = {
    where: { user_id: userId },
    order: [['invested_at', 'DESC']]
  };

  if (includeProduct) {
    const { InvestmentProduct } = require('./index');
    options.include = [{
      model: InvestmentProduct,
      as: 'product'
    }];
  }

  return await Investment.findAll(options);
};

Investment.getPortfolioSummary = async function(userId) {
  const { InvestmentProduct } = require('./index');

  const investments = await Investment.findAll({
    where: { user_id: userId },
    include: [{
      model: InvestmentProduct,
      as: 'product'
    }]
  });

  const summary = {
    total_investment: 0,
    total_expected_return: 0,
    investment_count: investments.length,
    active_investments: 0,
    risk_distribution: { low: 0, moderate: 0, high: 0 },
    type_distribution: { bond: 0, fd: 0, mf: 0, etf: 0, other: 0 }
  };

  investments.forEach(investment => {
    const amount = parseFloat(investment.amount);
    const expectedReturn = parseFloat(investment.expected_return) || amount;

    summary.total_investment += amount;
    summary.total_expected_return += expectedReturn;

    if (investment.status === 'active') {
      summary.active_investments += 1;
    }

    if (investment.product) {
      // Risk distribution
      summary.risk_distribution[investment.product.risk_level] += amount;

      // Type distribution
      summary.type_distribution[investment.product.investment_type] += amount;
    }
  });

  // Convert distributions to percentages
  if (summary.total_investment > 0) {
    Object.keys(summary.risk_distribution).forEach(key => {
      summary.risk_distribution[key] = Math.round(
        (summary.risk_distribution[key] / summary.total_investment) * 10000
      ) / 100; // Round to 2 decimal places
    });

    Object.keys(summary.type_distribution).forEach(key => {
      summary.type_distribution[key] = Math.round(
        (summary.type_distribution[key] / summary.total_investment) * 10000
      ) / 100; // Round to 2 decimal places
    });
  }

  return summary;
};

module.exports = Investment;