const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// @route   POST api/auth/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (username !== adminUsername || password !== adminPassword) {
    return res.status(400).json({ message: 'Invalid admin credentials' });
  }

  // User matched, sign token
  const payload = {
    admin: {
      username: adminUsername
    }
  };

  jwt.sign(
    payload,
    process.env.JWT_SECRET || 'bashatbari_secret_key_123_qwert',
    { expiresIn: '24h' },
    (err, token) => {
      if (err) throw err;
      res.json({ token });
    }
  );
});

module.exports = router;
