// Simple User Routes
const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateRiskAppetite } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// All user routes require authentication
router.use(verifyToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/risk-appetite', updateRiskAppetite);

module.exports = router;