// Simple Product Controller
const { InvestmentProduct, User, Investment } = require('../models');
const { generateProductDescription, generateInvestmentRecommendations } = require('../services/aiService');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await InvestmentProduct.findAll({
      order: [['annual_yield', 'DESC']]
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await InvestmentProduct.findByPk(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create product (admin only - simplified check)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      investment_type,
      tenure_months,
      annual_yield,
      risk_level,
      min_investment,
      max_investment,
      description
    } = req.body;

    // Basic validation
    if (!name || !investment_type || !tenure_months || !annual_yield || !risk_level) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const productData = {
      name,
      investment_type,
      tenure_months,
      annual_yield,
      risk_level,
      min_investment: min_investment || 1000,
      max_investment
    };

    // Auto-generate description using AI if not provided
    if (!description) {
      try {
        productData.description = await generateProductDescription(productData);
      } catch (error) {
        console.error('AI description generation failed:', error);
        productData.description = `${name} - ${risk_level} risk ${investment_type} with ${annual_yield}% annual returns.`;
      }
    } else {
      productData.description = description;
    }

    const product = await InvestmentProduct.create(productData);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await InvestmentProduct.findByPk(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.update(req.body);

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await InvestmentProduct.findByPk(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get AI recommendations for user
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [products, currentInvestments] = await Promise.all([
      InvestmentProduct.findAll(),
      Investment.findAll({
        where: { user_id: userId },
        include: [{ model: InvestmentProduct, as: 'product' }]
      })
    ]);

    const recommendations = await generateInvestmentRecommendations(
      user.risk_appetite,
      products,
      currentInvestments
    );

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getRecommendations
};