// Simple User Controller
const { User } = require('../models');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: { user: user.toJSON() }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, risk_appetite } = req.body;
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({
      first_name: first_name || user.first_name,
      last_name: last_name !== undefined ? last_name : user.last_name,
      risk_appetite: risk_appetite || user.risk_appetite
    });

    res.json({
      success: true,
      data: { user: user.toJSON() }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update risk appetite only
const updateRiskAppetite = async (req, res) => {
  try {
    const { risk_appetite } = req.body;

    if (!risk_appetite || !['low', 'moderate', 'high'].includes(risk_appetite)) {
      return res.status(400).json({ success: false, message: 'Valid risk appetite required' });
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({ risk_appetite });

    res.json({
      success: true,
      data: { user: user.toJSON() }
    });
  } catch (error) {
    console.error('Update risk appetite error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateRiskAppetite
};