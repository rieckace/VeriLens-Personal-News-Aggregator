const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!user.role) {
      user.role = 'user';
      await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
}

module.exports = { protect, adminOnly };
