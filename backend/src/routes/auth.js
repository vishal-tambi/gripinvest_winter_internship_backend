// Simple Auth Routes
const express = require('express');
const router = express.Router();
const { signup, login, me, forgotPassword, resetPassword, analyzePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/analyze-password', analyzePassword);

// Protected routes
router.get('/me', verifyToken, me);

module.exports = router;