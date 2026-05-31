const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dataStore = require('../config/dataStore');

// @route   GET api/settings
// @desc    Get website layout & texts settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const settings = await dataStore.getSettings();
    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/settings
// @desc    Update website layout & texts settings
// @access  Private (Admin)
router.put('/', auth, async (req, res) => {
  try {
    const updatedSettings = await dataStore.updateSettings(req.body);
    res.json(updatedSettings);
  } catch (err) {
    console.error('Error updating settings:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
