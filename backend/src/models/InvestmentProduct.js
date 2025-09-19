const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Investment Product model - Exact schema from specification
const InvestmentProduct = sequelize.define('InvestmentProduct', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Product name cannot be empty'
      },
      len: {
        args: [1, 255],
        msg: 'Product name must be between 1 and 255 characters'
      }
    }
  },
  investment_type: {
    type: DataTypes.ENUM('bond', 'fd', 'mf', 'etf', 'other'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['bond', 'fd', 'mf', 'etf', 'other']],
        msg: 'Investment type must be bond, fd, mf, etf, or other'
      }
    }
  },
  tenure_months: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Tenure must be at least 1 month'
      },
      max: {
        args: [600],
        msg: 'Tenure cannot exceed 600 months'
      }
    }
  },
  annual_yield: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'Annual yield must be greater than 0'
      },
      max: {
        args: [99.99],
        msg: 'Annual yield cannot exceed 99.99%'
      }
    }
  },
  risk_level: {
    type: DataTypes.ENUM('low', 'moderate', 'high'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['low', 'moderate', 'high']],
        msg: 'Risk level must be low, moderate, or high'
      }
    }
  },
  min_investment: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 1000.00,
    allowNull: false,
    validate: {
      min: {
        args: [1.00],
        msg: 'Minimum investment must be at least $1.00'
      }
    }
  },
  max_investment: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: {
        args: [1.00],
        msg: 'Maximum investment must be at least $1.00'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'investment_products',
  timestamps: false, // We're handling timestamps manually to match exact schema
  indexes: [
    {
      fields: ['investment_type']
    },
    {
      fields: ['risk_level']
    },
    {
      fields: ['annual_yield']
    }
  ]
});

// Hooks
InvestmentProduct.addHook('beforeSave', async (product, options) => {
  // Validate max_investment > min_investment
  if (product.max_investment && product.max_investment <= product.min_investment) {
    throw new Error('Maximum investment must be greater than minimum investment');
  }

  // Update timestamp
  product.updated_at = new Date();
});

// Instance methods
InvestmentProduct.prototype.calculateExpectedReturn = function(investmentAmount, customTenure = null) {
  const tenure = customTenure || this.tenure_months;
  const annualReturn = (investmentAmount * parseFloat(this.annual_yield)) / 100;
  const monthlyReturn = annualReturn / 12;
  const totalReturn = monthlyReturn * tenure;

  return {
    principal: parseFloat(investmentAmount),
    totalReturn: Math.round(totalReturn * 100) / 100,
    expectedAmount: Math.round((investmentAmount + totalReturn) * 100) / 100,
    monthlyReturn: Math.round(monthlyReturn * 100) / 100
  };
};

InvestmentProduct.prototype.isValidInvestmentAmount = function(amount) {
  const numAmount = parseFloat(amount);

  if (numAmount < this.min_investment) {
    return {
      valid: false,
      message: `Minimum investment required is $${this.min_investment.toLocaleString()}`
    };
  }

  if (this.max_investment && numAmount > this.max_investment) {
    return {
      valid: false,
      message: `Maximum investment allowed is $${this.max_investment.toLocaleString()}`
    };
  }

  return { valid: true };
};

// Static methods
InvestmentProduct.findByType = async function(investmentType) {
  return await InvestmentProduct.findAll({
    where: { investment_type: investmentType },
    order: [['annual_yield', 'DESC']]
  });
};

InvestmentProduct.findByRiskLevel = async function(riskLevel) {
  return await InvestmentProduct.findAll({
    where: { risk_level: riskLevel },
    order: [['annual_yield', 'DESC']]
  });
};

InvestmentProduct.getTopPerformers = async function(limit = 5) {
  return await InvestmentProduct.findAll({
    order: [['annual_yield', 'DESC']],
    limit: limit
  });
};

InvestmentProduct.searchProducts = async function(filters = {}) {
  const where = {};

  if (filters.investment_type) {
    where.investment_type = filters.investment_type;
  }

  if (filters.risk_level) {
    where.risk_level = filters.risk_level;
  }

  if (filters.min_yield) {
    where.annual_yield = {
      [require('sequelize').Op.gte]: filters.min_yield
    };
  }

  if (filters.max_investment_amount) {
    where.min_investment = {
      [require('sequelize').Op.lte]: filters.max_investment_amount
    };
  }

  return await InvestmentProduct.findAll({
    where,
    order: [
      ['annual_yield', 'DESC'],
      ['name', 'ASC']
    ]
  });
};

module.exports = InvestmentProduct;