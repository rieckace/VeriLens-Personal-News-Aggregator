const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { protectStream } = require('../middleware/streamAuthMiddleware');
const {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  stream,
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/', protect, listNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.post('/read-all', protect, markAllRead);
router.post('/:id/read', protect, markRead);

router.get('/stream', protectStream, stream);

module.exports = router;
