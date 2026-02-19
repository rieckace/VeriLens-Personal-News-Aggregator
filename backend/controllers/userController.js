const User = require('../models/User');

async function getPreferences(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    return res.json({ preferences: user?.preferences || [] });
  } catch (err) {
    return next(err);
  }
}

async function updatePreferences(req, res, next) {
  try {
    const { preferences } = req.body;
    if (!Array.isArray(preferences)) {
      return res.status(400).json({ message: 'preferences must be an array of category strings' });
    }

    const cleaned = preferences
      .map((p) => String(p).trim())
      .filter(Boolean)
      .slice(0, 20);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { preferences: cleaned } },
      { new: true }
    ).select('-password');

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

async function getBookmarks(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks');
    return res.json({ bookmarks: user?.bookmarks || [] });
  } catch (err) {
    return next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate('readingHistory');
    return res.json({ readingHistory: user?.readingHistory || [] });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getPreferences, updatePreferences, getBookmarks, getHistory };
