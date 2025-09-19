// Simple Investment Routes
const express = require('express');
const router = express.Router();
const {
  getPortfolio,
  getPortfolioSummary,
  createInvestment,
  getInvestmentById,
  cancelInvestment,
  getPortfolioInsights
} = require('../controllers/investmentController');
const { verifyToken } = require('../middleware/auth');

// All investment routes require authentication
router.use(verifyToken);

router.get('/portfolio', getPortfolio);
router.get('/portfolio/summary', getPortfolioSummary);
router.get('/portfolio/insights', getPortfolioInsights);
router.post('/', createInvestment);
router.get('/:id', getInvestmentById);
router.put('/:id/cancel', cancelInvestment);

module.exports = router;