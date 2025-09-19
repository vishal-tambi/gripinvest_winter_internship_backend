const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

// User model - Exact schema from specification
const User = sequelize.define('User', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'First name cannot be empty'
      },
      len: {
        args: [1, 100],
        msg: 'First name must be between 1 and 100 characters'
      }
    }
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Last name must be less than 100 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address'
      },
      notEmpty: {
        msg: 'Email cannot be empty'
      }
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Password hash cannot be empty'
      }
    }
  },
  risk_appetite: {
    type: DataTypes.ENUM('low', 'moderate', 'high'),
    defaultValue: 'moderate',
    allowNull: false,
    validate: {
      isIn: {
        args: [['low', 'moderate', 'high']],
        msg: 'Risk appetite must be low, moderate, or high'
      }
    }
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
  tableName: 'users',
  timestamps: false, // We're handling timestamps manually to match exact schema
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ]
});

// Instance methods
User.prototype.toJSON = function() {
  const user = this.get();
  delete user.password_hash;
  return user;
};

// Hash password before saving
User.addHook('beforeSave', async (user, options) => {
  if (user.changed('password_hash')) {
    const saltRounds = 12;
    user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
  }

  // Update timestamp
  user.updated_at = new Date();
});

// Class methods
User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

// Static method to find by email
User.findByEmail = async function(email) {
  return await User.findOne({ where: { email: email.toLowerCase() } });
};

// Static method for password validation
User.validatePassword = function(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.max(0, Math.min(100,
      password.length * 5 +
      (hasUpperCase ? 15 : 0) +
      (hasLowerCase ? 15 : 0) +
      (hasNumbers ? 15 : 0) +
      (hasSpecialChar ? 20 : 0)
    ))
  };
};

module.exports = User;