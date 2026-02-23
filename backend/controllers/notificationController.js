const Notification = require('../models/Notification');
const { addClient } = require('../services/notificationRealtime');
const { toDto } = require('../services/notificationService');

async function listNotifications(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const skip = (page - 1) * limit;

    const [items, unreadCount] = await Promise.all([
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    return res.json({
      notifications: items.map(toDto),
      page,
      limit,
      unreadCount,
    });
  } catch (err) {
    return next(err);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    return res.json({ unreadCount });
  } catch (err) {
    return next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const id = req.params.id;
    const doc = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!doc) return res.status(404).json({ message: 'Notification not found' });
    return res.json({ notification: toDto(doc) });
  } catch (err) {
    return next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

function stream(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  // Flush headers (best-effort)
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  addClient(req.user._id, res);
}

module.exports = {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  stream,
};
