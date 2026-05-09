const User = require('../models/User');

function normalizeEmail(email) {
  return String(email || '').toLowerCase().trim();
}

async function setUserRoleByEmail(req, res, next) {
  try {
    const { email, role } = req.body;

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'email is required' });
    }

    const nextRole = String(role || '').trim();
    if (nextRole !== 'admin' && nextRole !== 'user') {
      return res.status(400).json({ message: "role must be 'admin' or 'user'" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent accidentally removing your own admin access.
    if (String(user._id) === String(req.user._id) && nextRole !== 'admin') {
      return res.status(400).json({ message: 'You cannot remove your own admin role' });
    }

    user.role = nextRole;
    await user.save();

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { setUserRoleByEmail };
