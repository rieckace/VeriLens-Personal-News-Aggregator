const jwt = require('jsonwebtoken');
const User = require('../models/User');

function extractToken(req) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme === 'Bearer' && token) return token;

  // For EventSource-like clients that can't set headers.
  const queryToken = req.query?.token;
  if (queryToken) return String(queryToken);
  return null;
}

async function protectStream(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select('-password');
    if (!user) return res.status(401).json({ message: 'Not authorized' });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
}

module.exports = { protectStream };
