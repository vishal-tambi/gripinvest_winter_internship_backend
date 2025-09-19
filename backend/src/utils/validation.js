const Joi = require('joi');

/**
 * Simple validation utility using Joi-like syntax
 * @param {Object} data - Data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} - Validation result
 */
const validateInput = (data, rules) => {
  const errors = [];
  const validated = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const ruleArray = rule.split('|');

    let isRequired = false;
    let fieldErrors = [];

    // Check each rule
    for (const singleRule of ruleArray) {
      const [ruleName, ruleValue] = singleRule.split(':');

      switch (ruleName) {
        case 'required':
          isRequired = true;
          if (value === undefined || value === null || value === '') {
            fieldErrors.push(`${field} is required`);
          }
          break;

        case 'string':
          if (value !== undefined && value !== null && typeof value !== 'string') {
            fieldErrors.push(`${field} must be a string`);
          }
          break;

        case 'email':
          if (value && typeof value === 'string') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              fieldErrors.push(`${field} must be a valid email address`);
            }
          }
          break;

        case 'min':
          if (value !== undefined && value !== null) {
            const minValue = parseInt(ruleValue);
            if (typeof value === 'string' && value.length < minValue) {
              fieldErrors.push(`${field} must be at least ${minValue} characters long`);
            } else if (typeof value === 'number' && value < minValue) {
              fieldErrors.push(`${field} must be at least ${minValue}`);
            }
          }
          break;

        case 'max':
          if (value !== undefined && value !== null) {
            const maxValue = parseInt(ruleValue);
            if (typeof value === 'string' && value.length > maxValue) {
              fieldErrors.push(`${field} must not exceed ${maxValue} characters`);
            } else if (typeof value === 'number' && value > maxValue) {
              fieldErrors.push(`${field} must not exceed ${maxValue}`);
            }
          }
          break;

        case 'in':
          if (value !== undefined && value !== null) {
            const allowedValues = ruleValue.split(',');
            if (!allowedValues.includes(value)) {
              fieldErrors.push(`${field} must be one of: ${allowedValues.join(', ')}`);
            }
          }
          break;

        case 'numeric':
          if (value !== undefined && value !== null && !(!isNaN(value) && !isNaN(parseFloat(value)))) {
            fieldErrors.push(`${field} must be a number`);
          }
          break;

        case 'integer':
          if (value !== undefined && value !== null && !Number.isInteger(Number(value))) {
            fieldErrors.push(`${field} must be an integer`);
          }
          break;

        case 'boolean':
          if (value !== undefined && value !== null && typeof value !== 'boolean') {
            fieldErrors.push(`${field} must be a boolean`);
          }
          break;
      }
    }

    // If field is not required and is empty, skip other validations
    if (!isRequired && (value === undefined || value === null || value === '')) {
      validated[field] = value;
      continue;
    }

    // Add field errors to main errors array
    if (fieldErrors.length > 0) {
      errors.push(...fieldErrors);
    } else {
      validated[field] = value;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: validated
  };
};

/**
 * Joi schema validation for complex validations
 */
const createJoiSchema = (schemaDefinition) => {
  return Joi.object(schemaDefinition);
};

// Pre-defined schemas
const schemas = {
  signup: Joi.object({
    first_name: Joi.string().min(1).max(100).required(),
    last_name: Joi.string().max(100).allow('', null),
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(8).max(128).required(),
    risk_appetite: Joi.string().valid('low', 'moderate', 'high').default('moderate')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).max(128).required()
  }),

  createProduct: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    investment_type: Joi.string().valid('bond', 'fd', 'mf', 'etf', 'other').required(),
    tenure_months: Joi.number().integer().min(1).max(600).required(),
    annual_yield: Joi.number().min(0.01).max(99.99).required(),
    risk_level: Joi.string().valid('low', 'moderate', 'high').required(),
    min_investment: Joi.number().min(1.00).required(),
    max_investment: Joi.number().min(1.00).allow(null),
    description: Joi.string().allow('', null)
  }),

  createInvestment: Joi.object({
    product_id: Joi.string().uuid().required(),
    amount: Joi.number().min(1.00).required()
  }),

  updateProfile: Joi.object({
    first_name: Joi.string().min(1).max(100),
    last_name: Joi.string().max(100).allow('', null),
    risk_appetite: Joi.string().valid('low', 'moderate', 'high')
  }),

  updateRiskAppetite: Joi.object({
    risk_appetite: Joi.string().valid('low', 'moderate', 'high').required()
  })
};

/**
 * Validate using pre-defined Joi schemas
 */
const validateWithSchema = (data, schemaName) => {
  const schema = schemas[schemaName];
  if (!schema) {
    throw new Error(`Schema '${schemaName}' not found`);
  }

  const { error, value } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => detail.message);
    return {
      isValid: false,
      errors,
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value
  };
};

/**
 * Sanitize user input
 */
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim();
  }
  return input;
};

/**
 * Validate investment amount against product constraints
 */
const validateInvestmentAmount = (amount, product) => {
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return {
      isValid: false,
      message: 'Investment amount must be a positive number'
    };
  }

  if (numAmount < product.min_investment) {
    return {
      isValid: false,
      message: `Minimum investment required is $${product.min_investment.toLocaleString()}`
    };
  }

  if (product.max_investment && numAmount > product.max_investment) {
    return {
      isValid: false,
      message: `Maximum investment allowed is $${product.max_investment.toLocaleString()}`
    };
  }

  return {
    isValid: true,
    amount: numAmount
  };
};

/**
 * Validate pagination parameters
 */
const validatePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Validate sort parameters
 */
const validateSort = (query, allowedFields) => {
  const sortBy = query.sortBy;
  const sortOrder = query.sortOrder && query.sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  if (sortBy && !allowedFields.includes(sortBy)) {
    return {
      isValid: false,
      message: `Sort field must be one of: ${allowedFields.join(', ')}`
    };
  }

  return {
    isValid: true,
    sortBy: sortBy || allowedFields[0],
    sortOrder
  };
};

module.exports = {
  validateInput,
  createJoiSchema,
  schemas,
  validateWithSchema,
  sanitizeInput,
  validateInvestmentAmount,
  validatePagination,
  validateSort
};