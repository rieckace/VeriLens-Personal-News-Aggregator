const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendToUser } = require('./notificationRealtime');

function toDto(n) {
  return {
    _id: n._id,
    type: n.type,
    title: n.title,
    message: n.message,
    data: n.data,
    isRead: n.isRead,
    readAt: n.readAt,
    createdAt: n.createdAt,
  };
}

async function createNotification(userId, payload) {
  const doc = await Notification.create({
    user: userId,
    type: payload.type || 'article',
    title: payload.title || '',
    message: payload.message,
    data: payload.data || {},
  });

  sendToUser(userId, 'notification', toDto(doc));
  return doc;
}

async function notifyUsersForNewArticle(article) {
  if (!article || !article.category || !article.title) return;

  const enabled = String(process.env.ENABLE_NOTIFICATIONS_ON_FETCH || 'true').toLowerCase() === 'true';
  if (!enabled) return;

  const users = await User.find({ preferences: String(article.category) }).select('_id');
  if (!users.length) return;

  const payload = {
    type: 'article',
    title: 'New article in your interests',
    message: article.title,
    data: {
      articleId: article._id,
      category: article.category,
      url: article.url,
      source: article.source,
    },
  };

  await Promise.all(users.map((u) => createNotification(u._id, payload)));
}

module.exports = { createNotification, notifyUsersForNewArticle, toDto };
