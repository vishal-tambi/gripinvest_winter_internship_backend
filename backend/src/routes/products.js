// Simple Product Routes
const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getRecommendations
} = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth');

// Public routes (users can view products)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// AI recommendations (authenticated users only)
router.get('/ai/recommendations', verifyToken, getRecommendations);

// Admin routes (simplified - in real app would check admin role)
router.post('/', verifyToken, createProduct);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

module.exports = router;