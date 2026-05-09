const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

function normalizeEmail(email) {
  return String(email || '').toLowerCase().trim();
}

function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function shouldRegisterAsAdmin(email, adminCode) {
  const adminEmails = parseAdminEmails();
  if (adminEmails.includes(normalizeEmail(email))) return true;

  const code = process.env.ADMIN_REGISTRATION_CODE;
  if (code && adminCode && String(adminCode) === String(code)) return true;

  return false;
}

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign({}, secret, { subject: userId.toString(), expiresIn });
}

async function register(req, res, next) {
  try {
    const { name, email, password, adminCode } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password are required' });
    }

    const normalizedEmail = normalizeEmail(email);

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashed,
      role: shouldRegisterAsAdmin(normalizedEmail, adminCode) ? 'admin' : 'user',
      preferences: [],
      readingHistory: [],
      bookmarks: [],
    });

    const token = signToken(user._id);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { register, login, me };
