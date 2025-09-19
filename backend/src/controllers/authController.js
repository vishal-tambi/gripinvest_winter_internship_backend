// Simple Auth Controller
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { analyzePasswordStrength } = require('../services/aiService');
const { sendPasswordResetEmail } = require('../services/emailService');

const generateToken = (user) => {
  return jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Signup
const signup = async (req, res) => {
  try {
    const { first_name, last_name, email, password, risk_appetite } = req.body;

    // Basic validation
    if (!first_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    // Create user
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password_hash: password,
      risk_appetite: risk_appetite || 'moderate'
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: { token, user: user.toJSON() }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      data: { token, user: user.toJSON() }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get current user
const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: { user: user.toJSON() } });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.json({ success: true, message: 'Reset instructions sent if email exists' });
    }

    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    await sendPasswordResetEmail(user.email, user.first_name, resetToken);

    res.json({ success: true, message: 'Reset instructions sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and password required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Invalid token' });
    }

    user.password_hash = password;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Invalid or expired token' });
  }
};

// AI Password Analysis
const analyzePassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password required' });
    }

    const analysis = await analyzePasswordStrength(password);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Password analysis error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  signup,
  login,
  me,
  forgotPassword,
  resetPassword,
  analyzePassword
};