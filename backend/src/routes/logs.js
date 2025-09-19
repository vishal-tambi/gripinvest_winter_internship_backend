// Simple Log Routes
const express = require('express');
const router = express.Router();
const { getUserLogs, getErrorSummary } = require('../controllers/logController');
const { verifyToken } = require('../middleware/auth');

// All log routes require authentication
router.use(verifyToken);

router.get('/', getUserLogs);
router.get('/error-summary', getErrorSummary);

module.exports = router;