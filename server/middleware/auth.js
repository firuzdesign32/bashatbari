const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization token, access denied' });
  }

  // Token is usually "Bearer <token>"
  const parts = authHeader.split(' ');
  const token = parts.length === 2 ? parts[1] : parts[0];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bashatbari_secret_key_123_qwert');
    req.admin = decoded.admin;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};
