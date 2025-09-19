// Simple Investment Controller
const { Investment, InvestmentProduct, User } = require('../models');
const { generatePortfolioInsights } = require('../services/aiService');

// Get user portfolio
const getPortfolio = async (req, res) => {
  try {
    const investments = await Investment.findAll({
      where: { user_id: req.user.userId },
      include: [{ model: InvestmentProduct, as: 'product' }],
      order: [['invested_at', 'DESC']]
    });

    res.json({
      success: true,
      data: investments
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get portfolio summary
const getPortfolioSummary = async (req, res) => {
  try {
    const summary = await Investment.getPortfolioSummary(req.user.userId);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get portfolio summary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create investment
const createInvestment = async (req, res) => {
  try {
    const { product_id, amount } = req.body;

    if (!product_id || !amount) {
      return res.status(400).json({ success: false, message: 'Product ID and amount required' });
    }

    // Check product exists
    const product = await InvestmentProduct.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Simple amount validation
    if (amount < product.min_investment) {
      return res.status(400).json({
        success: false,
        message: `Minimum investment is $${product.min_investment}`
      });
    }

    if (product.max_investment && amount > product.max_investment) {
      return res.status(400).json({
        success: false,
        message: `Maximum investment is $${product.max_investment}`
      });
    }

    const investment = await Investment.create({
      user_id: req.user.userId,
      product_id,
      amount
    });

    res.status(201).json({
      success: true,
      data: investment
    });
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get investment by ID
const getInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const investment = await Investment.findOne({
      where: { id, user_id: req.user.userId },
      include: [{ model: InvestmentProduct, as: 'product' }]
    });

    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    res.json({
      success: true,
      data: investment
    });
  } catch (error) {
    console.error('Get investment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Cancel investment
const cancelInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const investment = await Investment.findOne({
      where: { id, user_id: req.user.userId }
    });

    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    if (investment.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Can only cancel active investments' });
    }

    await investment.update({ status: 'cancelled' });

    res.json({
      success: true,
      data: investment
    });
  } catch (error) {
    console.error('Cancel investment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get AI portfolio insights
const getPortfolioInsights = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [user, investments] = await Promise.all([
      User.findByPk(userId),
      Investment.findAll({
        where: { user_id: userId },
        include: [{ model: InvestmentProduct, as: 'product' }]
      })
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const insights = await generatePortfolioInsights(investments, user.risk_appetite);

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Get portfolio insights error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getPortfolio,
  getPortfolioSummary,
  createInvestment,
  getInvestmentById,
  cancelInvestment,
  getPortfolioInsights
};